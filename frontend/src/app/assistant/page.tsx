"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth-context";

import {
  prepareTextTransaction,
  prepareVoiceTransaction,
  confirmVoiceTransaction,
} from "@/features/voice/voice-api";

import CustomerForm from "@/features/customers/components/customer-form";
import { getCustomers } from "@/features/customers/customer-api";

import type {
  PrepareVoiceTransactionResponse,
  VoiceTransactionConfirm,
} from "@/features/voice/types";

import type { CustomerResponse } from "@/features/customers/types";
import type {
  TransactionResponse,
  TransactionType,
} from "@/features/transactions/types";

import { getCustomerCreditRisk } from "@/features/credit-risk/credit-risk-api";
import type { CreditRiskResponse } from "@/features/credit-risk/types";

type TransactionDraft = {
  customer_id: string;
  transaction_type: TransactionType | "";
  amount: string;
  description: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: PrepareVoiceTransactionResponse;
};

export default function AssistantPage() {
  const router = useRouter();

  const { user, token, isLoading, isAuthenticated, logout } = useAuth();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerLoadError, setCustomerLoadError] = useState("");
  const [transactionDrafts, setTransactionDrafts] = useState<
    Record<string, TransactionDraft>
  >({});

  const [selectedCustomers, setSelectedCustomers] = useState<
    Record<string, string>
  >({});

  const [creatingCustomerFor, setCreatingCustomerFor] = useState<string | null>(
    null,
  );

  const [createdCustomers, setCreatedCustomers] = useState<
    Record<string, CustomerResponse>
  >({});

  const [confirmingMessages, setConfirmingMessages] = useState<
    Record<string, boolean>
  >({});

  const [transactionResults, setTransactionResults] = useState<
    Record<string, TransactionResponse>
  >({});

  const [customerRiskData, setCustomerRiskData] = useState<
    Record<string, CreditRiskResponse>
  >({});

  const [riskLoading, setRiskLoading] = useState<Record<string, boolean>>({});

  const [riskErrors, setRiskErrors] = useState<Record<string, string>>({});

  const [cancelledMessages, setCancelledMessages] = useState<
    Record<string, boolean>
  >({});

  const [showGlobalCustomerForm, setShowGlobalCustomerForm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [highRiskWarningFor, setHighRiskWarningFor] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!token || isLoading || !isAuthenticated) return;

    let active = true;

    async function loadCustomers() {
      setCustomersLoading(true);
      setCustomerLoadError("");

      try {
        const result = await getCustomers(token!, 0, 100);
        if (active) setCustomers(result);
      } catch (error) {
        if (active) {
          setCustomerLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load customers.",
          );
        }
      } finally {
        if (active) setCustomersLoading(false);
      }
    }

    loadCustomers();

    return () => {
      active = false;
    };
  }, [token, isLoading, isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || !token || isSubmitting) return;

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedMessage,
      },
    ]);

    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await prepareTextTransaction(trimmedMessage, token);
      if (response.customer_match?.status === "matched") {
        const matchedCustomerId = response.customer_match.customers[0]?.id;

        if (matchedCustomerId) {
          loadCustomerRisk(matchedCustomerId);
        }
      }

      const assistantMessageId = crypto.randomUUID();

      if (
        response.customer_match?.status === "not_found" &&
        response.extracted_transaction.customer_name?.trim()
      ) {
        setCreatingCustomerFor(assistantMessageId);
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.transcribed_text,
        },
        {
          id: assistantMessageId,
          role: "assistant",
          content:
            response.status === "preview_ready"
              ? "I understood your voice instruction. Please review the transaction."
              : "I need some more information. Please review the details below.",
          result: response,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Unable to process your message. Please try again.",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      alert("Audio recording is not supported by this browser.");
      return;
    }

    if (!token || isRecording || isProcessingVoice) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setIsRecording(false);
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        alert("Recording failed. Please try again.");
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];

        if (!audioBlob.size) {
          alert("No audio was recorded. Please try again.");
          return;
        }

        setIsProcessingVoice(true);

        try {
          const response = await prepareVoiceTransaction(audioBlob, token);
          if (response.customer_match?.status === "matched") {
            const matchedCustomerId = response.customer_match.customers[0]?.id;

            if (matchedCustomerId) {
              loadCustomerRisk(matchedCustomerId);
            }
          }

          const assistantMessageId = crypto.randomUUID();

          if (
            response.customer_match?.status === "not_found" &&
            response.extracted_transaction.customer_name?.trim()
          ) {
            setCreatingCustomerFor(assistantMessageId);
          }

          setMessages((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: response.transcribed_text,
            },
            {
              id: assistantMessageId,
              role: "assistant",
              content:
                response.status === "preview_ready"
                  ? "I understood your voice instruction. Please review the transaction."
                  : "I need some more information. Please review the details below.",
              result: response,
            },
          ]);
        } catch (error) {
          setMessages((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content:
                error instanceof Error
                  ? error.message
                  : "Unable to process your voice. Please try again.",
            },
          ]);
        } finally {
          setIsProcessingVoice(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;

      alert(
        error instanceof Error
          ? error.message
          : "Unable to access your microphone. Please allow microphone permission.",
      );
    }
  }

  function handleStopRecording() {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state === "recording") {
      recorder.stop();
      setIsRecording(false);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setMessage("");
    setSelectedCustomers({});
    setCreatedCustomers({});
    setTransactionResults({});
    setCancelledMessages({});
    setConfirmingMessages({});
    setCreatingCustomerFor(null);
    setCustomerRiskData({});
    setRiskLoading({});
    setRiskErrors({});
  }

  function handleCustomerCreated(
    messageId: string,
    customer: CustomerResponse,
  ) {
    setCustomers((current) =>
      current.some((item) => item.id === customer.id)
        ? current
        : [customer, ...current],
    );

    setCreatedCustomers((current) => ({
      ...current,
      [messageId]: customer,
    }));

    setSelectedCustomers((current) => ({
      ...current,
      [messageId]: customer.id,
    }));

    setCreatingCustomerFor(null);
  }

  async function loadCustomerRisk(customerId: string, forceRefresh = false) {
    if (!token || !customerId) return;

    // Already loaded or currently loading
    if (
      !forceRefresh &&
      (customerRiskData[customerId] || riskLoading[customerId])
    ) {
      return;
    }

    setRiskLoading((current) => ({
      ...current,
      [customerId]: true,
    }));

    setRiskErrors((current) => ({
      ...current,
      [customerId]: "",
    }));

    try {
      const response = await getCustomerCreditRisk(customerId, token);

      setCustomerRiskData((current) => ({
        ...current,
        [customerId]: response,
      }));
    } catch (error) {
      setRiskErrors((current) => ({
        ...current,
        [customerId]:
          error instanceof Error
            ? error.message
            : "Unable to load customer credit risk.",
      }));
    } finally {
      setRiskLoading((current) => ({
        ...current,
        [customerId]: false,
      }));
    }
  }

  async function handleConfirmTransaction(
    item: ChatMessage,
    allowHighRisk = false,
  ) {
    if (!token || !item.result) return;

    if (
      confirmingMessages[item.id] ||
      transactionResults[item.id] ||
      cancelledMessages[item.id]
    ) {
      return;
    }

    const extracted = item.result.extracted_transaction;
    const draft = transactionDrafts[item.id];

    const matchedCustomer =
      item.result.customer_match?.status === "matched"
        ? item.result.customer_match.customers[0]
        : null;

    const customerId =
      draft?.customer_id ||
      createdCustomers[item.id]?.id ||
      selectedCustomers[item.id] ||
      matchedCustomer?.id ||
      "";

    const transactionType =
      draft?.transaction_type || extracted.transaction_type || "";

    const amount =
      draft?.amount ??
      (extracted.amount === null || extracted.amount === undefined
        ? ""
        : String(extracted.amount));

    const numericAmount = Number(amount);

    if (!customerId) {
      alert("Please select a customer first.");
      return;
    }

    if (
      !transactionType ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      alert("Please enter a valid transaction type and amount.");
      return;
    }

    const customerRisk = customerRiskData[customerId];

    if (
      transactionType === "credit" &&
      customerRisk?.risk_level === "high" &&
      !allowHighRisk
    ) {
      setHighRiskWarningFor(item.id);
      return;
    }

    const confirmationData: VoiceTransactionConfirm = {
      confirmation_id: item.id,
      customer_id: customerId,
      transaction_type: transactionType,
      amount: numericAmount,
      description: draft?.description ?? extracted.description,
      due_date: transactionType === "credit" ? extracted.due_date : null,
    };

    try {
      setConfirmingMessages((current) => ({
        ...current,
        [item.id]: true,
      }));

      const response = await confirmVoiceTransaction(confirmationData, token);

      setTransactionResults((current) => ({
        ...current,
        [item.id]: response,
      }));

      // Refresh customer risk after successful transaction
      await loadCustomerRisk(customerId, true);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save transaction. Please try again.",
      );
    } finally {
      setConfirmingMessages((current) => ({
        ...current,
        [item.id]: false,
      }));
    }
  }

  function handleCancelTransaction(messageId: string) {
    if (confirmingMessages[messageId] || transactionResults[messageId]) {
      return;
    }

    setCancelledMessages((current) => ({
      ...current,
      [messageId]: true,
    }));
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading your Khata Assistant...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex min-w-0 flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Hello, {user?.full_name}!
            </h2>
            <p className="mt-2 text-gray-500">
              Tell me about your shop transactions.
            </p>
          </div>

          <div className="flex-1 space-y-5">
            {messages.length === 0 && (
              <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
                <p className="font-semibold text-gray-800">
                  What would you like to record?
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Example: Virat Kohli ne 100 rs ka saman udhar liya.
                </p>
              </div>
            )}

            {messages.map((item) => {
              const result = item.result;
              const match = result?.customer_match;
              const shouldCreateNewCustomer =
                match?.status === "not_found" &&
                !!result?.extracted_transaction.customer_name?.trim();

              const createdCustomer = createdCustomers[item.id];
              const savedTransaction = transactionResults[item.id];

              const matchedCustomer =
                match?.status === "matched" ? match.customers[0] : null;

              const draft = result ? transactionDrafts[item.id] : undefined;

              const effectiveCustomerId =
                draft?.customer_id ||
                createdCustomer?.id ||
                selectedCustomers[item.id] ||
                matchedCustomer?.id ||
                "";

              const effectiveType =
                draft?.transaction_type ||
                result?.extracted_transaction.transaction_type ||
                "";

              const effectiveAmount =
                draft?.amount ??
                (result?.extracted_transaction.amount === null ||
                result?.extracted_transaction.amount === undefined
                  ? ""
                  : String(result.extracted_transaction.amount));

              const effectiveDescription =
                draft?.description ??
                result?.extracted_transaction.description ??
                "";

              const hasValidTransaction =
                !!effectiveAmount.trim() &&
                Number.isFinite(Number(effectiveAmount)) &&
                Number(effectiveAmount) > 0 &&
                !!effectiveType;

              const suggestedCustomers = result
                ? (result.customer_match?.customers ?? [])
                : [];

              const sortedCustomers = [...customers].sort((a, b) => {
                const aSuggested = suggestedCustomers.some(
                  (c) => c.id === a.id,
                );
                const bSuggested = suggestedCustomers.some(
                  (c) => c.id === b.id,
                );
                if (aSuggested === bSuggested) {
                  return a.full_name.localeCompare(b.full_name);
                }
                return aSuggested ? -1 : 1;
              });

              const canConfirm =
                !!result &&
                !!effectiveCustomerId &&
                hasValidTransaction &&
                !savedTransaction &&
                !cancelledMessages[item.id];

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    item.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-4 sm:max-w-[80%] ${
                      item.role === "user"
                        ? "bg-blue-600 text-white"
                        : "border bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    <p className="text-sm">{item.content}</p>

                    {result && (
                      <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                        {/* Transaction Preview */}

                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Review & Edit Transaction
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              AI suggestions are editable. Check every field
                              before confirming.
                            </p>
                          </div>

                          <div>
                            <label
                              htmlFor={`customer-${item.id}`}
                              className="mb-1.5 block text-sm font-semibold text-gray-700"
                            >
                              Customer
                            </label>
                            <select
                              id={`customer-${item.id}`}
                              value={effectiveCustomerId}
                              disabled={!!savedTransaction || customersLoading}
                              onChange={(event) => {
                                const customerId = event.target.value;

                                setSelectedCustomers((current) => ({
                                  ...current,
                                  [item.id]: customerId,
                                }));

                                setTransactionDrafts((current) => ({
                                  ...current,
                                  [item.id]: {
                                    customer_id: customerId,
                                    transaction_type: effectiveType,
                                    amount: effectiveAmount,
                                    description: effectiveDescription,
                                  },
                                }));

                                if (customerId) {
                                  loadCustomerRisk(customerId);
                                }
                              }}
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                            >
                              <option value="">
                                {customersLoading
                                  ? "Loading customers..."
                                  : customers.length
                                    ? "Select a customer"
                                    : "No customers found"}
                              </option>
                              {sortedCustomers.map((customer) => {
                                const isSuggested = suggestedCustomers.some(
                                  (suggestion) => suggestion.id === customer.id,
                                );
                                return (
                                  <option key={customer.id} value={customer.id}>
                                    {isSuggested ? "★ " : ""}
                                    {customer.full_name}
                                    {customer.mobile_number
                                      ? ` — ${customer.mobile_number}`
                                      : ""}
                                    {isSuggested ? " (AI match)" : ""}
                                  </option>
                                );
                              })}
                            </select>
                            {customerLoadError && (
                              <p className="mt-1 text-xs text-red-600">
                                {customerLoadError}
                              </p>
                            )}
                            {!customersLoading && customers.length === 0 && (
                              <p className="mt-1 text-xs text-amber-700">
                                Create a customer before confirming this
                                transaction.
                              </p>
                            )}
                          </div>

                          {effectiveCustomerId && (
                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                              {riskLoading[effectiveCustomerId] ? (
                                <p className="text-sm text-gray-500">
                                  Loading customer repayment behaviour...
                                </p>
                              ) : riskErrors[effectiveCustomerId] ? (
                                <p className="text-sm text-red-600">
                                  Unable to load credit risk:{" "}
                                  {riskErrors[effectiveCustomerId]}
                                </p>
                              ) : customerRiskData[effectiveCustomerId] ? (
                                (() => {
                                  const risk =
                                    customerRiskData[effectiveCustomerId];

                                  const riskStyles = {
                                    low: "bg-green-100 text-green-700",
                                    medium: "bg-yellow-100 text-yellow-700",
                                    high: "bg-red-100 text-red-700",
                                    insufficient_data:
                                      "bg-gray-100 text-gray-700",
                                  };

                                  const riskLabels = {
                                    low: "Low Risk",
                                    medium: "Medium Risk",
                                    high: "High Risk",
                                    insufficient_data: "Insufficient Data",
                                  };

                                  return (
                                    <div className="space-y-4">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                          Customer Repayment Behaviour
                                        </h3>

                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            riskStyles[risk.risk_level]
                                          }`}
                                        >
                                          {riskLabels[risk.risk_level]}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        <div className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-xs text-gray-500">
                                            Risk Score
                                          </p>
                                          <p className="mt-1 font-semibold text-gray-900">
                                            {risk.risk_score ?? "N/A"}
                                          </p>
                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-xs text-gray-500">
                                            Transactions
                                          </p>
                                          <p className="mt-1 font-semibold text-gray-900">
                                            {risk.total_transactions}
                                          </p>
                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-xs text-gray-500">
                                            Repayment Ratio
                                          </p>
                                          <p className="mt-1 font-semibold text-gray-900">
                                            {Number(
                                              risk.repayment_ratio,
                                            ).toFixed(2)}
                                          </p>
                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-xs text-gray-500">
                                            Total Credit
                                          </p>
                                          <p className="mt-1 font-semibold text-gray-900">
                                            ₹
                                            {Number(
                                              risk.total_credit_amount,
                                            ).toLocaleString("en-IN")}
                                          </p>
                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-xs text-gray-500">
                                            Total Payments
                                          </p>
                                          <p className="mt-1 font-semibold text-gray-900">
                                            ₹
                                            {Number(
                                              risk.total_payment_amount,
                                            ).toLocaleString("en-IN")}
                                          </p>
                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-xs text-gray-500">
                                            Outstanding
                                          </p>
                                          <p className="mt-1 font-semibold text-gray-900">
                                            ₹
                                            {Number(
                                              risk.outstanding_balance,
                                            ).toLocaleString("en-IN")}
                                          </p>
                                        </div>
                                      </div>

                                      {risk.explanation.length > 0 && (
                                        <div>
                                          <p className="mb-2 text-xs font-semibold text-gray-700">
                                            Risk Analysis
                                          </p>

                                          <ul className="list-disc space-y-1 pl-5 text-xs text-gray-600">
                                            {risk.explanation.map(
                                              (reason, index) => (
                                                <li key={index}>{reason}</li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                      <div className="rounded-lg bg-blue-50 p-3">
                                        <p className="text-xs font-semibold text-blue-800">
                                          Recommendation
                                        </p>
                                        <p className="mt-1 text-xs text-blue-700">
                                          {risk.recommendation}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : (
                                <p className="text-sm text-gray-500">
                                  Customer risk information is not available
                                  yet.
                                </p>
                              )}
                            </div>
                          )}

                          <div>
                            <label
                              htmlFor={`type-${item.id}`}
                              className="mb-1.5 block text-sm font-semibold text-gray-700"
                            >
                              Transaction Type
                            </label>
                            <select
                              id={`type-${item.id}`}
                              value={effectiveType}
                              disabled={!!savedTransaction}
                              onChange={(event) => {
                                const value = event.target.value as
                                  | TransactionType
                                  | "";
                                setTransactionDrafts((current) => ({
                                  ...current,
                                  [item.id]: {
                                    customer_id: effectiveCustomerId,
                                    transaction_type: value,
                                    amount: effectiveAmount,
                                    description: effectiveDescription,
                                  },
                                }));
                              }}
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                            >
                              <option value="">Select credit or payment</option>
                              <option value="credit">Credit (Udhar)</option>
                              <option value="payment">Payment Received</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor={`amount-${item.id}`}
                              className="mb-1.5 block text-sm font-semibold text-gray-700"
                            >
                              Amount (₹)
                            </label>
                            <input
                              id={`amount-${item.id}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={effectiveAmount}
                              disabled={!!savedTransaction}
                              onChange={(event) =>
                                setTransactionDrafts((current) => ({
                                  ...current,
                                  [item.id]: {
                                    customer_id: effectiveCustomerId,
                                    transaction_type: effectiveType,
                                    amount: event.target.value,
                                    description: effectiveDescription,
                                  },
                                }))
                              }
                              placeholder="Enter amount"
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`description-${item.id}`}
                              className="mb-1.5 block text-sm font-semibold text-gray-700"
                            >
                              Description
                            </label>
                            <input
                              id={`description-${item.id}`}
                              type="text"
                              maxLength={500}
                              value={effectiveDescription}
                              disabled={!!savedTransaction}
                              onChange={(event) =>
                                setTransactionDrafts((current) => ({
                                  ...current,
                                  [item.id]: {
                                    customer_id: effectiveCustomerId,
                                    transaction_type: effectiveType,
                                    amount: effectiveAmount,
                                    description: event.target.value,
                                  },
                                }))
                              }
                              placeholder="What was purchased or paid?"
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                            />
                          </div>
                        </div>

                        {/* AI-matched customers are prioritized in the customer dropdown. */}

                        {/* New Customer Creation */}

                        {!savedTransaction &&
                          !cancelledMessages[item.id] &&
                          !createdCustomer && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-gray-200" />
                                <span className="text-xs text-gray-400">
                                  OR
                                </span>
                                <div className="h-px flex-1 bg-gray-200" />
                              </div>

                              {shouldCreateNewCustomer ? (
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">👤</span>
                                    <p className="text-sm font-semibold text-blue-800">
                                      New customer identified!
                                    </p>
                                  </div>

                                  <p className="mt-1 text-sm text-blue-700">
                                    No matching customer found for{" "}
                                    <strong>
                                      {
                                        result.extracted_transaction
                                          .customer_name
                                      }
                                    </strong>
                                    . Please add this customer.
                                  </p>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCreatingCustomerFor(
                                      creatingCustomerFor === item.id
                                        ? null
                                        : item.id,
                                    )
                                  }
                                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100"
                                >
                                  <span className="text-lg">+</span>
                                  Create New Customer
                                </button>
                              )}

                              {creatingCustomerFor === item.id && (
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                  <h3 className="mb-1 font-semibold text-gray-900">
                                    New Customer Details
                                  </h3>

                                  <p className="mb-4 text-xs text-gray-500">
                                    Full name, mobile number and address are
                                    required.
                                  </p>

                                  <CustomerForm
                                    initialFullName={
                                      result.extracted_transaction
                                        .customer_name ?? ""
                                    }
                                    onCreated={(customer) =>
                                      handleCustomerCreated(item.id, customer)
                                    }
                                    onCancel={() =>
                                      setCreatingCustomerFor(null)
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          )}

                        {/* Newly Created Customer */}

                        {createdCustomer && (
                          <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                            <p className="text-xs font-semibold uppercase text-green-700">
                              New Customer Created
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                              {createdCustomer.full_name}
                            </p>

                            <p className="text-xs text-gray-600">
                              {createdCustomer.mobile_number}
                            </p>

                            <p className="text-xs text-green-700">
                              Selected for this transaction
                            </p>
                          </div>
                        )}

                        {/* Missing Fields */}

                        {(!effectiveCustomerId ||
                          !effectiveType ||
                          !effectiveAmount.trim() ||
                          !Number.isFinite(Number(effectiveAmount)) ||
                          Number(effectiveAmount) <= 0) && (
                          <p className="text-sm text-amber-700">
                            Please select a customer, transaction type and valid
                            amount.
                          </p>
                        )}

                        {/* Successful Transaction */}

                        {savedTransaction && (
                          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                            <div className="flex items-center gap-2 text-green-700">
                              <span className="text-lg">✓</span>
                              <strong>Transaction Saved Successfully!</strong>
                            </div>

                            <div className="mt-3 space-y-1 text-sm text-gray-700">
                              <p>
                                <strong>Transaction ID:</strong>{" "}
                                {savedTransaction.id}
                              </p>

                              <p>
                                <strong>Amount:</strong> ₹
                                {savedTransaction.amount}
                              </p>

                              <p>
                                <strong>Type:</strong>{" "}
                                {savedTransaction.transaction_type}
                              </p>

                              <p>
                                <strong>Customer:</strong>{" "}
                                {createdCustomer?.full_name ||
                                  matchedCustomer?.full_name ||
                                  match?.customers.find(
                                    (customer) =>
                                      customer.id ===
                                      savedTransaction.customer_id,
                                  )?.full_name ||
                                  result.extracted_transaction.customer_name}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Cancelled */}

                        {cancelledMessages[item.id] && (
                          <div className="rounded-xl bg-gray-100 p-3 text-sm font-medium text-gray-600">
                            Transaction cancelled. Nothing was saved.
                          </div>
                        )}

                        {/* Confirm and Cancel Buttons */}

                        {!savedTransaction && !cancelledMessages[item.id] && (
                          <div className="space-y-3 border-t border-gray-200 pt-4">
                            <p className="text-xs text-gray-500">
                              Please review all details carefully before saving
                              this transaction.
                            </p>

                            {highRiskWarningFor === item.id && (
                              <div className="rounded-xl border border-red-300 bg-red-50 p-4">
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">⚠️</span>

                                  <div className="flex-1">
                                    <h3 className="font-semibold text-red-800">
                                      High Credit Risk Warning!
                                    </h3>

                                    <p className="mt-2 text-sm text-red-700">
                                      This customer has been identified as high
                                      risk based on their repayment history.
                                      Giving additional credit may increase your
                                      outstanding balance.
                                    </p>

                                    {customerRiskData[effectiveCustomerId]
                                      ?.recommendation && (
                                      <p className="mt-2 text-sm font-medium text-red-800">
                                        Recommendation:{" "}
                                        {
                                          customerRiskData[effectiveCustomerId]
                                            .recommendation
                                        }
                                      </p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleConfirmTransaction(item, true)
                                        }
                                        disabled={!!confirmingMessages[item.id]}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                      >
                                        {confirmingMessages[item.id]
                                          ? "Saving..."
                                          : "Continue Anyway"}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setHighRiskWarningFor(null)
                                        }
                                        disabled={!!confirmingMessages[item.id]}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                      >
                                        Go Back
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => handleConfirmTransaction(item)}
                                disabled={
                                  !canConfirm ||
                                  !!confirmingMessages[item.id] ||
                                  highRiskWarningFor === item.id
                                }
                                className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {confirmingMessages[item.id]
                                  ? "Saving..."
                                  : "Confirm Transaction"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCancelTransaction(item.id)}
                                disabled={!!confirmingMessages[item.id]}
                                className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Cancel
                              </button>
                            </div>

                            {!effectiveCustomerId && (
                              <p className="text-xs text-amber-700">
                                Select or create a customer to enable
                                confirmation.
                              </p>
                            )}

                            {!hasValidTransaction && (
                              <p className="text-xs text-amber-700">
                                Complete the missing transaction details before
                                confirmation.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSubmitting && (
              <div className="text-sm text-gray-500">
                AI Assistant is thinking...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSubmit}
            className="sticky bottom-0 mt-8 w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-lg sm:p-4"
          >
            {/* Voice Processing Indicator */}
            {isProcessingVoice && (
              <div
                role="status"
                aria-live="polite"
                className="mb-3 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-5 w-5 animate-spin text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Processing your voice...
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    Transcribing audio and identifying transaction details.
                    Please wait.
                  </p>
                </div>
              </div>
            )}

            <div className="flex w-full items-center gap-2">
              {/* Message Input */}
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Message your Khata Assistant..."
                rows={1}
                maxLength={2000}
                disabled={isRecording || isProcessingVoice}
                className="h-11 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto rounded-xl border-0 bg-transparent px-2 py-3 text-sm leading-5 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 disabled:opacity-50"
              />

              {/* Microphone Button */}
              <button
                type="button"
                onClick={
                  isRecording ? handleStopRecording : handleStartRecording
                }
                disabled={isProcessingVoice || isSubmitting}
                aria-label={
                  isRecording ? "Stop recording" : "Start voice recording"
                }
                title={isRecording ? "Stop recording" : "Record voice"}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isRecording
                    ? "animate-pulse bg-red-600 text-white ring-4 ring-red-100"
                    : "bg-blue-700 text-white hover:bg-blue-800 active:scale-95"
                }`}
              >
                {isRecording ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
                    <path d="M12 19v3" />
                    <path d="M8 22h8" />
                  </svg>
                )}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={
                  !message.trim() ||
                  isSubmitting ||
                  isRecording ||
                  isProcessingVoice
                }
                aria-label="Send message"
                title="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
          </form>
        </section>
      </main>

      {showGlobalCustomerForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create New Customer
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add a customer to your shop.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowGlobalCustomerForm(false)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <CustomerForm
              onCreated={(customer) => {
                setCustomers((current) =>
                  current.some((item) => item.id === customer.id)
                    ? current
                    : [customer, ...current],
                );
                setShowGlobalCustomerForm(false);
              }}
              onCancel={() => setShowGlobalCustomerForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
