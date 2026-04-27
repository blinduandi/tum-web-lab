// Hero chapter — full viewport, single monumental wordmark. The only
// decoration is a thin chapter number in the top-left and a CTA in the
// bottom-center.

interface HeroChapterProps {
  onEnter: () => void;
}

export function HeroChapter({ onEnter }: HeroChapterProps) {
  return (
    <section className="chapter chapter--hero" aria-label="Pagebound">
      <div className="chapter__corner chapter__corner--tl">
        <span className="caption-mono">№ 01</span>
        <span className="caption-mono caption-mono--mid">A reading log</span>
      </div>
      <div className="chapter__corner chapter__corner--tr">
        <span className="caption-mono">EST. 2026</span>
      </div>

      <div className="hero">
        <p className="hero__overline caption-mono">FAF · Web Programming · Lab 06</p>
        <h1 className="hero__wordmark">Pagebound</h1>
        <p className="hero__sub">
          Track every book — those you’ve read, those you’re reading,
          those you mean to read.
        </p>
      </div>

      <div className="chapter__corner chapter__corner--bc">
        <button
          type="button"
          className="button button--primary button--large"
          onClick={onEnter}
        >
          Enter The Library
        </button>
        <span className="caption-mono caption-mono--mid">Scroll for more ↓</span>
      </div>
    </section>
  );
}
