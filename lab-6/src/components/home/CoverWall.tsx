// Cover wall — a horizontal strip that reads like the credit roll on a
// film. Each cover is sized to be more sculpture than thumbnail. The row
// is wider than the viewport on purpose; the user pans by scrolling.

import type { Book } from "../../data/types";

interface CoverWallProps {
  books: Book[];
}

export function CoverWall({ books }: CoverWallProps) {
  // Show at most 14 covers to keep the row from looking unbounded.
  const covers = books.slice(0, 14);
  return (
    <section className="chapter chapter--wall" aria-label="A reading wall">
      <div className="chapter__corner chapter__corner--tl">
        <span className="caption-mono">№ 03</span>
        <span className="caption-mono caption-mono--mid">A wall of volumes</span>
      </div>
      <div className="chapter__corner chapter__corner--tr">
        <span className="caption-mono caption-mono--mid">
          {covers.length === books.length
            ? `${covers.length} on display`
            : `${covers.length} of ${books.length}`}
        </span>
      </div>

      <div className="cover-wall" role="list">
        {covers.map((book, i) => (
          <figure className="cover-wall__item" role="listitem" key={book.id}>
            <div className="cover-wall__plate">
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
              <span className="cover-wall__fallback" aria-hidden="true">
                {book.title.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <figcaption className="cover-wall__caption">
              <span className="caption-mono caption-mono--mid">
                № {String(i + 1).padStart(2, "0")}
              </span>
              <span className="cover-wall__title">{book.title}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
