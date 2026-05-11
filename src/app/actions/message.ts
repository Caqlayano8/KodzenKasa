"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  const content = formData.get("content") as string;
  const receiverId = formData.get("receiverId") as string;
  const propertyId = formData.get("propertyId") as string | null;

  if (!content || !receiverId) {
    return { error: "Mesaj ve alıcı gereklidir" };
  }

  const message = await prisma.message.create({
    data: {
      content,
      senderId: session.id,
      receiverId,
      propertyId: propertyId || null,
    },
  });

  await prisma.notification.create({
    data: {
      type: "message",
      title: "Yeni Mesaj",
      content: `${session.name}: ${content.substring(0, 100)}`,
      link: `/mesajlar?user=${session.id}`,
      userId: receiverId,
    },
  });

  revalidatePath("/mesajlar");
  return { success: true, message };
}

export async function markMessagesReadAction(senderId: string) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor" };

  await prisma.message.updateMany({
    where: {
      senderId,
      receiverId: session.id,
      read: false,
    },
    data: { read: true },
  });

  revalidatePath("/mesajlar");
  return { success: true };
}

export async function getConversationsAction() {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor", conversations: [] };

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.id }, { receiverId: session.id }],
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      property: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const conversationMap = new Map<string, typeof messages[0]>();
  for (const msg of messages) {
    const otherUserId = msg.senderId === session.id ? msg.receiverId : msg.senderId;
    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, msg);
    }
  }

  return { conversations: Array.from(conversationMap.values()) };
}

export async function getMessagesWithUserAction(otherUserId: string) {
  const session = await getSession();
  if (!session) return { error: "Oturum açmanız gerekiyor", messages: [] };

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: session.id },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      property: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark received messages as read
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: session.id,
      read: false,
    },
    data: { read: true },
  });

  return { messages };
}
