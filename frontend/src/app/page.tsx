"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth-context";
import { getMyShop } from "@/features/dashboard/shop-api";

export default function HomePage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !token) {
      router.replace("/login");
      return;
    }

    let active = true;

    async function checkShop() {
      try {
        if (!token) {
          router.replace("/login");
          return;
        }

        await getMyShop(token);

        if (active) {
          router.replace("/assistant");
        }
      } catch (err) {
        if (!active) return;

        const message = err instanceof Error ? err.message.toLowerCase() : "";

        if (
          message.includes("shop not found") ||
          message.includes("please register your shop")
        ) {
          router.replace("/onboarding/shop");
        } else if (message.includes("401")) {
          router.replace("/login");
        } else {
          setError(
            err instanceof Error ? err.message : "Unable to load your shop.",
          );
        }
      }
    }

    checkShop();

    return () => {
      active = false;
    };
  }, [isLoading, isAuthenticated, token, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-black px-5 py-2 text-white"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
            <p className="text-gray-600">Loading your Khata Assistant...</p>
          </>
        )}
      </div>
    </main>
  );
}
