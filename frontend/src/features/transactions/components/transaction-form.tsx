
"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { createTransaction } from "@/features/transactions/transaction-api";

import type {
  TransactionCreate,
  TransactionResponse,
  TransactionType,
} from "@/features/transactions/types";

interface TransactionFormProps {
  customerId: string;
  onCreated: (transaction: TransactionResponse) => void;
  onCancel?: () => void;
}

export default function TransactionForm({
  customerId,
  onCreated,
  onCancel,
}: TransactionFormProps) {
  const { token } = useAuth();

  const [transactionType, setTransactionType] =
    useState<TransactionType>("credit");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    const transactionData: TransactionCreate = {
      customer_id: customerId,
      transaction_type: transactionType,
      amount: numericAmount,
      description: description.trim() || null,
      due_date:
        transactionType === "credit" && dueDate
          ? new Date(`${dueDate}T00:00:00`).toISOString()
          : null,
    };

    try {
      setIsLoading(true);

      const transaction = await createTransaction(
        transactionData,
        token
      );

      onCreated(transaction);

      setAmount("");
      setDescription("");
      setDueDate("");
      setTransactionType("credit");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save transaction."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Transaction Type
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setTransactionType("credit");
              setDueDate("");
            }}
            className={`rounded-lg border px-4 py-3 font-semibold transition ${
              transactionType === "credit"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Give Credit (Udhar)
          </button>

          <button
            type="button"
            onClick={() => {
              setTransactionType("payment");
              setDueDate("");
            }}
            className={`rounded-lg border px-4 py-3 font-semibold transition ${
              transactionType === "payment"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Receive Payment
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Amount (₹) *
        </label>

        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Enter amount"
          min="0.01"
          step="0.01"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Description
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. Grocery items, Rice, Wheat..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
        />
      </div>

      {transactionType === "credit" && (
        <div>
          <label
            htmlFor="dueDate"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Due Date (Optional)
          </label>

          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
          />
        </div>
      )}

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
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
            transactionType === "credit"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isLoading
            ? "Saving..."
            : transactionType === "credit"
              ? "Save Credit"
              : "Save Payment"}
        </button>
      </div>
    </form>
  );
}
