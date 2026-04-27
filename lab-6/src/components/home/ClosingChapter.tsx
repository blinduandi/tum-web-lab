// Closing chapter — a single, oversized "BEGIN" call-to-action. Acts as
// the natural end of the homepage and the bridge into the library.

interface ClosingChapterProps {
  onEnter: () => void;
}

export function ClosingChapter({ onEnter }: ClosingChapterProps) {
  return (
    <section className="chapter chapter--closing" aria-label="Begin">
      <div className="chapter__corner chapter__corner--tl">
        <span className="caption-mono">№ 05</span>
        <span className="caption-mono caption-mono--mid">Begin</span>
      </div>

      <div className="closing">
        <h2 className="closing__title">A library of one.</h2>
        <p className="closing__copy">
          Add a book. Track what you finish. Decide what comes next. Everything
          else is a distraction.
        </p>
        <button
          type="button"
          className="button button--primary button--large"
          onClick={onEnter}
        >
          Open Pagebound
        </button>
      </div>

      <div className="chapter__corner chapter__corner--bc">
        <span className="caption-mono caption-mono--mid">
          Press the toggle in the nav at any time to return.
        </span>
      </div>
    </section>
  );
}
