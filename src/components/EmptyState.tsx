interface EmptyStateProps {
  onAddClick: () => void;
  onLoadSample: () => void;
}

export function EmptyState({ onAddClick, onLoadSample }: EmptyStateProps) {
  return (
    <div className="onboarding">
      <div className="onboarding__icon" aria-hidden="true">
        📚
      </div>
      <h2 className="onboarding__title">Your shelf is empty</h2>
      <p className="onboarding__copy">
        Add books to track what you’re reading, what’s next, and what stuck with you.
        Everything stays on your device — Pagebound never leaves your browser.
      </p>
      <div className="onboarding__actions">
        <button className="button button--primary" type="button" onClick={onAddClick}>
          Add your first book
        </button>
        <button className="button button--ghost" type="button" onClick={onLoadSample}>
          Load sample shelf
        </button>
      </div>
    </div>
  );
}
