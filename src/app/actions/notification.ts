"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction() {
  const session = await getSession();
  if (!session) return { notifications: [], unreadCount: 0 };

  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.id, read: false },
  });

  return { notifications, unreadCount };
}

export async function markNotificationReadAction(id: string) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  await prisma.notification.update({
    where: { id, userId: session.id },
    data: { read: true },
  });

  revalidatePath("/bildirimler");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  await prisma.notification.updateMany({
    where: { userId: session.id, read: false },
    data: { read: true },
  });

  revalidatePath("/bildirimler");
  return { success: true };
}

export async function getUnreadCountAction() {
  const session = await getSession();
  if (!session) return 0;

  return prisma.notification.count({
    where: { userId: session.id, read: false },
  });
}
