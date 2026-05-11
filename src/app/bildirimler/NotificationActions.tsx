"use client";

import { markAllNotificationsReadAction } from "@/app/actions/notification";

export function NotificationActions() {
  const handleMarkAll = async () => {
    await markAllNotificationsReadAction();
  };

  return (
    <button
      onClick={handleMarkAll}
      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
    >
      Tümünü okundu işaretle
    </button>
  );
}
