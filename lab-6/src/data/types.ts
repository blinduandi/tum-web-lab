// Domain types. Everything stored in IndexedDB conforms to `Book`.

export type ReadingStatus = "to-read" | "reading" | "finished";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number | null;
  pages: number | null;
  status: ReadingStatus;
  rating: number; // 0..5, where 0 means "unrated"
  liked: boolean;
  notes: string;
  coverUrl: string;
  createdAt: number;
  updatedAt: number;
}

export type BookDraft = Omit<Book, "id" | "createdAt" | "updatedAt">;

export const READING_STATUS_LABEL: Record<ReadingStatus, string> = {
  "to-read": "To read",
  reading: "Reading",
  finished: "Finished",
};

export const READING_STATUS_ORDER: ReadingStatus[] = ["reading", "to-read", "finished"];
