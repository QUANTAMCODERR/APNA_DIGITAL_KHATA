
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { createShop } from "@/features/dashboard/shop-api";
import type { BusinessCategory } from "@/features/dashboard/shop-types";

const businessCategories: { value: BusinessCategory; label: string }[] = [
  { value: "kirana_store", label: "Kirana Store" },
  { value: "fruit_vegetable_shop", label: "Fruit & Vegetable Shop" },
  { value: "bakery", label: "Bakery" },
  { value: "dairy_shop", label: "Dairy Shop" },
  { value: "stationery_shop", label: "Stationery Shop" },
  { value: "hardware_shop", label: "Hardware Shop" },
  { value: "clothing_store", label: "Clothing Store" },
  { value: "medical_store", label: "Medical Store" },
  { value: "other_business", label: "Other Business" },
];

export default function ShopOnboardingPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAuth();

  const [shopName, setShopName] = useState("");
  const [category, setCategory] =
    useState<BusinessCategory>("kirana_store");
  const [language, setLanguage] = useState("en");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect only after authentication loading is complete.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Please login again to register your shop.");
      return;
    }

    try {
      setSubmitting(true);

      await createShop(
        {
          shop_name: shopName.trim(),
          business_category: category,
          preferred_language: language,
          address: address.trim() || null,
        },
        token
      );

      router.replace("/assistant");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register your shop."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Do not navigate during rendering.
  if (isLoading || !isAuthenticated) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-blue-600">
            UNIVERSAL DIGITAL KHATA
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Register Your Shop
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Add your business details to get started with your digital khata.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="shopName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Shop / Business Name
            </label>

            <input
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              minLength={2}
              maxLength={150}
              placeholder="e.g. Shree Ganesh General Store"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Business Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as BusinessCategory)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            >
              {businessCategories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="language"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Preferred Language
            </label>

            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Shop Address{" "}
              <span className="text-gray-400">(Optional)</span>
            </label>

            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={255}
              rows={3}
              placeholder="Enter your shop address"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Registering Shop..." : "Register My Shop"}
          </button>
        </form>
      </div>
    </main>
  );
}
