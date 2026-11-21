
import { apiRequest } from "@/lib/api";
import type { DashboardSummary } from "./types";

export async function getDashboardSummary(
  token: string
): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>("/dashboard/summary", {
    method: "GET",
    token,
  });
}
