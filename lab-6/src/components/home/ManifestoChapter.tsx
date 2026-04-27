// Manifesto chapter — short statements at architectural scale. The
// copy is deliberately terse: at 96px+ display type, anything longer
// than ~3 words wraps to multiple lines and breaks the rhythm.

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
          <span>Local first.</span>
        </p>
      </div>

      <div className="chapter__corner chapter__corner--br">
        <span className="caption-mono caption-mono--mid">
          No accounts · no tracking · no clouds you didn't ask for
        </span>
      </div>
    </section>
  );
}
