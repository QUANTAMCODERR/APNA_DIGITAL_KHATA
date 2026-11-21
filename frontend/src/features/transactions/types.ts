
export type TransactionType = "credit" | "payment";

export type TransactionSource = "manual" | "voice";

export type Money = number | string;

export interface TransactionCreate {
  customer_id: string;
  transaction_type: TransactionType;
  amount: Money;
  description: string | null;
  due_date: string | null;
}

export interface TransactionResponse {
  id: string;
  customer_id: string;
  transaction_type: TransactionType;
  amount: Money;
  description: string | null;
  source: TransactionSource;
  due_date: string | null;
  transaction_date: string;
  created_at: string;
}

export interface CustomerBalance {
  customer_id: string;
  outstanding_balance: Money;
  currency: string;
}

export type CustomerTransactionHistory = TransactionResponse[];
