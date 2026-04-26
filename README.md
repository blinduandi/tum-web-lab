# Pagebound

A personal book library that lives entirely in your browser. Add the books you’re reading, want to read, or have finished — Pagebound never sends them anywhere. Built for **FAF Web Programming, Lab 6**.

## Live demo

The `main` branch deploys automatically to GitHub Pages. After enabling Pages in repo settings, the app is reachable at:

`https://<your-github-username>.github.io/pagebound/`

## Stack

- **React 18** with TypeScript
- **Vite** for dev server + production bundle
- **IndexedDB** for persistence — no backend, no third-party storage
- Hand-rolled CSS with light/dark design tokens — no UI framework

## Features

- **Add / edit / remove books** with a modal form (title, author, genre, year, pages, cover URL, status, notes)
- **Like** any book with a single click
- **Status tracking** (`To read`, `Reading`, `Finished`) — click the pill on a card to cycle, or pick from the form
- **Filter** by status, by liked-only, and by free-text search across title/author/genre/notes
- **Sort** by recently updated, title, author, or year
- **Stats panel** — totals, reading/finished/liked counts, total pages read
- **Light / dark theme** with a persisted preference; the very first paint already matches the saved theme (no flash)
- **Empty-state CTA** that can seed a sample shelf so the UI is never blank
- Fully **responsive** — works on phones, tablets, desktops
- Keyboard friendly — `Esc` closes modals, focus rings on every input

## Persistence model

All state lives in two places:

1. **IndexedDB** (`pagebound` database, `books` store) — every CRUD action mirrors to disk, so your shelf survives reloads, browser restarts, and laptop reboots.
2. **`localStorage["pagebound:theme"]`** — just the chosen theme, so the boot script in `index.html` can apply it before React mounts.

Open DevTools → Application → IndexedDB → `pagebound` to see the raw data.

## User flows

### First run

1. Empty state shows two buttons: **Add your first book** and **Load sample shelf**.
2. Loading the sample shelf populates 6 books (Tolkien, Andy Weir, etc.) so all the UI surfaces have something to display.

### Tracking a book

1. Click **+ Add book** in the header.
2. Fill in title (required) and any other fields you have. Cover URL accepts any image link — Open Library is a great source.
3. Submit. The book lands on the shelf immediately and is persisted to IndexedDB before the modal closes.

### Curating

- Click the heart on a card to toggle the like.
- Click the status pill to cycle Reading → To-read → Finished.
- Click **Edit** for the full form, or **Delete** to remove (with confirmation).
- Use the filter bar to narrow by status / search / liked-only and to change the sort order.

### Switching themes

The toggle in the top-right flips between light and dark. Your choice is remembered next time. The system preference is the initial default.

## Project layout

```
src/
  App.tsx                  top-level layout and routing-free state
  main.tsx                 React entry point, providers
  components/              presentational + interactive React components
    BookCard.tsx
    BookGrid.tsx
    BookForm.tsx
    Modal.tsx
    FilterBar.tsx
    StatsPanel.tsx
    EmptyState.tsx
    ThemeToggle.tsx
  data/
    types.ts               domain types (Book, ReadingStatus)
    db.ts                  IndexedDB wrapper (Promise-based)
    LibraryContext.tsx     state + CRUD actions, mirrors to db.ts
    filter.ts              pure filter/sort logic
    seed.ts                sample shelf
  theme/
    ThemeProvider.tsx      light/dark toggle + persistence
  styles/
    tokens.css             design tokens (light + dark palettes)
    global.css             layout primitives
    cards.css              book card + grid
    forms.css              modal + form inputs
    filters.css            filter bar
```

## Running locally

```sh
npm install
npm run dev          # http://localhost:5173/pagebound/
npm run build        # production bundle in dist/
npm run preview      # serve dist/ locally to verify the production build
```

## Deploying

A push to `main` triggers `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages. Enable Pages in repo settings (Source: GitHub Actions) on the first deploy.

If you prefer the manual route:

```sh
npm run deploy       # uses gh-pages to push dist/ to gh-pages branch
```

To deploy at the domain root instead of `/pagebound/`, run the build with `VITE_BASE=/`.
