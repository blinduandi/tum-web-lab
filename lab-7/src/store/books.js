// In-memory book store. Process-local, resets on restart — adequate for a
// course lab. The shape of each Book matches the front-end's data type.

import { randomUUID } from "node:crypto";

import { SEED_BOOKS } from "./seed.js";

export const VALID_STATUSES = new Set(["to-read", "reading", "finished"]);

const books = new Map();

(function seed() {
  const now = Date.now();
  for (let i = 0; i < SEED_BOOKS.length; i++) {
    const id = `seed_${i + 1}`;
    books.set(id, {
      id,
      ...SEED_BOOKS[i],
      createdAt: now - (SEED_BOOKS.length - i) * 60_000,
      updatedAt: now - (SEED_BOOKS.length - i) * 60_000,
    });
  }
})();

export function listBooks({ skip = 0, limit = 20 } = {}) {
  // Stable order: most recently updated first. Pagination then slices it.
  const all = [...books.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  const items = all.slice(skip, skip + limit);
  return { items, total: all.length, skip, limit };
}

export function getBook(id) {
  return books.get(id) ?? null;
}

export function createBook(input) {
  const now = Date.now();
  const id = randomUUID();
  const book = withDefaults({ ...input, id, createdAt: now, updatedAt: now });
  books.set(id, book);
  return book;
}

export function updateBook(id, patch) {
  const existing = books.get(id);
  if (!existing) return null;
  // Disallow client-controlled overrides of immutable fields.
  const { id: _id, createdAt: _c, ...safePatch } = patch;
  const next = withDefaults({ ...existing, ...safePatch, updatedAt: Date.now() });
  books.set(id, next);
  return next;
}

export function deleteBook(id) {
  return books.delete(id);
}

// Apply default values for any field the caller omitted. Keeps every stored
// row uniform so consumers don't have to special-case undefined.
function withDefaults(book) {
  return {
    id: book.id,
    title: String(book.title ?? "").trim(),
    author: String(book.author ?? "").trim(),
    genre: String(book.genre ?? "").trim(),
    year: book.year == null ? null : Number(book.year),
    pages: book.pages == null ? null : Number(book.pages),
    status: VALID_STATUSES.has(book.status) ? book.status : "to-read",
    rating: clamp(Number(book.rating ?? 0), 0, 5),
    liked: Boolean(book.liked),
    notes: String(book.notes ?? ""),
    coverUrl: String(book.coverUrl ?? "").trim(),
    createdAt: book.createdAt ?? Date.now(),
    updatedAt: book.updatedAt ?? Date.now(),
  };
}

function clamp(n, min, max) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
