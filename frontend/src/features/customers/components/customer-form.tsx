
"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { createCustomer } from "@/features/customers/customer-api";
import type {
  CustomerCreate,
  CustomerResponse,
} from "@/features/customers/types";

interface CustomerFormProps {
  onCreated: (customer: CustomerResponse) => void;
  onCancel?: () => void;
  initialFullName?: string;
}

export default function CustomerForm({
  onCreated,
  onCancel,
  initialFullName = "",
}: CustomerFormProps) {
  const { token } = useAuth();

  const [fullName, setFullName] = useState(initialFullName);
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedMobile = mobileNumber.trim();
    const trimmedAddress = address.trim();

    if (trimmedName.length < 2) {
      setError("Please enter the customer's full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(trimmedMobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (trimmedAddress.length < 5) {
      setError("Please enter a valid address (minimum 5 characters).");
      return;
    }

    const customerData: CustomerCreate = {
      full_name: trimmedName,
      mobile_number: trimmedMobile,
      address: trimmedAddress,
      notes: notes.trim() || null,
    };

    try {
      setIsLoading(true);

      const customer = await createCustomer(customerData, token);

      onCreated(customer);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create customer. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="fullName"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Customer Full Name <span className="text-red-500">*</span>
        </label>

        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Enter customer full name"
          minLength={2}
          maxLength={150}
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="mobileNumber"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Mobile Number <span className="text-red-500">*</span>
        </label>

        <input
          id="mobileNumber"
          type="tel"
          inputMode="numeric"
          value={mobileNumber}
          onChange={(event) =>
            setMobileNumber(event.target.value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="Enter 10-digit mobile number"
          maxLength={10}
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <p className="mt-1 text-xs text-gray-400">
          Enter a valid 10-digit Indian mobile number.
        </p>
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Customer Address <span className="text-red-500">*</span>
        </label>

        <textarea
          id="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Enter complete customer address"
          minLength={5}
          maxLength={255}
          rows={2}
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Additional Notes
          <span className="ml-2 text-xs font-normal text-gray-400">
            (Optional)
          </span>
        </label>

        <textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Additional customer information"
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Saving Customer..." : "Create Customer"}
        </button>
      </div>
    </form>
  );
}
