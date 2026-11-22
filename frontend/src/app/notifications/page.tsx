
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/features/auth/auth-context";
import { getNotifications } from "@/features/notifications/notification-api";
import NotificationList from "@/features/notifications/components/notification-list";

import type { Notification } from "@/features/notifications/types";

type NotificationFilter = "all" | "credits" | "payments" | "reminders";

const FILTERS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "credits", label: "Credits" },
  { value: "payments", label: "Payments" },
  { value: "reminders", label: "Reminders" },
];

export default function NotificationsPage() {
  const router = useRouter();

  const { token, isLoading: authLoading, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<NotificationFilter>("all");

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case "credits":
        return notifications.filter(
          (item) =>
            item.notification_type === "credit_added" ||
            item.notification_type === "balance_updated"
        );

      case "payments":
        return notifications.filter(
          (item) => item.notification_type === "payment_received"
        );

      case "reminders":
        return notifications.filter(
          (item) => item.notification_type === "payment_reminder"
        );

      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !token) {
      router.replace("/login");
      return;
    }

    let active = true;

    async function loadNotifications() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getNotifications(token!, {
          skip: 0,
          limit: 50,
        });

        if (active) {
          setNotifications(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load notifications."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, token, router]);

  if (authLoading || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading notifications...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-5">
            <h1 className="text-2xl font-bold text-slate-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with credits, payments and payment reminders.
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">
              Total notifications
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {notifications.length}
            </p>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {!error && (
          <>
            <div className="mb-5 flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  aria-pressed={activeFilter === filter.value}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === filter.value
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <p className="mb-3 text-sm text-slate-500">
              Showing {filteredNotifications.length} notifications
            </p>

            <NotificationList
              notifications={filteredNotifications}
            />
          </>
        )}
      </div>
    </main>
  );
}
