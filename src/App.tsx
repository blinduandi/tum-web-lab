import { ThemeToggle } from "./components/ThemeToggle";

export default function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Pagebound</h1>
        <ThemeToggle />
      </header>
      <p>A personal library — coming together one commit at a time.</p>
    </main>
  );
}
