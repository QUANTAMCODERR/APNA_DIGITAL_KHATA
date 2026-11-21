
import { apiRequest } from "@/lib/api";

import type {
  TransactionCreate,
  TransactionResponse,
  CustomerBalance,
  CustomerTransactionHistory,
} from "./types";

// Create credit or payment transaction
export async function createTransaction(
  data: TransactionCreate,
  token: string
): Promise<TransactionResponse> {
  return apiRequest<TransactionResponse>("/transactions/", {
    method: "POST",
    body: data,
    token,
  });
}

// Get customer outstanding balance
export async function getCustomerBalance(
  customerId: string,
  token: string
): Promise<CustomerBalance> {
  return apiRequest<CustomerBalance>(
    `/transactions/customers/${customerId}/balance`,
    {
      method: "GET",
      token,
    }
  );
}

// Get customer transaction history
export async function getCustomerTransactionHistory(
  customerId: string,
  token: string,
  skip: number = 0,
  limit: number = 50
): Promise<CustomerTransactionHistory> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });

  return apiRequest<CustomerTransactionHistory>(
    `/transactions/customers/${customerId}/history?${params.toString()}`,
    {
      method: "GET",
      token,
    }
  );
}
