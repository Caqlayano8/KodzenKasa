"use client";

import { useState } from "react";
import { deleteMessageAction } from "@/app/actions/admin";

interface Message {
  id: string;
  content: string;
  read: boolean;
  createdAt: Date;
  sender: { name: string; email: string };
  receiver: { name: string; email: string };
  property: { title: string } | null;
}

export function MessagesClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = messages.filter(
    (m) =>
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.sender.name.toLowerCase().includes(search.toLowerCase()) ||
      m.receiver.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(messageId: string) {
    if (!confirm("Bu mesaji silmek istediginize emin misiniz?")) return;
    const result = await deleteMessageAction(messageId);
    if ("success" in result && result.success) {
      setMessages(messages.filter((m) => m.id !== messageId));
      setMessage({ type: "success", text: result.success });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <>
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <input
        type="text"
        placeholder="Mesaj ara (icerik, gonderen, alici)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gonderen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alici</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mesaj</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ilan</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Islem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{msg.sender.name}</p>
                    <p className="text-xs text-gray-500">{msg.sender.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{msg.receiver.name}</p>
                    <p className="text-xs text-gray-500">{msg.receiver.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700 max-w-xs truncate">{msg.content}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-500 max-w-[150px] truncate">{msg.property?.title || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${msg.read ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {msg.read ? "Okundu" : "Okunmadi"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(msg.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Toplam {filtered.length} mesaj
        </div>
      </div>
    </>
  );
}
