import { READING_STATUS_LABEL, READING_STATUS_ORDER, type Book } from "../data/types";

interface BookCardProps {
  book: Book;
  index: number;
  onToggleLike: (id: string) => void;
  onDelete: (id: string) => void;
  onCycleStatus: (id: string) => void;
  onEdit: (id: string) => void;
}

export function BookCard({
  book,
  index,
  onToggleLike,
  onDelete,
  onCycleStatus,
  onEdit,
}: BookCardProps) {
  const meta = [
    book.year ? String(book.year) : null,
    book.pages ? `${book.pages}p` : null,
    book.genre || null,
  ].filter(Boolean) as string[];

  // Status pill cycles through the order — title doubles as a tooltip cue.
  const nextStatus = (() => {
    const i = READING_STATUS_ORDER.indexOf(book.status);
    return READING_STATUS_ORDER[(i + 1) % READING_STATUS_ORDER.length];
  })();

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
        <span className="book-card__index">№ {String(index + 1).padStart(2, "0")}</span>
        <h3 className="book-card__title" title={book.title}>
          {book.title}
        </h3>
        <p className="book-card__author">{book.author || "Unknown author"}</p>

        {meta.length ? (
          <div className="book-card__meta">
            {meta.flatMap((part, i) =>
              i === 0
                ? [<span key={i}>{part}</span>]
                : [
                    <span key={`s-${i}`} className="book-card__meta-sep">·</span>,
                    <span key={i}>{part}</span>,
                  ],
            )}
          </div>
        ) : null}

        <div className="book-card__actions">
          <button
            type="button"
            className="status-pill"
            onClick={() => onCycleStatus(book.id)}
            title={`Mark as ${READING_STATUS_LABEL[nextStatus]}`}
          >
            {READING_STATUS_LABEL[book.status]} ↻
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
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
