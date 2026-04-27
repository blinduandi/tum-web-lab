import type { Book } from "../data/types";
import { BookCard } from "./BookCard";

interface BookGridProps {
  books: Book[];
  emptyMessage: string;
  onToggleLike: (id: string) => void;
  onDelete: (id: string) => void;
  onCycleStatus: (id: string) => void;
  onEdit: (id: string) => void;
}

export function BookGrid({
  books,
  emptyMessage,
  onToggleLike,
  onDelete,
  onCycleStatus,
  onEdit,
}: BookGridProps) {
  if (books.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }
  return (
    <div className="book-grid">
      {books.map((book, i) => (
        <BookCard
          key={book.id}
          index={i}
          book={book}
          onToggleLike={onToggleLike}
          onDelete={onDelete}
          onCycleStatus={onCycleStatus}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
