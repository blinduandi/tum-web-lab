interface EmptyStateProps {
  onAddClick: () => void;
  onLoadSample: () => void;
}

export function EmptyState({ onAddClick, onLoadSample }: EmptyStateProps) {
  return (
    <div className="onboarding">
      <div className="onboarding__icon" aria-hidden="true">
        ⌗
      </div>
      <h2 className="onboarding__title">The Shelf is Empty</h2>
      <p className="onboarding__copy">
        Track every book — reading, queued, retired. Nothing leaves the browser.
      </p>
      <div className="onboarding__actions">
        <button className="button button--primary" type="button" onClick={onAddClick}>
          Add Your First Book
        </button>
        <button className="button button--ghost" type="button" onClick={onLoadSample}>
          Load Sample Shelf
        </button>
      </div>
    </div>
  );
}
