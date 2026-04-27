import {
  READING_STATUS_LABEL,
  READING_STATUS_ORDER,
} from "../data/types";
import type { LibraryFilters, SortKey, StatusFilter } from "../data/filter";

interface FilterBarProps {
  filters: LibraryFilters;
  onChange: (next: LibraryFilters) => void;
  totalCount: number;
  visibleCount: number;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "title", label: "Title A–Z" },
  { value: "author", label: "Author A–Z" },
  { value: "year", label: "Year (newest)" },
];

export function FilterBar({ filters, onChange, totalCount, visibleCount }: FilterBarProps) {
  function patch<K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <section className="filter-bar" aria-label="Library filters">
      <div className="filter-bar__row">
        <input
          type="search"
          className="filter-bar__search"
          placeholder="Search title, author, genre, notes…"
          value={filters.query}
          onChange={(e) => patch("query", e.target.value)}
          aria-label="Search books"
        />

        <div role="group" aria-label="Filter by status" className="segmented">
          <SegmentedButton
            active={filters.status === "all"}
            onClick={() => patch("status", "all")}
          >
            All
          </SegmentedButton>
          {READING_STATUS_ORDER.map((s) => (
            <SegmentedButton
              key={s}
              active={filters.status === s}
              onClick={() => patch("status", s as StatusFilter)}
            >
              {READING_STATUS_LABEL[s]}
            </SegmentedButton>
          ))}
        </div>
      </div>

      <div className="filter-bar__row filter-bar__row--meta">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.likedOnly}
            onChange={(e) => patch("likedOnly", e.target.checked)}
          />
          <span>Liked only</span>
        </label>

        <label className="filter-bar__sort">
          <span>Sort by</span>
          <select
            value={filters.sort}
            onChange={(e) => patch("sort", e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <p className="filter-bar__count" aria-live="polite">
          {visibleCount === totalCount
            ? `${totalCount} volume${totalCount === 1 ? "" : "s"}`
            : `${visibleCount} of ${totalCount}`}
        </p>
      </div>
    </section>
  );
}

interface SegmentedButtonProps extends React.PropsWithChildren {
  active: boolean;
  onClick: () => void;
}

function SegmentedButton({ active, onClick, children }: SegmentedButtonProps) {
  return (
    <button
      type="button"
      className={`segmented__btn ${active ? "is-active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
