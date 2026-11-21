
"use client";

import { useState } from "react";

import { useAuth } from "@/features/auth/auth-context";
import VoiceRecorder from "./voice-recorder";

import {
  prepareVoiceTransaction,
  confirmVoiceTransaction,
} from "../voice-api";

import type {
  PrepareVoiceTransactionResponse,
} from "../types";

import type { TransactionResponse } from "@/features/transactions/types";

interface VoiceTransactionAssistantProps {
  customerId: string;
  onCreated: (transaction: TransactionResponse) => void;
}

function formatCurrency(amount: number | string | null): string {
  if (amount === null) return "Not detected";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export default function VoiceTransactionAssistant({
  customerId,
  onCreated,
}: VoiceTransactionAssistantProps) {
  const { token } = useAuth();

  const [result, setResult] =
    useState<PrepareVoiceTransactionResponse | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmationId, setConfirmationId] = useState("");

  async function handleAudioReady(audio: Blob) {
    if (!token) {
      setError("Please log in again to continue.");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setSuccess("");
      setResult(null);
      setConfirmationId("");

      const response = await prepareVoiceTransaction(audio, token);

      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process voice transaction."
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleConfirmTransaction() {
    if (!token || !result || result.status !== "preview_ready") {
      return;
    }

    const extracted = result.extracted_transaction;
    const matchedCustomer = result.customer_match;

    // Only allow one unique customer match.
    if (
      !matchedCustomer ||
      matchedCustomer.status !== "matched" ||
      matchedCustomer.customers.length !== 1
    ) {
      setError("A unique customer match is required before saving.");
      return;
    }

    const selectedCustomer = matchedCustomer.customers[0];

    // Prevent saving against a different customer than the open page.
    if (selectedCustomer.id !== customerId) {
      setError(
        `Voice matched ${selectedCustomer.full_name}, but this customer page belongs to someone else. Please record again with the correct customer name.`
      );
      return;
    }

    if (
      !extracted.transaction_type ||
      extracted.amount === null ||
      !Number.isFinite(Number(extracted.amount)) ||
      Number(extracted.amount) <= 0 ||
      result.missing_fields.length > 0
    ) {
      setError("Please provide all required transaction details.");
      return;
    }

    if (
      extracted.transaction_type === "payment" &&
      extracted.due_date
    ) {
      setError("A due date cannot be assigned to a payment.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      // Reuse the same ID if the request needs to be retried.
      const currentConfirmationId =
        confirmationId || crypto.randomUUID();

      if (!confirmationId) {
        setConfirmationId(currentConfirmationId);
      }

      const transaction = await confirmVoiceTransaction(
        {
          confirmation_id: currentConfirmationId,
          customer_id: selectedCustomer.id,
          transaction_type: extracted.transaction_type,
          amount: extracted.amount,
          description: extracted.description,
          due_date:
            extracted.transaction_type === "credit"
              ? extracted.due_date
              : null,
        },
        token
      );

      setSuccess("Transaction saved successfully!");
      setResult(null);
      setConfirmationId("");

      onCreated(transaction);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save voice transaction."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function resetAssistant() {
    setResult(null);
    setError("");
    setSuccess("");
    setConfirmationId("");
  }

  const matchedCustomer =
    result?.customer_match?.status === "matched" &&
    result.customer_match.customers.length === 1
      ? result.customer_match.customers[0]
      : null;

  const canConfirm =
    result?.status === "preview_ready" &&
    matchedCustomer?.id === customerId &&
    result.missing_fields.length === 0 &&
    result.extracted_transaction.transaction_type !== null &&
    result.extracted_transaction.amount !== null &&
    Number.isFinite(Number(result.extracted_transaction.amount)) &&
    Number(result.extracted_transaction.amount) > 0 &&
    !(
      result.extracted_transaction.transaction_type === "payment" &&
      result.extracted_transaction.due_date
    );

  return (
    <section className="space-y-5">
      <VoiceRecorder
        onAudioReady={handleAudioReady}
        disabled={isProcessing || isSaving}
      />

      {isProcessing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="font-medium text-blue-800">
            Processing your voice transaction...
          </p>
          <p className="mt-1 text-sm text-blue-600">
            Transcribing audio and identifying transaction details.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {result && (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Voice Transaction Preview
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                result.status === "preview_ready"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {result.status === "preview_ready"
                ? "Preview Ready"
                : "Needs Review"}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Transcribed Text
            </p>
            <p className="mt-1 rounded-lg bg-gray-50 p-3 text-gray-800">
              {result.transcribed_text}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Customer Name</p>
              <p className="mt-1 font-medium text-gray-900">
                {result.extracted_transaction.customer_name ||
                  "Not detected"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Transaction Type</p>
              <p className="mt-1 font-medium capitalize text-gray-900">
                {result.extracted_transaction.transaction_type ||
                  "Not detected"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="mt-1 font-semibold text-gray-900">
                {formatCurrency(result.extracted_transaction.amount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="mt-1 font-medium text-gray-900">
                {result.extracted_transaction.due_date
                  ? new Date(
                      result.extracted_transaction.due_date
                    ).toLocaleDateString("en-IN")
                  : "Not specified"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="mt-1 text-gray-900">
              {result.extracted_transaction.description || "Not specified"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-500">
              Customer Matching
            </p>

            {result.customer_match &&
            result.customer_match.customers.length > 0 ? (
              <div className="space-y-2">
                {result.customer_match.customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <p className="font-medium text-gray-900">
                      {customer.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {customer.mobile_number || "Mobile number unavailable"}
                    </p>

                    {customer.id === customerId && (
                      <p className="mt-1 text-xs text-green-700">
                        Matches current customer page
                      </p>
                    )}

                    {customer.id !== customerId && (
                      <p className="mt-1 text-xs text-red-600">
                        Does not match current customer page
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-600">
                No unique matching customer found.
              </p>
            )}
          </div>

          {result.missing_fields.length > 0 && (
            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="font-medium text-yellow-800">
                Missing information
              </p>
              <p className="mt-1 text-sm text-yellow-700">
                {result.missing_fields.join(", ")}
              </p>
            </div>
          )}

          {result.status === "needs_review" && (
            <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
              Please review the detected information. This transaction
              cannot be saved until all required details and the customer
              are confirmed.
            </p>
          )}

          {result.status === "preview_ready" && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              Review all details carefully before saving.
            </p>
          )}

          {result.status === "preview_ready" && (
            <button
              type="button"
              onClick={handleConfirmTransaction}
              disabled={!canConfirm || isSaving}
              className="w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving Transaction..." : "Confirm & Save"}
            </button>
          )}

          <button
            type="button"
            onClick={resetAssistant}
            disabled={isProcessing || isSaving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Record Again
          </button>
        </div>
      )}
    </section>
  );
}
