import type { Book } from "../data/types";

interface StatsPanelProps {
  books: Book[];
}

export function StatsPanel({ books }: StatsPanelProps) {
  const reading = books.filter((b) => b.status === "reading").length;
  const finished = books.filter((b) => b.status === "finished").length;
  const liked = books.filter((b) => b.liked).length;
  const pages = books
    .filter((b) => b.status === "finished")
    .reduce((sum, b) => sum + (b.pages ?? 0), 0);

  const stats = [
    { label: "Total", value: books.length },
    { label: "Reading", value: reading },
    { label: "Finished", value: finished },
    { label: "Liked", value: liked },
    { label: "Pages read", value: pages.toLocaleString() },
  ];

  return (
    <section className="stats" aria-label="Library statistics">
      {stats.map((s) => (
        <div className="stats__cell" key={s.label}>
          <span className="stats__value">{s.value}</span>
          <span className="stats__label">{s.label}</span>
        </div>
      ))}
    </section>
  );
}
