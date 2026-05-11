"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPropertyAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const type = formData.get("type") as string;
  const category = formData.get("category") as string;
  const city = formData.get("city") as string;
  const district = formData.get("district") as string;
  const neighborhood = formData.get("neighborhood") as string;
  const address = formData.get("address") as string;
  const area = formData.get("area") ? parseFloat(formData.get("area") as string) : null;
  const rooms = formData.get("rooms") as string;
  const bathrooms = formData.get("bathrooms") ? parseInt(formData.get("bathrooms") as string) : null;
  const floor = formData.get("floor") ? parseInt(formData.get("floor") as string) : null;
  const totalFloors = formData.get("totalFloors") ? parseInt(formData.get("totalFloors") as string) : null;
  const buildingAge = formData.get("buildingAge") ? parseInt(formData.get("buildingAge") as string) : null;
  const heating = formData.get("heating") as string;
  const furnished = formData.get("furnished") === "true";
  const parking = formData.get("parking") === "true";
  const elevator = formData.get("elevator") === "true";
  const balcony = formData.get("balcony") === "true";
  const garden = formData.get("garden") === "true";
  const pool = formData.get("pool") === "true";
  const security = formData.get("security") === "true";

  if (!title || !description || !price || !type || !category || !city || !district) {
    return { error: "Zorunlu alanları doldurunuz" };
  }

  const property = await prisma.property.create({
    data: {
      title,
      description,
      price,
      type,
      category,
      city,
      district,
      neighborhood: neighborhood || null,
      address: address || null,
      area,
      rooms: rooms || null,
      bathrooms,
      floor,
      totalFloors,
      buildingAge,
      heating: heating || null,
      furnished,
      parking,
      elevator,
      balcony,
      garden,
      pool,
      security,
      userId: session.id,
    },
  });

  // Handle image uploads
  const files = formData.getAll("images") as File[];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size === 0) continue;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop();
    const isVideo = file.type.startsWith("video/");
    const fileName = `property-${property.id}-${i}-${Date.now()}.${ext}`;

    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    await prisma.propertyImage.create({
      data: {
        url: `/uploads/properties/${fileName}`,
        isVideo,
        order: i,
        propertyId: property.id,
      },
    });
  }

  revalidatePath("/ilanlar");
  redirect(`/ilan/${property.id}`);
}

export async function updatePropertyAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const id = formData.get("id") as string;
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property || (property.userId !== session.id && session.role !== "admin")) {
    return { error: "Bu işlem için yetkiniz yok" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const type = formData.get("type") as string;
  const category = formData.get("category") as string;
  const city = formData.get("city") as string;
  const district = formData.get("district") as string;
  const status = formData.get("status") as string;

  await prisma.property.update({
    where: { id },
    data: {
      title: title || undefined,
      description: description || undefined,
      price: price || undefined,
      type: type || undefined,
      category: category || undefined,
      city: city || undefined,
      district: district || undefined,
      status: status || undefined,
      area: formData.get("area") ? parseFloat(formData.get("area") as string) : undefined,
      rooms: (formData.get("rooms") as string) || undefined,
      bathrooms: formData.get("bathrooms") ? parseInt(formData.get("bathrooms") as string) : undefined,
      floor: formData.get("floor") ? parseInt(formData.get("floor") as string) : undefined,
      totalFloors: formData.get("totalFloors") ? parseInt(formData.get("totalFloors") as string) : undefined,
      buildingAge: formData.get("buildingAge") ? parseInt(formData.get("buildingAge") as string) : undefined,
      heating: (formData.get("heating") as string) || undefined,
      furnished: formData.get("furnished") === "true",
      parking: formData.get("parking") === "true",
      elevator: formData.get("elevator") === "true",
      balcony: formData.get("balcony") === "true",
      garden: formData.get("garden") === "true",
      pool: formData.get("pool") === "true",
      security: formData.get("security") === "true",
    },
  });

  // Handle new image uploads
  const files = formData.getAll("images") as File[];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size === 0) continue;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop();
    const isVideo = file.type.startsWith("video/");
    const fileName = `property-${id}-${Date.now()}-${i}.${ext}`;

    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    await prisma.propertyImage.create({
      data: {
        url: `/uploads/properties/${fileName}`,
        isVideo,
        order: i,
        propertyId: id,
      },
    });
  }

  revalidatePath(`/ilan/${id}`);
  revalidatePath("/ilanlar");
  return { success: "İlan güncellendi" };
}

export async function deletePropertyAction(id: string) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property || (property.userId !== session.id && session.role !== "admin")) {
    return { error: "Bu işlem için yetkiniz yok" };
  }

  await prisma.property.delete({ where: { id } });
  revalidatePath("/ilanlar");
  revalidatePath("/profil");
  return { success: "İlan silindi" };
}

export async function toggleFavoriteAction(propertyId: string) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId: session.id, propertyId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/ilanlar");
    return { favorited: false };
  } else {
    await prisma.favorite.create({
      data: { userId: session.id, propertyId },
    });

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { title: true, userId: true },
    });

    if (property && property.userId !== session.id) {
      await prisma.notification.create({
        data: {
          type: "favorite",
          title: "Yeni Favori",
          content: `${session.name} ilanınızı favorilere ekledi: ${property.title}`,
          link: `/ilan/${propertyId}`,
          userId: property.userId,
        },
      });
    }

    revalidatePath("/ilanlar");
    return { favorited: true };
  }
}

export async function deletePropertyImageAction(imageId: string) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
    include: { property: { select: { userId: true, id: true } } },
  });

  if (!image || (image.property.userId !== session.id && session.role !== "admin")) {
    return { error: "Bu işlem için yetkiniz yok" };
  }

  await prisma.propertyImage.delete({ where: { id: imageId } });
  revalidatePath(`/ilan/${image.property.id}`);
  return { success: "Görsel silindi" };
}
