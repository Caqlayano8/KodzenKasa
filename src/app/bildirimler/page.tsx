import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { NotificationActions } from "./NotificationActions";

export const metadata = { title: "Bildirimler - KodzenKasa" };

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bildirimler</h1>
        <NotificationActions />
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bildirim yok</h3>
            <p className="text-gray-500">Henüz bildiriminiz bulunmuyor</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                notification.read ? "border-gray-100" : "border-blue-200 bg-blue-50/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                notification.type === "message"
                  ? "bg-blue-100 text-blue-600"
                  : notification.type === "favorite"
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {notification.type === "message" ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                ) : notification.type === "favorite" ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-gray-900 text-sm">{notification.title}</h3>
                  <span className="text-xs text-gray-400 shrink-0">{timeAgo(notification.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{notification.content}</p>
                {notification.link && (
                  <Link href={notification.link} className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block">
                    Görüntüle →
                  </Link>
                )}
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
