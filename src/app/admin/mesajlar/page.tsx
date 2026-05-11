import { getAdminMessages } from "@/app/actions/admin";
import { MessagesClient } from "./MessagesClient";

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mesaj Yonetimi</h1>
      <MessagesClient initialMessages={messages} />
    </div>
  );
}
