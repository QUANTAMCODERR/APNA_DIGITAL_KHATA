
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth-context";
import {
  getCustomers,
  deleteCustomer,
} from "@/features/customers/customer-api";

import type { CustomerResponse } from "@/features/customers/types";

import CustomerForm from "@/features/customers/components/customer-form";
import CustomerList from "@/features/customers/components/customer-list";
import CustomerEditForm from "@/features/customers/components/customer-edit-form";

export default function CustomersPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerResponse | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] =
    useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const data = await getCustomers(token, 0, 100);
      setCustomers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      loadCustomers();
    }
  }, [authLoading, isAuthenticated, token, loadCustomers]);

  function handleCustomerCreated(customer: CustomerResponse) {
    setCustomers((previous) => [customer, ...previous]);
    setShowForm(false);
  }

  function handleCustomerUpdated(updatedCustomer: CustomerResponse) {
    setCustomers((previous) =>
      previous.map((customer) =>
        customer.id === updatedCustomer.id
          ? updatedCustomer
          : customer
      )
    );

    setSelectedCustomer(null);
  }

  async function handleCustomerDelete(customer: CustomerResponse) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.full_name}?`
    );

    if (!confirmed || !token) return;

    try {
      setError("");
      setDeletingCustomerId(customer.id);

      await deleteCustomer(customer.id, token);

      setCustomers((previous) =>
        previous.filter((item) => item.id !== customer.id)
      );

      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete customer."
      );
    } finally {
      setDeletingCustomerId(null);
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customers
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your customers and their details.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCustomer(null);
              setShowForm((previous) => !previous);
            }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "+ Add Customer"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {showForm && !selectedCustomer && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              Add New Customer
            </h2>

            <CustomerForm
              onCreated={handleCustomerCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {selectedCustomer && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              Edit Customer
            </h2>

            <CustomerEditForm
              key={selectedCustomer.id}
              customer={selectedCustomer}
              onUpdated={handleCustomerUpdated}
              onCancel={() => setSelectedCustomer(null)}
            />
          </div>
        )}

        <CustomerList
          customers={customers}
          isLoading={loading}
          error=""
          onEdit={(customer) => {
            setShowForm(false);
            setSelectedCustomer(customer);
          }}
          onDelete={handleCustomerDelete}
        />

        {!loading && customers.length > 0 && (
          <div className="mt-5 text-sm text-gray-500">
            Showing {customers.length} customers
          </div>
        )}

        {deletingCustomerId && (
          <p className="mt-3 text-sm text-gray-500">
            Deleting customer...
          </p>
        )}

        {error && (
          <button
            onClick={loadCustomers}
            className="mt-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Retry loading customers
          </button>
        )}
      </div>
    </main>
  );
}
