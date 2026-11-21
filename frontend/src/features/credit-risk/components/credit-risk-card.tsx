
"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/auth-context";
import { getCustomerCreditRisk } from "@/features/credit-risk/credit-risk-api";

import type { CreditRiskResponse } from "@/features/credit-risk/types";

interface CreditRiskCardProps {
  customerId: string;
  refreshKey: number;
}

function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

const riskStyles = {
  low: {
    label: "Low Risk",
    className: "bg-green-100 text-green-700",
  },
  medium: {
    label: "Medium Risk",
    className: "bg-yellow-100 text-yellow-700",
  },
  high: {
    label: "High Risk",
    className: "bg-red-100 text-red-700",
  },
  insufficient_data: {
    label: "Insufficient Data",
    className: "bg-gray-100 text-gray-700",
  },
};

export default function CreditRiskCard({
  customerId,
  refreshKey,
}: CreditRiskCardProps) {
  const { token } = useAuth();

  const [assessment, setAssessment] =
    useState<CreditRiskResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCreditRisk = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await getCustomerCreditRisk(
        customerId,
        token
      );

      setAssessment(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load credit risk assessment."
      );
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    loadCreditRisk();
  }, [loadCreditRisk, refreshKey]);

  if (loading) {
    return (
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Analyzing customer repayment behaviour...
        </p>
      </section>
    );
  }

  if (error || !assessment) {
    return (
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Credit Risk Assessment
        </h2>

        <p className="mt-3 text-sm text-red-600">
          {error || "Assessment unavailable."}
        </p>

        <button
          onClick={loadCreditRisk}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Retry Assessment
        </button>
      </section>
    );
  }

  const risk = riskStyles[assessment.risk_level];

  const repaymentPercentage =
    assessment.repayment_ratio * 100;

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Credit Risk Assessment
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Rule-based customer repayment behaviour analysis
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${risk.className}`}
        >
          {risk.label}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Total Transactions
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {assessment.total_transactions}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Total Credit
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatCurrency(assessment.total_credit_amount)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Total Payments
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatCurrency(assessment.total_payment_amount)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Outstanding Balance
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatCurrency(assessment.outstanding_balance)}
          </p>
        </div>
      </div>

      {assessment.risk_level !== "insufficient_data" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Repayment Ratio
            </p>

            <p className="text-sm font-bold text-gray-900">
              {repaymentPercentage.toFixed(1)}%
            </p>
          </div>

          <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${Math.min(Math.max(repaymentPercentage, 0), 100)}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Total payments divided by total credit.
          </p>
        </div>
      )}

      <div className="mt-6 border-t border-gray-100 pt-5">
        <h3 className="font-semibold text-gray-900">
          Assessment Explanation
        </h3>

        {assessment.explanation.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {assessment.explanation.map((item, index) => (
              <li
                key={index}
                className="flex gap-2 text-sm text-gray-600"
              >
                <span className="text-blue-600">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            No explanation available.
          </p>
        )}
      </div>

      <div className="mt-5 rounded-lg bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">
          Recommendation
        </h3>

        <p className="mt-2 text-sm leading-6 text-blue-800">
          {assessment.recommendation}
        </p>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        This is an explainable rule-based assessment, not a
        trained predictive ML model. Use it as decision support.
      </p>
    </section>
  );
}
