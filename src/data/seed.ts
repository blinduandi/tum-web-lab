// Sample books shown when the user clicks "Load sample shelf" on the empty
// state. Cover URLs use Open Library — public, stable, and CORS-friendly.

import type { Book } from "./types";

interface SeedTemplate {
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
  status: Book["status"];
  liked: boolean;
  rating: number;
  coverUrl: string;
  notes: string;
}

const TEMPLATES: SeedTemplate[] = [
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    year: 1954,
    pages: 1216,
    status: "finished",
    liked: true,
    rating: 5,
    coverUrl: "https://covers.openlibrary.org/b/id/14627942-L.jpg",
    notes: "Comfort read. Always coming back to the Shire.",
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    year: 2021,
    pages: 496,
    status: "reading",
    liked: true,
    rating: 5,
    coverUrl: "https://covers.openlibrary.org/b/id/12001354-L.jpg",
    notes: "Rocky.",
  },
  {
    title: "The Pragmatic Programmer",
    author: "David Thomas, Andrew Hunt",
    genre: "Software",
    year: 1999,
    pages: 320,
    status: "finished",
    liked: false,
    rating: 4,
    coverUrl: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
    notes: "Re-read every couple of years.",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    year: 1965,
    pages: 688,
    status: "to-read",
    liked: false,
    rating: 0,
    coverUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    notes: "",
  },
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    genre: "Fantasy",
    year: 2007,
    pages: 662,
    status: "finished",
    liked: true,
    rating: 5,
    coverUrl: "https://covers.openlibrary.org/b/id/8228691-L.jpg",
    notes: "",
  },
  {
    title: "Educated",
    author: "Tara Westover",
    genre: "Memoir",
    year: 2018,
    pages: 334,
    status: "to-read",
    liked: false,
    rating: 0,
    coverUrl: "https://covers.openlibrary.org/b/id/8581796-L.jpg",
    notes: "",
  },
];

export function makeSeedBooks(): Book[] {
  const now = Date.now();
  return TEMPLATES.map((t, i) => ({
    ...t,
    id: `seed_${i}`,
    // Stagger updatedAt so the "recent" sort produces a stable, varied order.
    createdAt: now - (TEMPLATES.length - i) * 60_000,
    updatedAt: now - (TEMPLATES.length - i) * 60_000,
  }));
}
