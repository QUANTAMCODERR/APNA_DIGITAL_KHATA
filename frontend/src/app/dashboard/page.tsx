
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/features/auth/auth-context";
import { getDashboardSummary } from "@/features/dashboard/dashboard-api";

import SummaryCard from "@/features/dashboard/components/summary-card";
import RecentTransactions from "@/features/dashboard/components/recent-transactions";

import type { DashboardSummary } from "@/features/dashboard/types";

function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, isAuthenticated } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !token) {
      router.replace("/login");
      return;
    }

    let active = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getDashboardSummary(token!);

        if (active) {
          setSummary(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, token, router]);

  if (authLoading || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Aapka Digital Khata
              </p>

              <h1 className="mt-2 text-2xl font-bold text-slate-900">
                Welcome, {user?.full_name}!
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Here is your business overview.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/notifications"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Notifications
              </Link>

              <Link
                href="/customers"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Manage Customers
              </Link>
            </div>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {summary && (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Total Customers"
                value={String(summary.total_customers)}
                description="Customers in your shop"
              />

              <SummaryCard
                title="Total Transactions"
                value={String(summary.total_transactions)}
                description="All recorded transactions"
              />

              <SummaryCard
                title="Total Credit"
                value={formatCurrency(summary.total_credit_amount)}
                description="Total udhar given"
              />

              <SummaryCard
                title="Total Payments"
                value={formatCurrency(summary.total_payment_amount)}
                description="Total payments received"
              />
            </section>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Outstanding Balance
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {formatCurrency(summary.outstanding_balance)}
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Total amount customers still owe your business.
              </p>
            </section>

            <section className="mt-6">
              <RecentTransactions
                transactions={summary.recent_transactions}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
