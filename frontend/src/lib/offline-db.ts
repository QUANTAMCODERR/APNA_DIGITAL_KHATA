import type { DBSchema } from "idb";
import type { TransactionCreate } from "@/features/transactions/types";

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export interface OfflineTransaction {
  id: string;
  idempotencyKey: string;
  data: TransactionCreate;
  syncStatus: SyncStatus;
  retryCount: number;
  createdAt: string;
  lastError?: string;
}

export interface KhataDB extends DBSchema {
  offlineTransactions: {
    key: string;
    value: OfflineTransaction;
    indexes: {
      "by-sync-status": SyncStatus;
      "by-created-at": string;
    };
  };
}