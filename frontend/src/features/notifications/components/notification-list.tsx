
import type { Notification } from "../types";

interface NotificationListProps {
  notifications: Notification[];
}

function getNotificationLabel(type: Notification["notification_type"]) {
  switch (type) {
    case "credit_added":
      return "Credit Added";
    case "payment_received":
      return "Payment Received";
    case "balance_updated":
      return "Balance Updated";
    case "payment_reminder":
      return "Payment Reminder";
    default:
      return "Notification";
  }
}

function getNotificationStyle(type: Notification["notification_type"]) {
  switch (type) {
    case "credit_added":
      return "bg-amber-100 text-amber-700";
    case "payment_received":
      return "bg-green-100 text-green-700";
    case "balance_updated":
      return "bg-blue-100 text-blue-700";
    case "payment_reminder":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function NotificationList({
  notifications,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-medium text-slate-700">
          No notifications yet
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Your shop notifications will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {notifications.map((notification) => (
        <article
          key={notification.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getNotificationStyle(
                notification.notification_type
              )}`}
            >
              {getNotificationLabel(notification.notification_type)}
            </span>

            <span className="text-xs text-slate-500">
              {formatDate(notification.created_at)}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-800">
            {notification.message}
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-500">
              Delivery status
            </span>

            <span className="text-xs font-semibold capitalize text-slate-600">
              {notification.status === "pending"
                ? "Pending delivery"
                : notification.status}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}
