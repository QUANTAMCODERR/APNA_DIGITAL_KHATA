
export type TransactionType = "credit" | "payment";

export type Money = number | string;

export interface RecentTransaction {
  id: string;
  customer_id: string;
  customer_name: string;
  transaction_type: TransactionType;
  amount: Money;
  description: string | null;
  transaction_date: string;
}

export interface DashboardSummary {
  total_customers: number;
  total_transactions: number;
  total_credit_amount: Money;
  total_payment_amount: Money;
  outstanding_balance: Money;
  recent_transactions: RecentTransaction[];
}
