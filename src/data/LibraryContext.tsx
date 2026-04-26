// Library context. Owns the in-memory list of books, exposes mutating
// actions, and mirrors every change to IndexedDB. Components should never
// touch the DB directly — they go through the actions exported here.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import * as db from "./db";
import type { Book, BookDraft } from "./types";

interface LibraryContextValue {
  books: Book[];
  loading: boolean;
  addBook: (draft: BookDraft) => Promise<Book>;
  updateBook: (id: string, patch: Partial<BookDraft>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  setStatus: (id: string, status: Book["status"]) => Promise<void>;
  resetWith: (books: Book[]) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function LibraryProvider({ children }: PropsWithChildren) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate from IndexedDB on mount. If anything goes wrong (private mode,
  // quota errors), we surface an empty library rather than crashing the UI.
  useEffect(() => {
    let active = true;
    db.listBooks()
      .then((rows) => {
        if (active) setBooks(rows);
      })
      .catch((err) => {
        console.error("Failed to load library from IndexedDB", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addBook = useCallback(async (draft: BookDraft) => {
    const now = Date.now();
    const book: Book = { ...draft, id: makeId(), createdAt: now, updatedAt: now };
    await db.putBook(book);
    setBooks((prev) => [...prev, book]);
    return book;
  }, []);

  const updateBook = useCallback(async (id: string, patch: Partial<BookDraft>) => {
    let updated: Book | null = null;
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        updated = { ...b, ...patch, updatedAt: Date.now() };
        return updated;
      }),
    );
    if (updated) await db.putBook(updated);
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    await db.deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const toggleLike = useCallback(
    (id: string) => {
      const book = books.find((b) => b.id === id);
      if (!book) return Promise.resolve();
      return updateBook(id, { liked: !book.liked });
    },
    [books, updateBook],
  );

  const setStatus = useCallback(
    (id: string, status: Book["status"]) => updateBook(id, { status }),
    [updateBook],
  );

  const resetWith = useCallback(async (next: Book[]) => {
    await db.clearBooks();
    for (const b of next) await db.putBook(b);
    setBooks(next);
  }, []);

  const value = useMemo<LibraryContextValue>(
    () => ({
      books,
      loading,
      addBook,
      updateBook,
      deleteBook,
      toggleLike,
      setStatus,
      resetWith,
    }),
    [books, loading, addBook, updateBook, deleteBook, toggleLike, setStatus, resetWith],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
