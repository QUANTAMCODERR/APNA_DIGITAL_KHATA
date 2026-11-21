
"use client";

import type { TransactionResponse } from "@/features/transactions/types";

interface TransactionHistoryProps {
  transactions: TransactionResponse[];
  isLoading?: boolean;
  error?: string;
}

function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export default function TransactionHistory({
  transactions,
  isLoading = false,
  error = "",
}: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Loading transaction history...
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

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <div className="mb-3 text-4xl">📒</div>
        <h3 className="font-semibold text-gray-900">
          No transactions yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Credit and payment records will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="font-semibold text-gray-900">
          Transaction History
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {transactions.length} transaction(s)
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                  transaction.transaction_type === "credit"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {transaction.transaction_type === "credit" ? "↑" : "↓"}
              </div>

              <div className="min-w-0">
                <h3 className="font-medium capitalize text-gray-900">
                  {transaction.transaction_type === "credit"
                    ? "Credit Given"
                    : "Payment Received"}
                </h3>

                <p className="mt-1 truncate text-sm text-gray-500">
                  {transaction.description || "No description"}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {new Date(
                    transaction.transaction_date
                  ).toLocaleString("en-IN")}
                </p>

                {transaction.due_date && (
                  <p className="mt-1 text-xs text-gray-500">
                    Due:{" "}
                    {new Date(
                      transaction.due_date
                    ).toLocaleDateString("en-IN")}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <p
                className={`font-semibold ${
                  transaction.transaction_type === "credit"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {transaction.transaction_type === "credit" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>

              <p className="mt-1 text-xs capitalize text-gray-400">
                {transaction.source}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
