import type { TransactionCreate } from "@/features/transactions/types";
import { generateIdempotencyKey } from "./idempotency";
import { saveOfflineTransaction } from "./offline-repository";
import type { OfflineTransaction } from "./offline-db";

export async function queueOfflineTransaction(
  data: TransactionCreate
): Promise<OfflineTransaction> {
  const transaction: OfflineTransaction = {
    id: crypto.randomUUID(),
    idempotencyKey: generateIdempotencyKey(),
    data,
    syncStatus: "pending",
    retryCount: 0,
    createdAt: new Date().toISOString(),
  };

  await saveOfflineTransaction(transaction);

  return transaction;
}