
"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { updateCustomer } from "@/features/customers/customer-api";
import type {
  CustomerResponse,
  CustomerUpdate,
} from "@/features/customers/types";

interface CustomerEditFormProps {
  customer: CustomerResponse;
  onUpdated: (customer: CustomerResponse) => void;
  onCancel: () => void;
}

export default function CustomerEditForm({
  customer,
  onUpdated,
  onCancel,
}: CustomerEditFormProps) {
  const { token } = useAuth();

  const [fullName, setFullName] = useState(customer.full_name);
  const [mobileNumber, setMobileNumber] = useState(
    customer.mobile_number || ""
  );
  const [address, setAddress] = useState(customer.address || "");
  const [notes, setNotes] = useState(customer.notes || "");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    const customerData: CustomerUpdate = {
      full_name: fullName.trim(),
      mobile_number: mobileNumber.trim() || null,
      address: address.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      setIsLoading(true);

      const updatedCustomer = await updateCustomer(
        customer.id,
        customerData,
        token
      );

      onUpdated(updatedCustomer);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update customer."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="editFullName"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Customer Name *
        </label>

        <input
          id="editFullName"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          minLength={2}
          maxLength={150}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="editMobile"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Mobile Number
        </label>

        <input
          id="editMobile"
          type="tel"
          value={mobileNumber}
          onChange={(event) => setMobileNumber(event.target.value)}
          maxLength={20}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="editAddress"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Address
        </label>

        <textarea
          id="editAddress"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          maxLength={255}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="editNotes"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Notes
        </label>

        <textarea
          id="editNotes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading ? "Updating..." : "Update Customer"}
        </button>
      </div>
    </form>
  );
}
