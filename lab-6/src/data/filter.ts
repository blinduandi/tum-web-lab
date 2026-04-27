// Pure filtering & sorting helpers for the library view. Kept free of
// React so they're easy to reason about and test in isolation.

import type { Book, ReadingStatus } from "./types";

export type StatusFilter = ReadingStatus | "all";
export type SortKey = "recent" | "title" | "author" | "year";

export interface LibraryFilters {
  query: string;
  status: StatusFilter;
  likedOnly: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: LibraryFilters = {
  query: "",
  status: "all",
  likedOnly: false,
  sort: "recent",
};

export function applyFilters(books: Book[], filters: LibraryFilters): Book[] {
  const q = filters.query.trim().toLowerCase();
  const filtered = books.filter((b) => {
    if (filters.status !== "all" && b.status !== filters.status) return false;
    if (filters.likedOnly && !b.liked) return false;
    if (q) {
      const haystack = `${b.title} ${b.author} ${b.genre} ${b.notes}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "title":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "author":
      sorted.sort((a, b) => a.author.localeCompare(b.author) || a.title.localeCompare(b.title));
      break;
    case "year":
      sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
      break;
    case "recent":
      sorted.sort((a, b) => b.updatedAt - a.updatedAt);
      break;
  }
  return sorted;
}
