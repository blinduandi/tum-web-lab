// API client for the Lab 7 back-end (pagebound-api).
// Pure transport layer — no React, no global state. Returns parsed JSON or
// throws a structured ApiError so callers can match on `.status`.

import type { Book, BookDraft } from "./types";

const TOKEN_KEY = "pagebound:apiToken";
const BASE_URL_KEY = "pagebound:apiBase";
const DEFAULT_BASE = "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  code: string | undefined;
  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function getApiBase(): string {
  return localStorage.getItem(BASE_URL_KEY) || DEFAULT_BASE;
}

export function setApiBase(url: string) {
  if (url) localStorage.setItem(BASE_URL_KEY, url);
  else localStorage.removeItem(BASE_URL_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

interface RequestInitJson extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(path: string, init: RequestInitJson = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init.body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${getApiBase()}${path}`, {
      ...init,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch (err) {
    throw new ApiError(0, "network_error", `Network error: ${(err as Error).message}`);
  }

  if (res.status === 204) return undefined as T;

  // The server speaks JSON for both success and errors, but be defensive
  // against non-JSON proxies / 502 pages.
  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { error: "bad_response", message: text.slice(0, 200) };
    }
  }

  if (!res.ok) {
    const body = parsed as { error?: string; message?: string } | null;
    throw new ApiError(
      res.status,
      body?.error,
      body?.message || `HTTP ${res.status}`,
    );
  }
  return parsed as T;
}

// ── Auth ────────────────────────────────────────────────────────────────

export interface TokenResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  role: string;
  permissions: string[];
}

export function requestToken(role: string, permissions: string[] = []): Promise<TokenResponse> {
  return request<TokenResponse>("/token", {
    method: "POST",
    body: { role, permissions },
  });
}

// ── Books CRUD ──────────────────────────────────────────────────────────

export interface BooksPage {
  items: Book[];
  total: number;
  skip: number;
  limit: number;
}

export function fetchBooks(skip = 0, limit = 100): Promise<BooksPage> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  return request<BooksPage>(`/books?${params}`);
}

export function fetchAllBooks(): Promise<Book[]> {
  // The list endpoint caps at 100 per page. Walk pages until exhausted.
  return (async () => {
    const out: Book[] = [];
    let skip = 0;
    const limit = 100;
    for (;;) {
      const page = await fetchBooks(skip, limit);
      out.push(...page.items);
      if (out.length >= page.total || page.items.length === 0) break;
      skip += limit;
    }
    return out;
  })();
}

export function createBook(draft: BookDraft): Promise<Book> {
  return request<Book>("/books", { method: "POST", body: draft });
}

export function updateBook(id: string, patch: Partial<BookDraft>): Promise<Book> {
  return request<Book>(`/books/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: patch,
  });
}

export function deleteBookRemote(id: string): Promise<void> {
  return request<void>(`/books/${encodeURIComponent(id)}`, { method: "DELETE" });
}
