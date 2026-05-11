"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Yetkisiz erisim");
  }
  return session;
}

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  return settings;
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();

  const data: Record<string, string | boolean> = {};
  const fields = [
    "siteName", "siteDescription", "primaryColor", "secondaryColor", "accentColor",
    "headerBg", "footerBg", "fontFamily", "whatsappNumber", "whatsappMessage",
    "contactEmail", "contactPhone", "contactAddress", "footerText", "metaKeywords",
    "socialFacebook", "socialTwitter", "socialInstagram", "socialYoutube",
  ];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) {
      data[field] = value as string;
    }
  }

  data.whatsappEnabled = formData.get("whatsappEnabled") === "true";

  // Handle logo upload
  const logoFile = formData.get("logo") as File;
  if (logoFile && logoFile.size > 0) {
    const bytes = await logoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = logoFile.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${ext}`;

    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "site");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);
    data.logoUrl = `/uploads/site/${fileName}`;
  }

  // Handle favicon upload
  const faviconFile = formData.get("favicon") as File;
  if (faviconFile && faviconFile.size > 0) {
    const bytes = await faviconFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = faviconFile.name.split(".").pop();
    const fileName = `favicon-${Date.now()}.${ext}`;

    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "site");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);
    data.faviconUrl = `/uploads/site/${fileName}`;
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar");
  return { success: "Site ayarlari guncellendi" };
}

// Advertisement management
export async function getAdvertisements() {
  return prisma.advertisement.findMany({ orderBy: [{ position: "asc" }, { order: "asc" }] });
}

export async function createAdvertisementAction(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const linkUrl = formData.get("linkUrl") as string;
  const position = formData.get("position") as string;
  const order = parseInt(formData.get("order") as string) || 0;

  if (!title || !position) {
    return { error: "Baslik ve konum zorunludur" };
  }

  let imageUrl = "";
  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = imageFile.name.split(".").pop();
    const fileName = `ad-${Date.now()}.${ext}`;

    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "ads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);
    imageUrl = `/uploads/ads/${fileName}`;
  } else {
    return { error: "Reklam gorseli zorunludur" };
  }

  await prisma.advertisement.create({
    data: { title, imageUrl, linkUrl: linkUrl || null, position, order },
  });

  revalidatePath("/admin/reklamlar");
  return { success: "Reklam eklendi" };
}

export async function updateAdvertisementAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const linkUrl = formData.get("linkUrl") as string;
  const position = formData.get("position") as string;
  const isActive = formData.get("isActive") === "true";
  const order = parseInt(formData.get("order") as string) || 0;

  const data: Record<string, unknown> = { title, linkUrl: linkUrl || null, position, isActive, order };

  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = imageFile.name.split(".").pop();
    const fileName = `ad-${Date.now()}.${ext}`;

    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "ads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);
    data.imageUrl = `/uploads/ads/${fileName}`;
  }

  await prisma.advertisement.update({ where: { id }, data });

  revalidatePath("/admin/reklamlar");
  return { success: "Reklam guncellendi" };
}

export async function deleteAdvertisementAction(id: string) {
  await requireAdmin();
  await prisma.advertisement.delete({ where: { id } });
  revalidatePath("/admin/reklamlar");
  return { success: "Reklam silindi" };
}

export async function toggleAdvertisementAction(id: string) {
  await requireAdmin();
  const ad = await prisma.advertisement.findUnique({ where: { id }, select: { isActive: true } });
  if (!ad) return { error: "Reklam bulunamadi" };
  await prisma.advertisement.update({ where: { id }, data: { isActive: !ad.isActive } });
  revalidatePath("/admin/reklamlar");
  return { success: ad.isActive ? "Reklam devre disi birakildi" : "Reklam aktif edildi" };
}

// Custom Page management
export async function getCustomPages() {
  return prisma.customPage.findMany({ orderBy: { order: "asc" } });
}

export async function createCustomPageAction(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const showInNav = formData.get("showInNav") === "true";
  const showInFooter = formData.get("showInFooter") === "true";
  const order = parseInt(formData.get("order") as string) || 0;

  if (!title || !slug || !content) {
    return { error: "Baslik, slug ve icerik zorunludur" };
  }

  const existing = await prisma.customPage.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Bu slug zaten kullaniliyor" };
  }

  await prisma.customPage.create({
    data: { title, slug, content, showInNav, showInFooter, order, isPublished: true },
  });

  revalidatePath("/admin/sayfalar");
  revalidatePath("/", "layout");
  return { success: "Sayfa olusturuldu" };
}

export async function updateCustomPageAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "true";
  const showInNav = formData.get("showInNav") === "true";
  const showInFooter = formData.get("showInFooter") === "true";
  const order = parseInt(formData.get("order") as string) || 0;

  await prisma.customPage.update({
    where: { id },
    data: { title, slug, content, isPublished, showInNav, showInFooter, order },
  });

  revalidatePath("/admin/sayfalar");
  revalidatePath("/", "layout");
  return { success: "Sayfa guncellendi" };
}

export async function deleteCustomPageAction(id: string) {
  await requireAdmin();
  await prisma.customPage.delete({ where: { id } });
  revalidatePath("/admin/sayfalar");
  revalidatePath("/", "layout");
  return { success: "Sayfa silindi" };
}

export async function togglePagePublishAction(id: string) {
  await requireAdmin();
  const page = await prisma.customPage.findUnique({ where: { id }, select: { isPublished: true } });
  if (!page) return { error: "Sayfa bulunamadi" };
  await prisma.customPage.update({ where: { id }, data: { isPublished: !page.isPublished } });
  revalidatePath("/admin/sayfalar");
  return { success: page.isPublished ? "Sayfa yayindan kaldirildi" : "Sayfa yayinlandi" };
}
