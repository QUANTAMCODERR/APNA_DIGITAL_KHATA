import { openDB, type IDBPDatabase } from "idb";
import type { KhataDB } from "./offline-db";

const DB_NAME = "universal-digital-khata";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<KhataDB>> | null = null;

export function getOfflineDB(): Promise<IDBPDatabase<KhataDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is only available in the browser.")
    );
  }

  if (!dbPromise) {
    dbPromise = openDB<KhataDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("offlineTransactions", {
          keyPath: "id",
        });

        store.createIndex("by-sync-status", "syncStatus");
        store.createIndex("by-created-at", "createdAt");
      },
    }).catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}