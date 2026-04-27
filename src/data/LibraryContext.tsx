// Library context. Owns the in-memory list of books and persists every
// change through one of two backends:
//   - "local" (default) → IndexedDB
//   - "remote"          → Lab 7 REST API
//
// Components don't see this distinction — they just call the actions.
// When a remote call fails with 401 (no/expired token), we surface that
// via `apiAuthRequired` so the UI can prompt for sign-in.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import * as db from "./db";
import * as api from "./api";
import type { Book, BookDraft } from "./types";

export type Backend = "local" | "remote";

const BACKEND_KEY = "pagebound:backend";

interface LibraryContextValue {
  books: Book[];
  loading: boolean;
  backend: Backend;
  apiAuthRequired: boolean;
  setBackend: (b: Backend) => void;
  acknowledgeAuth: () => void;
  addBook: (draft: BookDraft) => Promise<Book | null>;
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

function readInitialBackend(): Backend {
  return localStorage.getItem(BACKEND_KEY) === "remote" ? "remote" : "local";
}

export function LibraryProvider({ children }: PropsWithChildren) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [backend, setBackendState] = useState<Backend>(() => readInitialBackend());
  const [apiAuthRequired, setApiAuthRequired] = useState(false);

  // Latest backend value — readable inside async callbacks without
  // re-creating them every time the state changes.
  const backendRef = useRef(backend);
  backendRef.current = backend;

  const setBackend = useCallback((b: Backend) => {
    localStorage.setItem(BACKEND_KEY, b);
    setBackendState(b);
  }, []);

  const acknowledgeAuth = useCallback(() => setApiAuthRequired(false), []);

  // Centralized handling for API failures. 401 means the user needs to
  // (re-)sign in; we surface that through `apiAuthRequired`. Anything else
  // we log + alert so the user knows the operation didn't go through.
  const handleApiError = useCallback((err: unknown) => {
    if (err instanceof api.ApiError && err.status === 401) {
      setApiAuthRequired(true);
      return;
    }
    console.error("[api]", err);
    alert(`API error: ${(err as Error).message}`);
  }, []);

  // Load (or reload) the library whenever the backend changes.
  useEffect(() => {
    let active = true;
    setLoading(true);

    const load = async () => {
      try {
        if (backend === "remote") {
          if (!api.getToken()) {
            // No token yet — show empty library and prompt for sign-in.
            if (active) {
              setBooks([]);
              setApiAuthRequired(true);
            }
            return;
          }
          const items = await api.fetchAllBooks();
          if (active) setBooks(items);
        } else {
          const items = await db.listBooks();
          if (active) setBooks(items);
        }
      } catch (err) {
        if (active) handleApiError(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [backend, handleApiError]);

  const addBook = useCallback(
    async (draft: BookDraft) => {
      try {
        if (backendRef.current === "remote") {
          const created = await api.createBook(draft);
          setBooks((prev) => [created, ...prev]);
          return created;
        }
        const now = Date.now();
        const book: Book = { ...draft, id: makeId(), createdAt: now, updatedAt: now };
        await db.putBook(book);
        setBooks((prev) => [...prev, book]);
        return book;
      } catch (err) {
        handleApiError(err);
        return null;
      }
    },
    [handleApiError],
  );

  const updateBook = useCallback(
    async (id: string, patch: Partial<BookDraft>) => {
      try {
        if (backendRef.current === "remote") {
          const updated = await api.updateBook(id, patch);
          setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
          return;
        }
        let updated: Book | null = null;
        setBooks((prev) =>
          prev.map((b) => {
            if (b.id !== id) return b;
            updated = { ...b, ...patch, updatedAt: Date.now() };
            return updated;
          }),
        );
        if (updated) await db.putBook(updated);
      } catch (err) {
        handleApiError(err);
      }
    },
    [handleApiError],
  );

  const deleteBook = useCallback(
    async (id: string) => {
      try {
        if (backendRef.current === "remote") {
          await api.deleteBookRemote(id);
        } else {
          await db.deleteBook(id);
        }
        setBooks((prev) => prev.filter((b) => b.id !== id));
      } catch (err) {
        handleApiError(err);
      }
    },
    [handleApiError],
  );

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

  const resetWith = useCallback(
    async (next: Book[]) => {
      // resetWith is only used by the "Load sample shelf" button on the
      // empty state, which is a local-only convenience. In remote mode
      // we ignore it — the back-end already seeds its own data.
      if (backendRef.current === "remote") return;
      await db.clearBooks();
      for (const b of next) await db.putBook(b);
      setBooks(next);
    },
    [],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      books,
      loading,
      backend,
      apiAuthRequired,
      setBackend,
      acknowledgeAuth,
      addBook,
      updateBook,
      deleteBook,
      toggleLike,
      setStatus,
      resetWith,
    }),
    [
      books,
      loading,
      backend,
      apiAuthRequired,
      setBackend,
      acknowledgeAuth,
      addBook,
      updateBook,
      deleteBook,
      toggleLike,
      setStatus,
      resetWith,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
