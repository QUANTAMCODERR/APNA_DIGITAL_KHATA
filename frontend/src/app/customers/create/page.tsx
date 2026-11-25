
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth-context";
import type { CustomerResponse } from "@/features/customers/types";
import CustomerForm from "@/features/customers/components/customer-form";

export default function CreateCustomerPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  function handleCustomerCreated(
    customer: CustomerResponse
  ) {
    router.push("/customers");
  }

  function handleCancel() {
    router.push("/customers");
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Customers
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Create Customer
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Add a new customer to your business account.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Customer Details
          </h2>

          <CustomerForm
            onCreated={handleCustomerCreated}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
