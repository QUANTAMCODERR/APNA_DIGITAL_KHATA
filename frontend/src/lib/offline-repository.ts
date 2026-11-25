import { getOfflineDB } from "./offline-storage";
import type { OfflineTransaction } from "./offline-db";

// Save a transaction locally
export async function saveOfflineTransaction(
  transaction: OfflineTransaction
): Promise<void> {
  const db = await getOfflineDB();

  await db.put("offlineTransactions", transaction);
}

// Get a transaction using its local ID
export async function getOfflineTransaction(
  id: string
): Promise<OfflineTransaction | undefined> {
  const db = await getOfflineDB();

  return db.get("offlineTransactions", id);
}

// Get all pending transactions
export async function getPendingOfflineTransactions():
  Promise<OfflineTransaction[]> {
  const db = await getOfflineDB();

  const transactions = await db.getAllFromIndex(
    "offlineTransactions",
    "by-sync-status",
    "pending"
  );

  return transactions.sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}

// Update transaction status or other fields
export async function updateOfflineTransaction(
  id: string,
  updates: Partial<Omit<OfflineTransaction, "id">>
): Promise<void> {
  const db = await getOfflineDB();

  const existing = await db.get("offlineTransactions", id);

  if (!existing) {
    throw new Error("Offline transaction not found.");
  }

  await db.put("offlineTransactions", {
    ...existing,
    ...updates,
    id: existing.id,
  });
}

// Delete a transaction after successful synchronization
export async function deleteOfflineTransaction(
  id: string
): Promise<void> {
  const db = await getOfflineDB();

  await db.delete("offlineTransactions", id);
}



export async function getUnsyncedOfflineTransactions(): Promise<OfflineTransaction[]> {
  const db = await getOfflineDB();

  const [pending, failed] = await Promise.all([
    db.getAllFromIndex(
      "offlineTransactions",
      "by-sync-status",
      "pending"
    ),
    db.getAllFromIndex(
      "offlineTransactions",
      "by-sync-status",
      "failed"
    ),
  ]);

  return [...pending, ...failed].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}


