// Thin Promise wrapper around IndexedDB. We deliberately avoid a third-party
// library (idb, dexie) — the surface we use is small enough that the
// boilerplate isn't worth a dependency.

import type { Book } from "./types";

const DB_NAME = "pagebound";
const DB_VERSION = 1;
const STORE = "books";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        // Indexes used by future filtering — created up-front to avoid a
        // schema migration when filters land.
        store.createIndex("by_status", "status");
        store.createIndex("by_updated", "updatedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

function tx(mode: IDBTransactionMode) {
  return openDb().then((db) => db.transaction(STORE, mode).objectStore(STORE));
}

function awaitRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listBooks(): Promise<Book[]> {
  const store = await tx("readonly");
  return awaitRequest(store.getAll() as IDBRequest<Book[]>);
}

export async function putBook(book: Book): Promise<void> {
  const store = await tx("readwrite");
  await awaitRequest(store.put(book));
}

export async function deleteBook(id: string): Promise<void> {
  const store = await tx("readwrite");
  await awaitRequest(store.delete(id));
}

export async function clearBooks(): Promise<void> {
  const store = await tx("readwrite");
  await awaitRequest(store.clear());
}
