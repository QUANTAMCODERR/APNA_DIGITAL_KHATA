
import { apiRequest } from "@/lib/api";

import type { CreditRiskResponse } from "./types";

export async function getCustomerCreditRisk(
  customerId: string,
  token: string
): Promise<CreditRiskResponse> {
  return apiRequest<CreditRiskResponse>(
    `/credit-risk/customers/${customerId}`,
    {
      method: "GET",
      token,
    }
  );
}
