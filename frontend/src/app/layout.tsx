
import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/features/auth/auth-context";

export const metadata: Metadata = {
  title: "Universal Digital Khata",
  description:
    "Smart digital khata management for every business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
