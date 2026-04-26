import { useCallback } from "react";

import { ThemeToggle } from "./components/ThemeToggle";
import { BookGrid } from "./components/BookGrid";
import { useLibrary } from "./data/LibraryContext";
import { READING_STATUS_ORDER } from "./data/types";

export default function App() {
  const { books, loading, toggleLike, deleteBook, setStatus } = useLibrary();

  // Cycle through reading -> to-read -> finished on click. Order matches
  // READING_STATUS_ORDER so the visual progression is predictable.
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

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Pagebound</h1>
        <ThemeToggle />
      </header>

      {loading ? (
        <p className="empty-state">Loading your library…</p>
      ) : (
        <BookGrid
          books={books}
          emptyMessage="Your shelf is empty. Add a book to get started."
          onToggleLike={toggleLike}
          onDelete={deleteBook}
          onCycleStatus={cycleStatus}
          onEdit={() => {
            /* edit modal lands in a follow-up commit */
          }}
        />
      )}
    </main>
  );
}
