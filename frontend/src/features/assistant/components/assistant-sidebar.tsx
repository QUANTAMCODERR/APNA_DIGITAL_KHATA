"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";

const navigationItems = [
  {
    label: "AI Assistant",
    href: "/assistant",
    icon: "✦",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "▦",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: "♙",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: "♧",
  },
];

interface AssistantSidebarProps {
  onCreateCustomer: () => void;
  onNewChat: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export default function AssistantSidebar({
  onCreateCustomer,
  onNewChat,
  mobileOpen,
  onClose,
}: AssistantSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-gray-100 p-5">
          <h1 className="text-xl font-bold text-gray-900">
            Aapka Digital Khata
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            AI-powered business ledger
          </p>
        </div>

        <div className="space-y-2 p-4">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <span>＋</span>
            New Chat
          </button>

          <button
            type="button"
            onClick={() => {
              onCreateCustomer();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <span>＋</span>
            Create Customer
          </button>
        </div>

        <div className="px-4 pb-2">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navigationItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 truncate px-2">
            <p className="text-sm font-semibold text-gray-900">
              {user?.full_name || "Shop Owner"}
            </p>
            <p className="text-xs text-gray-500">Shop Account</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            ↪ Logout
          </button>
        </div>
      </aside>
    </>
  );
}
