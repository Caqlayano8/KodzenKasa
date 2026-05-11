import { getAdminNotifications } from "@/app/actions/admin";
import { NotificationsClient } from "./NotificationsClient";

export default async function AdminNotificationsPage() {
  const notifications = await getAdminNotifications();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Bildirim Yonetimi</h1>
      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
