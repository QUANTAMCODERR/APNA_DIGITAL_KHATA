
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/features/auth/auth-context";
import { getCustomerById } from "@/features/customers/customer-api";

import {
  getCustomerBalance,
  getCustomerTransactionHistory,
} from "@/features/transactions/transaction-api";

import type { CustomerResponse } from "@/features/customers/types";

import type {
  CustomerBalance,
  TransactionResponse,
} from "@/features/transactions/types";

import TransactionForm from "@/features/transactions/components/transaction-form";
import TransactionHistory from "@/features/transactions/components/transaction-history";
import VoiceTransactionAssistant from "@/features/voice/components/voice-transaction-assistant";

function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function CustomerDetailsContent() {
  const params = useParams<{ customerId: string }>();
  const router = useRouter();

  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  const customerId = params.customerId;

  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [balance, setBalance] = useState<CustomerBalance | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  const loadCustomerDetails = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const [customerData, balanceData, historyData] = await Promise.all([
        getCustomerById(customerId, token),
        getCustomerBalance(customerId, token),
        getCustomerTransactionHistory(customerId, token, 0, 100),
      ]);

      setCustomer(customerData);
      setBalance(balanceData);
      setTransactions(historyData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customer details."
      );
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      loadCustomerDetails();
    }
  }, [authLoading, isAuthenticated, token, loadCustomerDetails]);

  function handleTransactionCreated(
    _transaction: TransactionResponse
  ) {
    setShowTransactionForm(false);
    loadCustomerDetails();
  }

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading customer details...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !customer || !balance) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <p className="rounded-lg bg-red-50 p-4 text-red-600">
            {error || "Customer not found."}
          </p>

          <button
            onClick={loadCustomerDetails}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Retry
          </button>

          <Link
            href="/customers"
            className="ml-3 text-blue-600 hover:underline"
          >
            Back to Customers
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">

        <Link
          href="/customers"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Customers
        </Link>

        <header className="mt-6 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {customer.full_name}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {customer.mobile_number || "No mobile number"}
            </p>

            {customer.address && (
              <p className="mt-1 text-sm text-gray-500">
                {customer.address}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowTransactionForm((previous) => !previous)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {showTransactionForm ? "Close Form" : "+ Add Transaction"}
          </button>
        </header>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Outstanding Balance
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(balance.outstanding_balance)}
          </h2>

          <p className="mt-2 text-xs text-gray-500">
            Current amount owed by this customer.
          </p>
        </section>

        {/* Voice Transaction Assistant */}
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Voice Transaction
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Speak naturally to prepare a credit or payment entry.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowVoiceAssistant((previous) => !previous)
              }
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              {showVoiceAssistant
                ? "Close Voice Assistant"
                : "Use Voice"}
            </button>
          </div>

         {showVoiceAssistant && (
            <div className="mt-5">
                <VoiceTransactionAssistant
                    customerId={customerId}
                    onCreated={handleTransactionCreated}
                />
            </div>
            )}
        </section>

        {/* Manual Transaction Form */}
        {showTransactionForm && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              Add Credit / Payment
            </h2>

            <TransactionForm
              customerId={customerId}
              onCreated={handleTransactionCreated}
              onCancel={() => setShowTransactionForm(false)}
            />
          </section>
        )}

        {/* Transaction History */}
        <section>
          <TransactionHistory transactions={transactions} />
        </section>

      </div>
    </main>
  );
}

export default function CustomerDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-500">
            Loading customer details...
          </p>
        </main>
      }
    >
      <CustomerDetailsContent />
    </Suspense>
  );
}
