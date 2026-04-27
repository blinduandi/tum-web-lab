// Cinematic homepage. Six "chapters" that scroll vertically — each one
// owning the viewport for a moment before the next slides in. The page is
// 90% empty by design (DESIGN.md §5: "the page breathes the way a museum
// breathes, with each exhibit getting its own silent room").

import { useMemo } from "react";

import { useLibrary } from "../data/LibraryContext";
import { makeSeedBooks } from "../data/seed";
import type { Book } from "../data/types";

import { HeroChapter } from "../components/home/HeroChapter";
import { ManifestoChapter } from "../components/home/ManifestoChapter";
import { CoverWall } from "../components/home/CoverWall";
import { FeaturedVolume } from "../components/home/FeaturedVolume";
import { ClosingChapter } from "../components/home/ClosingChapter";

interface HomeProps {
  onEnter: () => void;
}

export function Home({ onEnter }: HomeProps) {
  const { books } = useLibrary();

  // Cover wall pulls from your library if present; otherwise seeds with the
  // sample shelf so the page never feels empty.
  const wallBooks = useMemo<Book[]>(
    () => (books.length > 0 ? books : makeSeedBooks()),
    [books],
  );

  // The featured volume is whichever book the user is currently reading. If
  // none, fall back to the most recently updated; if still none, undefined.
  const featured = useMemo<Book | undefined>(() => {
    const reading = books.find((b) => b.status === "reading");
    if (reading) return reading;
    if (books.length > 0)
      return [...books].sort((a, b) => b.updatedAt - a.updatedAt)[0];
    return wallBooks[0];
  }, [books, wallBooks]);

  return (
    <>
      <HeroChapter onEnter={onEnter} />
      <ManifestoChapter />
      <CoverWall books={wallBooks} />
      {featured ? <FeaturedVolume book={featured} onEnter={onEnter} /> : null}
      <ClosingChapter onEnter={onEnter} />
    </>
  );
}
