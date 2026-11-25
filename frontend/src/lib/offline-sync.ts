
import { createTransaction } from "@/features/transactions/transaction-api";
import type { TransactionResponse } from "@/features/transactions/types";
import { updateOfflineTransaction } from "./offline-repository";
import { getUnsyncedOfflineTransactions } from "./offline-repository";

export interface OfflineSyncResult {
  synced: number;
  failed: number;
  results: TransactionResponse[];
}

export async function syncOfflineTransactions(
  token: string
): Promise<OfflineSyncResult> {
  if (!token) {
    throw new Error("Authentication required to sync transactions.");
  }

  const pendingTransactions = await getUnsyncedOfflineTransactions();

  const result: OfflineSyncResult = {
    synced: 0,
    failed: 0,
    results: [],
  };

  for (const transaction of pendingTransactions) {
    try {
      await updateOfflineTransaction(transaction.id, {
        syncStatus: "syncing",
        lastError: undefined,
      });

      const response = await createTransaction(
        transaction.data,
        token,
        transaction.idempotencyKey
      );

      await updateOfflineTransaction(transaction.id, {
        syncStatus: "synced",
        lastError: undefined,
      });

      result.synced += 1;
      result.results.push(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to sync transaction.";

      await updateOfflineTransaction(transaction.id, {
        syncStatus: "failed",
        retryCount: transaction.retryCount + 1,
        lastError: errorMessage,
      });

      result.failed += 1;
    }
  }

  return result;
}
