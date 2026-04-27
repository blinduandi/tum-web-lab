// /books CRUD. Each method is gated by the permission the operation needs:
//   READ   — list, get
//   WRITE  — create, update
//   DELETE — delete
//
// Pagination is exposed via `?skip=N&limit=M` on the list endpoint, with
// safe defaults and a hard ceiling so a misbehaving client can't pull
// the whole table.

import { Router } from "express";

import { requireAuth, requirePermission } from "../auth/middleware.js";
import { PERMISSIONS } from "../auth/roles.js";
import {
  createBook,
  deleteBook,
  getBook,
  listBooks,
  updateBook,
  VALID_STATUSES,
} from "../store/books.js";

export const booksRouter = Router();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

booksRouter.get(
  "/books",
  requireAuth,
  requirePermission(PERMISSIONS.READ),
  (req, res) => {
    const { skip, limit } = parsePagination(req.query);
    const page = listBooks({ skip, limit });
    res.status(200).json(page);
  },
);

booksRouter.get(
  "/books/:id",
  requireAuth,
  requirePermission(PERMISSIONS.READ),
  (req, res) => {
    const book = getBook(req.params.id);
    if (!book) return res.status(404).json({ error: "not_found" });
    res.status(200).json(book);
  },
);

booksRouter.post(
  "/books",
  requireAuth,
  requirePermission(PERMISSIONS.WRITE),
  (req, res) => {
    const error = validateBookInput(req.body, { partial: false });
    if (error) return res.status(400).json({ error: "invalid_input", message: error });
    const created = createBook(req.body);
    res.status(201).location(`/books/${created.id}`).json(created);
  },
);

booksRouter.put(
  "/books/:id",
  requireAuth,
  requirePermission(PERMISSIONS.WRITE),
  (req, res) => {
    const error = validateBookInput(req.body, { partial: true });
    if (error) return res.status(400).json({ error: "invalid_input", message: error });
    const updated = updateBook(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "not_found" });
    res.status(200).json(updated);
  },
);

booksRouter.delete(
  "/books/:id",
  requireAuth,
  requirePermission(PERMISSIONS.DELETE),
  (req, res) => {
    const ok = deleteBook(req.params.id);
    if (!ok) return res.status(404).json({ error: "not_found" });
    res.status(204).end();
  },
);

function parsePagination(query) {
  const skip = Math.max(0, Number.parseInt(query.skip ?? "0", 10) || 0);
  const rawLimit = Number.parseInt(query.limit ?? String(DEFAULT_LIMIT), 10);
  const limit = clamp(Number.isNaN(rawLimit) ? DEFAULT_LIMIT : rawLimit, 1, MAX_LIMIT);
  return { skip, limit };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function validateBookInput(body, { partial }) {
  if (!body || typeof body !== "object") return "Request body must be a JSON object.";
  if (!partial && !body.title) return "Field `title` is required.";
  if (body.title != null && typeof body.title !== "string") return "`title` must be a string.";
  if (body.status != null && !VALID_STATUSES.has(body.status)) {
    return `\`status\` must be one of ${[...VALID_STATUSES].join(", ")}.`;
  }
  if (body.rating != null && (typeof body.rating !== "number" || body.rating < 0 || body.rating > 5)) {
    return "`rating` must be a number between 0 and 5.";
  }
  return null;
}
