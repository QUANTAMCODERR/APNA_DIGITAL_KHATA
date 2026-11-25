
import type { Metadata } from "next";
import { Suspense } from "react";

import "./globals.css";
import { AuthProvider } from "@/features/auth/auth-context";
import WorkspaceShell from "@/features/layout/components/workspace-shell";

export const metadata: Metadata = {
  title: "Universal Digital Khata",
  description: "Smart digital khata management for every business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Suspense
            fallback={
              <div className="min-h-screen bg-gray-50" />
            }
          >
            <WorkspaceShell>{children}</WorkspaceShell>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
