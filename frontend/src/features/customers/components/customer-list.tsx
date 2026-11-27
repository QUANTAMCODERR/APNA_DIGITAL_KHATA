"use client";

import Link from "next/link";
import type { CustomerResponse } from "@/features/customers/types";

interface CustomerListProps {
  customers: CustomerResponse[];
  isLoading?: boolean;
  error?: string;
  onEdit: (customer: CustomerResponse) => void;
  onDelete: (customer: CustomerResponse) => void;
}

export default function CustomerList({
  customers,
  isLoading = false,
  error = "",
  onEdit,
  onDelete,
}: CustomerListProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Loading customers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <div className="mb-3 text-4xl">👥</div>
        <h3 className="font-semibold text-gray-900">No customers yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Add your first customer to start managing your digital khata.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="font-semibold text-gray-900">All Customers</h2>
        <p className="mt-1 text-sm text-gray-500">
          {customers.length} customer(s) displayed
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-gray-50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
              {customer.full_name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-gray-900">
                {customer.full_name}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {customer.mobile_number || "No mobile number"}
              </p>

              {customer.address && (
                <p className="mt-1 truncate text-xs text-gray-400">
                  {customer.address}
                </p>
              )}
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs text-gray-400">Added on</p>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(customer.created_at).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/customers/${customer.id}`}
                className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
              >
                View Details
              </Link>

              <button
                type="button"
                onClick={() => onEdit(customer)}
                className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(customer)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
