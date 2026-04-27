import { useCallback, useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "./components/ThemeToggle";
import { BackendToggle } from "./components/BackendToggle";
import { SignInDialog } from "./components/SignInDialog";
import { BookGrid } from "./components/BookGrid";
import { BookForm } from "./components/BookForm";
import { FilterBar } from "./components/FilterBar";
import { Modal } from "./components/Modal";
import { StatsPanel } from "./components/StatsPanel";
import { EmptyState } from "./components/EmptyState";
import { makeSeedBooks } from "./data/seed";
import { useLibrary } from "./data/LibraryContext";
import { applyFilters, DEFAULT_FILTERS } from "./data/filter";
import { READING_STATUS_ORDER, type Book, type BookDraft } from "./data/types";

type EditorState = { mode: "closed" } | { mode: "add" } | { mode: "edit"; book: Book };

export default function App() {
  const {
    books,
    loading,
    backend,
    apiAuthRequired,
    setBackend,
    acknowledgeAuth,
    addBook,
    updateBook,
    toggleLike,
    deleteBook,
    setStatus,
    resetWith,
  } = useLibrary();
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [signInOpen, setSignInOpen] = useState(false);

  // The context flips this flag when an API call returns 401 — open the
  // sign-in dialog so the user can mint a fresh token.
  useEffect(() => {
    if (apiAuthRequired) setSignInOpen(true);
  }, [apiAuthRequired]);

  function handleSignInCancel() {
    setSignInOpen(false);
    acknowledgeAuth();
    // If the user opened the dialog by switching to remote and then bailed,
    // drop them back to the local backend so the empty list isn't confusing.
    if (apiAuthRequired) setBackend("local");
  }

  function handleSignedIn() {
    setSignInOpen(false);
    acknowledgeAuth();
    // Force a reload by toggling backend through itself.
    setBackend(backend);
  }

  const visibleBooks = useMemo(() => applyFilters(books, filters), [books, filters]);
  const hasAnyBooks = books.length > 0;

  const cycleStatus = useCallback(
    (id: string) => {
      const book = books.find((b) => b.id === id);
      if (!book) return;
      const i = READING_STATUS_ORDER.indexOf(book.status);
      const next = READING_STATUS_ORDER[(i + 1) % READING_STATUS_ORDER.length];
      void setStatus(id, next);
    },
    [books, setStatus],
  );

  const closeEditor = useCallback(() => setEditor({ mode: "closed" }), []);

  const handleSubmit = useCallback(
    async (draft: BookDraft) => {
      if (editor.mode === "add") await addBook(draft);
      else if (editor.mode === "edit") await updateBook(editor.book.id, draft);
      closeEditor();
    },
    [editor, addBook, updateBook, closeEditor],
  );

  const handleEdit = useCallback(
    (id: string) => {
      const book = books.find((b) => b.id === id);
      if (book) setEditor({ mode: "edit", book });
    },
    [books],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const book = books.find((b) => b.id === id);
      if (!book) return;
      if (confirm(`Remove "${book.title}" from your library?`)) {
        void deleteBook(id);
      }
    },
    [books, deleteBook],
  );

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Pagebound</h1>
          <p className="app-subtitle">Your personal library, on the shelf next to the browser tab.</p>
        </div>
        <div className="app-header__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => setEditor({ mode: "add" })}
          >
            + Add book
          </button>
          <BackendToggle onSignInRequest={() => setSignInOpen(true)} />
          <ThemeToggle />
        </div>
      </header>

      {loading ? (
        <p className="empty-state">Loading your library…</p>
      ) : !hasAnyBooks ? (
        <EmptyState
          onAddClick={() => setEditor({ mode: "add" })}
          onLoadSample={() => void resetWith(makeSeedBooks())}
        />
      ) : (
        <>
          <StatsPanel books={books} />
          <FilterBar
            filters={filters}
            onChange={setFilters}
            totalCount={books.length}
            visibleCount={visibleBooks.length}
          />
          <BookGrid
            books={visibleBooks}
            emptyMessage="No books match your filters. Try clearing them."
            onToggleLike={toggleLike}
            onDelete={handleDelete}
            onCycleStatus={cycleStatus}
            onEdit={handleEdit}
          />
        </>
      )}

      <footer className="app-footer">
        Built for FAF Web Programming Lab 6 — data lives only in your browser.
      </footer>

      <Modal
        open={editor.mode !== "closed"}
        title={editor.mode === "edit" ? "Edit book" : "Add a book"}
        onClose={closeEditor}
      >
        <BookForm
          initial={editor.mode === "edit" ? editor.book : null}
          onSubmit={handleSubmit}
          onCancel={closeEditor}
        />
      </Modal>

      <Modal
        open={signInOpen}
        title="Connect to Pagebound API"
        onClose={handleSignInCancel}
      >
        <SignInDialog onSignedIn={handleSignedIn} onCancel={handleSignInCancel} />
      </Modal>
    </main>
  );
}
