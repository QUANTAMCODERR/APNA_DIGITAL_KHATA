"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import AssistantSidebar from "@/features/assistant/components/assistant-sidebar";

export default function WorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Public and onboarding pages should not show workspace sidebar.
  const isPublicPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/" ||
    pathname.startsWith("/onboarding");

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AssistantSidebar
        onCreateCustomer={() => {
          window.location.href = "/customers/create";
        }}
        onNewChat={() => {
          window.location.href = "/assistant";
        }}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-gray-700"
            aria-label="Open navigation"
          >
            ☰
          </button>
        </div>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
