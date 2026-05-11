import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MessagesClient } from "./MessagesClient";

export const metadata = { title: "Mesajlar - KodzenKasa" };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/giris");

  const params = await searchParams;

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

  // Group by conversation partner
  const conversationMap = new Map<
    string,
    {
      user: { id: string; name: string; avatar: string | null };
      lastMessage: (typeof messages)[0];
      unreadCount: number;
    }
  >();

  for (const msg of messages) {
    const otherUser =
      msg.senderId === session.id
        ? msg.receiver
        : msg.sender;

    if (!conversationMap.has(otherUser.id)) {
      conversationMap.set(otherUser.id, {
        user: otherUser,
        lastMessage: msg,
        unreadCount: 0,
      });
    }
    if (msg.receiverId === session.id && !msg.read) {
      const conv = conversationMap.get(otherUser.id)!;
      conv.unreadCount++;
    }
  }

  const conversations = Array.from(conversationMap.values());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Mesajlar</h1>
      <MessagesClient
        conversations={conversations}
        currentUserId={session.id}
        selectedUserId={params.user}
      />
    </div>
  );
}
