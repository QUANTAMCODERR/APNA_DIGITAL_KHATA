
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
}

export default function CustomerForm({
  onCreated,
  onCancel,
}: CustomerFormProps) {
  const { token } = useAuth();

  const [fullName, setFullName] = useState("");
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

    const customerData: CustomerCreate = {
      full_name: fullName.trim(),
      mobile_number: mobileNumber.trim() || null,
      address: address.trim() || null,
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
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Customer Name *
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
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="mobileNumber"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Mobile Number
        </label>

        <input
          id="mobileNumber"
          type="tel"
          value={mobileNumber}
          onChange={(event) => setMobileNumber(event.target.value)}
          placeholder="Enter mobile number"
          maxLength={20}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Address
        </label>

        <textarea
          id="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Enter customer address"
          maxLength={255}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Notes
        </label>

        <textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Additional customer information"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
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
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Saving Customer..." : "Save Customer"}
        </button>
      </div>
    </form>
  );
}
