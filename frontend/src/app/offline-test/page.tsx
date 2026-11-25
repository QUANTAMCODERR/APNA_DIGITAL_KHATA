
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { getCustomers } from "@/features/customers/customer-api";
import type { CustomerResponse } from "@/features/customers/types";
import { queueOfflineTransaction } from "@/lib/offline-queue";
import {
  getUnsyncedOfflineTransactions,
} from "@/lib/offline-repository";
import { syncOfflineTransactions } from "@/lib/offline-sync";
import type { OfflineTransaction } from "@/lib/offline-db";
import type { TransactionType } from "@/features/transactions/types";

export default function OfflineTestPage() {
  const { token, isLoading: authLoading } = useAuth();

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [transactionType, setTransactionType] =
    useState<TransactionType>("credit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [transactions, setTransactions] = useState<OfflineTransaction[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setMessage("Please login to load your customers.");
      setCustomerLoading(false);
      return;
    }

    let active = true;

    async function loadCustomers() {
      try {
        const result = await getCustomers(token!, 0, 100);

        if (active) {
          setCustomers(result);
          setMessage(
            result.length === 100
              ? "First 100 customers loaded."
              : `${result.length} customers loaded.`
          );
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load customers."
          );
        }
      } finally {
        if (active) setCustomerLoading(false);
      }
    }

    loadCustomers();

    return () => {
      active = false;
    };
  }, [token, authLoading]);

  async function handleLoad() {
    try {
      const unsynced = await getUnsyncedOfflineTransactions();
      setTransactions(unsynced);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load transactions."
      );
    }
  }

  useEffect(() => {
    void handleLoad();
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    const numericAmount = Number(amount);

    if (!customerId) {
      setMessage("Please select a customer.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessage("Enter a valid amount greater than zero.");
      return;
    }

    try {
      setLoading(true);

      const transaction = await queueOfflineTransaction({
        customer_id: customerId,
        transaction_type: transactionType,
        amount: numericAmount,
        description: description.trim() || null,
        due_date:
          transactionType === "credit" && dueDate
            ? new Date(`${dueDate}T00:00:00`).toISOString()
            : null,
      });

      setMessage(`Offline transaction saved! ID: ${transaction.id}`);

      setAmount("");
      setDescription("");
      setDueDate("");
      setTransactionType("credit");

      await handleLoad();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save transaction."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    if (!token) {
      setMessage("Please login before syncing transactions.");
      return;
    }

    try {
      setSyncing(true);
      setMessage("Syncing offline transactions...");

      const result = await syncOfflineTransactions(token);

      setMessage(
        `Sync completed! ${result.synced} transaction(s) synced successfully. ${result.failed} transaction(s) failed.`
      );

      await handleLoad();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to sync offline transactions."
      );
    } finally {
      setSyncing(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Universal Digital Khata
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Custom Offline Transaction
          </h1>

          <p className="mt-2 text-slate-600">
            Add customer transactions even when internet is unavailable.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">New Transaction</h2>

          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Select Customer *
              </label>

              <select
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                disabled={customerLoading || customers.length === 0}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900"
              >
                <option value="">
                  {customerLoading
                    ? "Loading customers..."
                    : customers.length === 0
                      ? "No customers available"
                      : "Choose a customer"}
                </option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name}
                    {customer.mobile_number
                      ? ` - ${customer.mobile_number}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Transaction Type *
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType("credit");
                    setDueDate("");
                  }}
                  className={`rounded-lg border px-4 py-3 font-semibold ${
                    transactionType === "credit"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-300 text-slate-600"
                  }`}
                >
                  Give Credit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTransactionType("payment");
                    setDueDate("");
                  }}
                  className={`rounded-lg border px-4 py-3 font-semibold ${
                    transactionType === "payment"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-300 text-slate-600"
                  }`}
                >
                  Receive Payment
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Amount (₹) *
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter custom amount"
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Grocery items, Rice, Wheat..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              />
            </div>

            {transactionType === "credit" && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Due Date (Optional)
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                customerLoading ||
                !token ||
                customers.length === 0
              }
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Offline Transaction"}
            </button>
          </form>

          {message && (
            <div
              role="status"
              className="mt-5 break-all rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-900"
            >
              {message}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              Unsynced Transactions
            </h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLoad}
                disabled={syncing}
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                Refresh List
              </button>

              <button
                type="button"
                onClick={handleSync}
                disabled={!token || syncing || transactions.length === 0}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </button>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No unsynced transactions.
            </div>
          ) : (
            transactions.map((transaction) => (
              <article
                key={transaction.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Amount</p>
                    <h3 className="text-2xl font-bold">
                      ₹{transaction.data.amount}
                    </h3>
                  </div>

                  <span
                    className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      transaction.syncStatus === "failed"
                        ? "bg-red-100 text-red-800"
                        : transaction.syncStatus === "syncing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {transaction.syncStatus}
                  </span>
                </div>

                <div className="mt-3 space-y-1 break-all text-sm text-slate-600">
                  <p>Customer ID: {transaction.data.customer_id}</p>
                  <p>Type: {transaction.data.transaction_type}</p>
                  <p>
                    Description: {transaction.data.description || "—"}
                  </p>
                  <p>Local ID: {transaction.id}</p>
                  <p>Retry Count: {transaction.retryCount}</p>

                  {transaction.lastError && (
                    <p className="font-medium text-red-600">
                      Last Error: {transaction.lastError}
                    </p>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
