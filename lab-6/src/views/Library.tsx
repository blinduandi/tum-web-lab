import { useCallback, useMemo, useState } from "react";

import { BookGrid } from "../components/BookGrid";
import { BookForm } from "../components/BookForm";
import { FilterBar } from "../components/FilterBar";
import { Modal } from "../components/Modal";
import { StatsPanel } from "../components/StatsPanel";
import { EmptyState } from "../components/EmptyState";
import { makeSeedBooks } from "../data/seed";
import { useLibrary } from "../data/LibraryContext";
import { applyFilters, DEFAULT_FILTERS } from "../data/filter";
import { READING_STATUS_ORDER, type Book, type BookDraft } from "../data/types";

type EditorState = { mode: "closed" } | { mode: "add" } | { mode: "edit"; book: Book };

interface LibraryProps {
  onOpenAdd: () => void;
  /**
   * Imperative open handle: parent passes a setter ref so the top-level nav
   * can trigger the modal without library re-rendering its own `+ Add` button.
   */
  registerAddHandler?: (handler: () => void) => void;
}

export function Library({ onOpenAdd: _onOpenAdd, registerAddHandler }: LibraryProps) {
  const {
    books,
    loading,
    addBook,
    updateBook,
    toggleLike,
    deleteBook,
    setStatus,
    resetWith,
  } = useLibrary();
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  registerAddHandler?.(() => setEditor({ mode: "add" }));

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
    <>
      <header className="library-head">
        <div>
          <p className="eyebrow">The Catalog</p>
          <h2 className="display-mid">The Shelf</h2>
        </div>
        <span className="caption-mono">
          {visibleBooks.length === books.length
            ? `${books.length} volumes`
            : `${visibleBooks.length} of ${books.length}`}
        </span>
      </header>

      {loading ? (
        <p className="empty-state">Loading your library</p>
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
            emptyMessage="No volumes match your filters."
            onToggleLike={toggleLike}
            onDelete={handleDelete}
            onCycleStatus={cycleStatus}
            onEdit={handleEdit}
          />
        </>
      )}

      <Modal
        open={editor.mode !== "closed"}
        title={editor.mode === "edit" ? "Edit Volume" : "Add A Volume"}
        onClose={closeEditor}
      >
        <BookForm
          initial={editor.mode === "edit" ? editor.book : null}
          onSubmit={handleSubmit}
          onCancel={closeEditor}
        />
      </Modal>
    </>
  );
}
