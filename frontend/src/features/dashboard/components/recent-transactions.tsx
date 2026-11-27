import type { RecentTransaction } from "../types";

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

function formatAmount(amount: number | string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Recent Transactions
      </h2>

      {transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No transactions available yet.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Date & Time</th>
                <th className="pb-3 text-right font-medium">Amount</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-4 font-medium text-slate-800">
                    {transaction.customer_name}
                    {transaction.description && (
                      <p className="mt-1 text-xs font-normal text-slate-500">
                        {transaction.description}
                      </p>
                    )}
                  </td>

                  <td className="py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        transaction.transaction_type === "credit"
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {transaction.transaction_type === "credit"
                        ? "Credit"
                        : "Payment"}
                    </span>
                  </td>

                  <td className="py-4 text-slate-500">
                    {formatDateTime(transaction.transaction_date)}
                  </td>

                  <td className="py-4 text-right font-semibold text-slate-800">
                    {formatAmount(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
