"use server";

import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, destroySession, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as string || "user";

  if (!name || !email || !password) {
    return { error: "Tüm alanları doldurunuz" };
  }

  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır" };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Bu e-posta adresi zaten kayıtlı" };
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role,
    },
  });

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  });

  redirect("/");
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const twoFactorCode = formData.get("twoFactorCode") as string;

  if (!email || !password) {
    return { error: "E-posta ve şifre gereklidir" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Geçersiz e-posta veya şifre" };
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { error: "Geçersiz e-posta veya şifre" };
  }

  if (user.twoFactorEnabled) {
    if (!twoFactorCode) {
      return { requires2FA: true };
    }
    const otplib = await import("otplib");
    const result = otplib.verifySync({
      secret: user.twoFactorSecret!,
      token: twoFactorCode,
    });
    if (!result.valid) {
      return { error: "Geçersiz doğrulama kodu", requires2FA: true };
    }
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  });

  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/giris");
}

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const bio = formData.get("bio") as string;
  const city = formData.get("city") as string;

  await prisma.user.update({
    where: { id: session.id },
    data: {
      name: name || undefined,
      phone: phone || null,
      bio: bio || null,
      city: city || null,
    },
  });

  const updatedUser = await prisma.user.findUnique({ where: { id: session.id } });
  if (updatedUser) {
    await createSession({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    });
  }

  revalidatePath("/profil");
  return { success: "Profil güncellendi" };
}

export async function changePasswordAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    return { error: "Tüm alanları doldurunuz" };
  }

  if (newPassword.length < 6) {
    return { error: "Yeni şifre en az 6 karakter olmalıdır" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return { error: "Kullanıcı bulunamadı" };

  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) return { error: "Mevcut şifre yanlış" };

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: session.id },
    data: { password: hashedPassword },
  });

  return { success: "Şifre değiştirildi" };
}

export async function enable2FAAction() {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const otplib = await import("otplib");
  const { generateTOTP } = await import("@otplib/uri");
  const secret = otplib.generateSecret();
  const otpauth = generateTOTP({ label: session.email, secret, issuer: "KodzenKasa" });

  await prisma.user.update({
    where: { id: session.id },
    data: { twoFactorSecret: secret },
  });

  return { secret, otpauth };
}

export async function verify2FAAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const code = formData.get("code") as string;
  if (!code) return { error: "Doğrulama kodu gereklidir" };

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user?.twoFactorSecret) return { error: "2FA ayarlanmamış" };

  const otplib = await import("otplib");
  const result = otplib.verifySync({
    token: code,
    secret: user.twoFactorSecret,
  });

  if (!result.valid) return { error: "Geçersiz doğrulama kodu" };

  await prisma.user.update({
    where: { id: session.id },
    data: { twoFactorEnabled: true },
  });

  revalidatePath("/profil");
  return { success: "İki faktörlü doğrulama etkinleştirildi" };
}

export async function disable2FAAction() {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  await prisma.user.update({
    where: { id: session.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  revalidatePath("/profil");
  return { success: "İki faktörlü doğrulama devre dışı bırakıldı" };
}

export async function uploadAvatarAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const file = formData.get("avatar") as File;
  if (!file) return { error: "Dosya seçiniz" };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `avatar-${session.id}-${Date.now()}.${file.name.split(".").pop()}`;

  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  const avatarUrl = `/uploads/avatars/${fileName}`;
  await prisma.user.update({
    where: { id: session.id },
    data: { avatar: avatarUrl },
  });

  await createSession({
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role,
    avatar: avatarUrl,
  });

  revalidatePath("/profil");
  return { success: "Profil resmi güncellendi", avatar: avatarUrl };
}
