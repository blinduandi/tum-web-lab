import { READING_STATUS_LABEL, type Book } from "../data/types";

interface BookCardProps {
  book: Book;
  onToggleLike: (id: string) => void;
  onDelete: (id: string) => void;
  onCycleStatus: (id: string) => void;
  onEdit: (id: string) => void;
}

export function BookCard({
  book,
  onToggleLike,
  onDelete,
  onCycleStatus,
  onEdit,
}: BookCardProps) {
  return (
    <article className="book-card" data-status={book.status}>
      <div className="book-card__cover">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            onError={(e) => {
              // Hide broken images so the placeholder behind shows through.
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <span className="book-card__cover-fallback" aria-hidden="true">
          {book.title.slice(0, 1).toUpperCase()}
        </span>
        <button
          type="button"
          className={`book-card__like ${book.liked ? "is-liked" : ""}`}
          onClick={() => onToggleLike(book.id)}
          aria-label={book.liked ? "Unlike" : "Like"}
          aria-pressed={book.liked}
        >
          {book.liked ? "♥" : "♡"}
        </button>
      </div>

      <div className="book-card__body">
        <h3 className="book-card__title" title={book.title}>
          {book.title}
        </h3>
        <p className="book-card__author">{book.author || "Unknown author"}</p>

        <div className="book-card__meta">
          {book.genre ? <span className="chip">{book.genre}</span> : null}
          {book.year ? <span className="chip chip--ghost">{book.year}</span> : null}
          {book.pages ? <span className="chip chip--ghost">{book.pages}p</span> : null}
        </div>

        <div className="book-card__actions">
          <button
            type="button"
            className="status-pill"
            onClick={() => onCycleStatus(book.id)}
            title="Click to change status"
          >
            {READING_STATUS_LABEL[book.status]}
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => onEdit(book.id)}
          >
            Edit
          </button>
          <button
            type="button"
            className="link-button link-button--danger"
            onClick={() => onDelete(book.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
