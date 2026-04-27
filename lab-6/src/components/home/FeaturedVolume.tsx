// Featured volume — the closest thing to Bugatti's hero-vehicle moment.
// One book gets a full-bleed cover treatment with monumental display type
// in the negative space beside it. If the user is currently reading a
// book, that's the feature; otherwise we show their most recent.

import type { Book } from "../../data/types";

interface FeaturedVolumeProps {
  book: Book;
  onEnter: () => void;
}

export function FeaturedVolume({ book, onEnter }: FeaturedVolumeProps) {
  const isReading = book.status === "reading";

  return (
    <section className="chapter chapter--featured" aria-label="Featured volume">
      <div className="chapter__corner chapter__corner--tl">
        <span className="caption-mono">№ 04</span>
        <span className="caption-mono caption-mono--mid">
          {isReading ? "Currently reading" : "From the catalog"}
        </span>
      </div>

      <div className="featured">
        <div className="featured__plate">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
          <span className="featured__fallback" aria-hidden="true">
            {book.title.slice(0, 1).toUpperCase()}
          </span>
        </div>

        <div className="featured__copy">
          <p className="caption-mono caption-mono--mid">
            {book.author || "Unknown author"}
            {book.year ? ` · ${book.year}` : ""}
            {book.pages ? ` · ${book.pages}p` : ""}
          </p>
          <h2 className="featured__title">{book.title}</h2>
          {book.notes ? <p className="featured__notes">{book.notes}</p> : null}
          <div className="featured__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={onEnter}
            >
              Open The Shelf
            </button>
            {book.genre ? (
              <span className="caption-mono caption-mono--mid">· {book.genre}</span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
