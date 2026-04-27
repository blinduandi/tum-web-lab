// Manifesto chapter — three short statements set at architectural scale.
// Each line is a chapter of its own; the type IS the layout.

export function ManifestoChapter() {
  return (
    <section className="chapter chapter--manifesto" aria-label="Manifesto">
      <div className="chapter__corner chapter__corner--tl">
        <span className="caption-mono">№ 02</span>
        <span className="caption-mono caption-mono--mid">Manifesto</span>
      </div>

      <div className="manifesto">
        <p className="manifesto__line">
          <span className="manifesto__index">01</span>
          <span>One reader.</span>
        </p>
        <p className="manifesto__line">
          <span className="manifesto__index">02</span>
          <span>One shelf.</span>
        </p>
        <p className="manifesto__line">
          <span className="manifesto__index">03</span>
          <span>No accounts. No tracking. No clouds — unless you choose one.</span>
        </p>
      </div>

      <div className="chapter__corner chapter__corner--bl">
        <span className="caption-mono caption-mono--mid">
          Stored locally in your browser
        </span>
      </div>
    </section>
  );
}
