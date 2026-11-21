
export type CreditRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "insufficient_data";

export interface CreditRiskResponse {
  customer_id: string;
  risk_level: CreditRiskLevel;
  risk_score: number | null;
  total_transactions: number;
  total_credit_amount: number | string;
  total_payment_amount: number | string;
  outstanding_balance: number | string;
  repayment_ratio: number;
  explanation: string[];
  recommendation: string;
}

