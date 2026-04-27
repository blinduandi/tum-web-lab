import { useEffect, useState, type FormEvent } from "react";

import {
  READING_STATUS_LABEL,
  READING_STATUS_ORDER,
  type Book,
  type BookDraft,
  type ReadingStatus,
} from "../data/types";

interface BookFormProps {
  initial?: Book | null;
  onSubmit: (draft: BookDraft) => void;
  onCancel: () => void;
}

const EMPTY: BookDraft = {
  title: "",
  author: "",
  genre: "",
  year: null,
  pages: null,
  status: "to-read",
  rating: 0,
  liked: false,
  notes: "",
  coverUrl: "",
};

function toDraft(book: Book | null | undefined): BookDraft {
  if (!book) return { ...EMPTY };
  // Strip the persisted-only fields so the form holds a pure draft.
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = book;
  return rest;
}

export function BookForm({ initial, onSubmit, onCancel }: BookFormProps) {
  const [draft, setDraft] = useState<BookDraft>(() => toDraft(initial));
  const [error, setError] = useState<string | null>(null);

  // When the parent swaps which book is being edited (Edit -> Add), reset.
  useEffect(() => {
    setDraft(toDraft(initial));
    setError(null);
  }, [initial]);

  function update<K extends keyof BookDraft>(key: K, value: BookDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    onSubmit({
      ...draft,
      title: draft.title.trim(),
      author: draft.author.trim(),
      genre: draft.genre.trim(),
      coverUrl: draft.coverUrl.trim(),
      notes: draft.notes.trim(),
    });
  }

  return (
    <form className="book-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Title *</span>
        <input
          type="text"
          required
          value={draft.title}
          onChange={(e) => update("title", e.target.value)}
          autoFocus
        />
      </label>

      <label className="field">
        <span>Author</span>
        <input
          type="text"
          value={draft.author}
          onChange={(e) => update("author", e.target.value)}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Genre</span>
          <input
            type="text"
            value={draft.genre}
            onChange={(e) => update("genre", e.target.value)}
            placeholder="e.g. Fantasy"
          />
        </label>

        <label className="field">
          <span>Year</span>
          <input
            type="number"
            value={draft.year ?? ""}
            min={0}
            onChange={(e) =>
              update("year", e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </label>

        <label className="field">
          <span>Pages</span>
          <input
            type="number"
            value={draft.pages ?? ""}
            min={0}
            onChange={(e) =>
              update("pages", e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </label>
      </div>

      <label className="field">
        <span>Cover URL</span>
        <input
          type="url"
          value={draft.coverUrl}
          onChange={(e) => update("coverUrl", e.target.value)}
          placeholder="https://…"
        />
      </label>

      <label className="field">
        <span>Status</span>
        <select
          value={draft.status}
          onChange={(e) => update("status", e.target.value as ReadingStatus)}
        >
          {READING_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {READING_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Notes</span>
        <textarea
          rows={3}
          value={draft.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="button" className="button button--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button--primary">
          {initial ? "Save changes" : "Add book"}
        </button>
      </div>
    </form>
  );
}
