"use server";

import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Yetkisiz erişim");
  }
  return session;
}

// Dashboard stats
export async function getAdminStats() {
  await requireAdmin();

  const [
    totalUsers,
    totalProperties,
    activeProperties,
    totalMessages,
    totalNotifications,
    totalFavorites,
    recentUsers,
    recentProperties,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.property.count({ where: { status: "active" } }),
    prisma.message.count(),
    prisma.notification.count(),
    prisma.favorite.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  const propertiesByType = await prisma.property.groupBy({
    by: ["type"],
    _count: { id: true },
  });

  const propertiesByStatus = await prisma.property.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const propertiesByCategory = await prisma.property.groupBy({
    by: ["category"],
    _count: { id: true },
  });

  return {
    totalUsers,
    totalProperties,
    activeProperties,
    totalMessages,
    totalNotifications,
    totalFavorites,
    recentUsers,
    recentProperties,
    usersByRole,
    propertiesByType,
    propertiesByStatus,
    propertiesByCategory,
  };
}

// User management
export async function getAdminUsers(search?: string) {
  await requireAdmin();

  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      city: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: true,
      _count: {
        select: {
          properties: true,
          sentMessages: true,
          favorites: true,
        },
      },
    },
  });
}

export async function updateUserRoleAction(userId: string, role: string) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/kullanicilar");
  return { success: "Kullanıcı rolü güncellendi" };
}

export async function deleteUserAction(userId: string) {
  const session = await requireAdmin();

  if (userId === session.id) {
    return { error: "Kendinizi silemezsiniz" };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/kullanicilar");
  return { success: "Kullanıcı silindi" };
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const phone = formData.get("phone") as string;

  if (!name || !email || !password) {
    return { error: "Ad, e-posta ve şifre zorunludur" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Bu e-posta adresi zaten kayıtlı" };
  }

  const hashedPassword = await hashPassword(password);
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: role || "user",
    },
  });

  revalidatePath("/admin/kullanicilar");
  return { success: "Kullanıcı oluşturuldu" };
}

// Property management
export async function getAdminProperties(search?: string, status?: string) {
  await requireAdmin();

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { city: { contains: search } },
    ];
  }
  if (status && status !== "all") {
    where.status = status;
  }

  return prisma.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      images: { take: 1 },
      _count: { select: { favorites: true, messages: true } },
    },
  });
}

export async function updatePropertyStatusAction(propertyId: string, status: string) {
  await requireAdmin();

  await prisma.property.update({
    where: { id: propertyId },
    data: { status },
  });

  revalidatePath("/admin/ilanlar");
  return { success: "İlan durumu güncellendi" };
}

export async function togglePropertyFeaturedAction(propertyId: string) {
  await requireAdmin();

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { featured: true },
  });

  if (!property) return { error: "İlan bulunamadı" };

  await prisma.property.update({
    where: { id: propertyId },
    data: { featured: !property.featured },
  });

  revalidatePath("/admin/ilanlar");
  return { success: property.featured ? "Öne çıkarmadan kaldırıldı" : "Öne çıkarıldı" };
}

export async function adminDeletePropertyAction(propertyId: string) {
  await requireAdmin();

  await prisma.property.delete({ where: { id: propertyId } });

  revalidatePath("/admin/ilanlar");
  return { success: "İlan silindi" };
}

// Message management
export async function getAdminMessages() {
  await requireAdmin();

  return prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      sender: { select: { name: true, email: true } },
      receiver: { select: { name: true, email: true } },
      property: { select: { title: true } },
    },
  });
}

export async function deleteMessageAction(messageId: string) {
  await requireAdmin();

  await prisma.message.delete({ where: { id: messageId } });

  revalidatePath("/admin/mesajlar");
  return { success: "Mesaj silindi" };
}

// Notification management
export async function getAdminNotifications() {
  await requireAdmin();

  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
    },
  });
}

export async function sendSystemNotificationAction(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const targetRole = formData.get("targetRole") as string;

  if (!title || !content) {
    return { error: "Başlık ve içerik zorunludur" };
  }

  const where: Record<string, unknown> = {};
  if (targetRole && targetRole !== "all") {
    where.role = targetRole;
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  });

  for (const user of users) {
    await prisma.notification.create({
      data: {
        type: "system",
        title,
        content,
        userId: user.id,
      },
    });
  }

  revalidatePath("/admin/bildirimler");
  return { success: `${users.length} kullanıcıya bildirim gönderildi` };
}

export async function deleteNotificationAction(notificationId: string) {
  await requireAdmin();

  await prisma.notification.delete({ where: { id: notificationId } });

  revalidatePath("/admin/bildirimler");
  return { success: "Bildirim silindi" };
}
