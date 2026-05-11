"use client";

import { useState } from "react";
import { sendSystemNotificationAction, deleteNotificationAction } from "@/app/actions/admin";

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
  user: { name: string; email: string };
}

const typeLabels: Record<string, string> = {
  message: "Mesaj",
  favorite: "Favori",
  property_update: "Ilan",
  system: "Sistem",
};

export function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showSend, setShowSend] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showMsg(text: string, type: "success" | "error" = "success") {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleSend(formData: FormData) {
    const result = await sendSystemNotificationAction(formData);
    if ("success" in result && result.success) {
      showMsg(result.success);
      setShowSend(false);
      window.location.reload();
    } else if ("error" in result && result.error) {
      showMsg(result.error, "error");
    }
  }

  async function handleDelete(notificationId: string) {
    const result = await deleteNotificationAction(notificationId);
    if ("success" in result && result.success) {
      setNotifications(notifications.filter((n) => n.id !== notificationId));
      showMsg(result.success);
    }
  }

  return (
    <>
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowSend(!showSend)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Toplu Bildirim Gonder
        </button>
      </div>

      {showSend && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sistem Bildirimi Gonder</h2>
          <form action={handleSend} className="space-y-4">
            <input
              name="title"
              placeholder="Bildirim Basligi"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="content"
              placeholder="Bildirim Icerigi"
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-4">
              <select name="targetRole" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="all">Tum Kullanicilar</option>
                <option value="user">Sadece Alicilar</option>
                <option value="agent">Sadece Saticilar</option>
                <option value="admin">Sadece Yoneticiler</option>
              </select>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Gonder
              </button>
              <button type="button" onClick={() => setShowSend(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Iptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Baslik</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icerik</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanici</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Islem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {notifications.map((notif) => (
                <tr key={notif.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      notif.type === "system" ? "bg-purple-100 text-purple-700" :
                      notif.type === "message" ? "bg-blue-100 text-blue-700" :
                      notif.type === "favorite" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {typeLabels[notif.type] || notif.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{notif.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{notif.content}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{notif.user.name}</p>
                    <p className="text-xs text-gray-500">{notif.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${notif.read ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {notif.read ? "Okundu" : "Okunmadi"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(notif.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Toplam {notifications.length} bildirim
        </div>
      </div>
    </>
  );
}
