# Presenting tum-web-lab

A walkthrough script for defending Labs 5, 6, and 7 to your teacher. Aim for **15–20 minutes total** — 5 min per lab plus a short intro and Q&A buffer.

> **Servers are running locally:**
> - Lab 7 API: <http://localhost:4000> (docs: <http://localhost:4000/docs>)
> - Lab 6 front-end: <http://127.0.0.1:5173/pagebound/>
> - Mono-repo on GitHub: <https://github.com/blinduandi/tum-web-lab>

---

## 0. Open with the big picture (1 minute)

> "All three labs live in one repo: `tum-web-lab`. Each lab is a self-contained subfolder with its own README. The history of every individual lab is preserved — `git log` shows 35+ commits across the three projects."

Show:

```sh
# from the repo root
ls
git log --oneline | head -20
```

Then say which order you'll go in: **Lab 5 → Lab 6 → Lab 7 → integration demo**.

---

## 1. Lab 5 — `go2web` (5 minutes)

### The constraint (30 seconds)

> "The brief forbids HTTP libraries. Everything is built on Node's `net` for TCP and `tls` for HTTPS. I write the request as a string, send it on the socket, and parse the bytes that come back."

Open [lab-5/src/transport.js](lab-5/src/transport.js) and point at:

- `net.connect` / `tls.connect` — the raw socket
- `buildRequest()` — the literal `GET … HTTP/1.1\r\nHost: …\r\n\r\n` string
- `parseResponse()` — splitting on `\r\n\r\n`, parsing the status line, lowercasing headers
- `decodeChunked()` — manual chunked transfer-encoding decoder
- The gzip / deflate decode at the bottom of `parseResponse`

### Live demo (3 minutes)

Run from `lab-5/`. Every command in [`DEMO.md`](lab-5/DEMO.md) is verified.

```sh
cd lab-5

# 1. Help
node src/index.js -h

# 2. Plain HTTPS GET — HTML rendered as text
node src/index.js -u https://example.com

# 3. Run it again — the (cache) tag appears
node src/index.js -u https://example.com

# 4. Redirect: http://github.com → https://github.com
node src/index.js -u http://github.com

# 5. Content negotiation — JSON pretty-printed
node src/index.js -u https://api.github.com/repos/nodejs/node --json

# 6. Search — top 10 results from DuckDuckGo
node src/index.js -s lord of the rings

# 7. Follow result #1 without retyping the URL
node src/index.js -s lord of the rings --open 1
```

Call out which **bonus** each command covers as you run it: redirect (+1), cache (+2), content negotiation (+2), accessible search results via CLI (+1).

### Prove there's no HTTP lib

```sh
grep -RnE "require\\('https?'\\)|from 'https?'" src/    # empty
grep -Rn "'node:net'\\|'node:tls'" src/                  # the only network primitives
```

### Likely questions

| Question | Short answer |
|---|---|
| *Why `Connection: close`?* | The server closes after sending; I read until socket `end` and have the full body. Avoids parsing `Content-Length` to know when to stop. |
| *Why DuckDuckGo, not Google?* | Google's HTML page is JS-rendered and anti-bot. DDG's `html.duckduckgo.com/html/` is server-rendered — parseable with one regex. |
| *Cache key?* | `sha1(method + url + accept)`. `Accept` is in the key because the same URL can return HTML or JSON — they shouldn't share a slot. |
| *What if the server gzips?* | I always send `Accept-Encoding: gzip, deflate`. After parsing headers, body goes through `zlib.gunzipSync`. |
| *Limits?* | HTTP/1.1 only, no keep-alive (one socket per request), no `ETag` revalidation (I refetch on expiry). All deliberate scope cuts for a CLI. |

---

## 2. Lab 6 — Pagebound (5 minutes)

### The pitch (30 seconds)

> "Client-side book library. React 18 + TypeScript + Vite. Add / edit / remove / like / filter books, light + dark theme, fully responsive, persists to IndexedDB so the shelf survives reloads."

### Live demo (3 minutes)

Open <http://127.0.0.1:5173/pagebound/> in the browser.

1. **Empty state** — first paint shows the "Your shelf is empty" card with two CTAs.
2. **Load sample shelf** — click it. Six seeded books appear with covers from Open Library.
3. **Add a book** — click "+ Add book" in the header → modal opens → fill title/author/genre → submit. The modal closes, the card lands on the grid, and the book is in IndexedDB.
4. **Like + status cycle** — heart on a card toggles like; click the status pill to cycle `Reading → To-read → Finished`.
5. **Filter bar** — type in search, flip the segmented status filter, toggle "Liked only", change the sort. Counts update live.
6. **Stats panel** — totals, reading/finished/liked, total pages read.
7. **Theme toggle** — click ☀ / ☾ in the header. Hard-refresh the page to show the boot script applies the saved theme **before React mounts** (no flash). Open DevTools and show `<html data-theme="dark">`.
8. **Persistence** — DevTools → Application → IndexedDB → `pagebound` → `books`. Show the rows. Reload the page — books are still there.

### Architecture highlights (1 minute)

Open [lab-6/src/data/LibraryContext.tsx](lab-6/src/data/LibraryContext.tsx) — show how every CRUD action mirrors to IndexedDB through [lab-6/src/data/db.ts](lab-6/src/data/db.ts). Components don't touch the DB directly.

Tokens-on-`<html>` theme system: open [lab-6/src/styles/tokens.css](lab-6/src/styles/tokens.css) — two palettes selected by `[data-theme]`. Component CSS only references semantic vars (`--surface`, `--text`, …) so a theme swap is a single attribute flip.

### Likely questions

| Question | Short answer |
|---|---|
| *Why React?* | Lab spec lists "front-end frameworks/libraries" — React is from the State of JS list, well-known, fits a CRUD UI. |
| *Why IndexedDB and not localStorage?* | IndexedDB is a real database with indexes and arbitrary value types. localStorage is string-only and synchronous. The lab spec lists both but IndexedDB scales better. |
| *Why no UI library (Material, Chakra, etc.)?* | Custom CSS shows I can write the styles, makes the bundle smaller (~52 KB gzip), and keeps the design tokens explicit. |
| *Theme flash?* | An inline `<script>` in [index.html](lab-6/index.html) reads `localStorage["pagebound:theme"]` and sets `data-theme` before React loads. The CSS already has the right palette by the time the first paint happens. |

---

## 3. Lab 7 — `pagebound-api` (5 minutes)

### The pitch (30 seconds)

> "REST back-end for Pagebound. Express + JWT auth. Three roles map to permissions — READ, WRITE, DELETE. Tokens expire after 1 minute. Pagination via skip/limit. Documented with Swagger UI."

### Live demo (3 minutes)

#### 3a. Swagger UI

Open <http://localhost:4000/docs>. Walk through:
- Endpoints grouped by tag (`Auth`, `Books`)
- The `Authorize` button at the top — paste a token here to call protected endpoints from the page
- Each endpoint lists the response codes it can return (200/201/204/400/401/403/404)

#### 3b. Mint a token

In Swagger UI: expand `POST /token` → "Try it out" → body `{ "role": "ADMIN" }` → Execute. Copy the `token` value. Click "Authorize" at the top, paste `Bearer <token>`. Now every endpoint on the page is callable.

Or via curl (faster for the demo):

```sh
# Get an ADMIN token
curl -s -X POST http://localhost:4000/token \
  -H 'Content-Type: application/json' \
  -d '{"role":"ADMIN"}'
```

The response shows: `token`, `expiresIn: 60`, `role: ADMIN`, `permissions: [READ, WRITE, DELETE]`.

#### 3c. Show role gating

```sh
# READER token — read-only
READER=$(curl -s -X POST http://localhost:4000/token \
  -H 'Content-Type: application/json' -d '{"role":"READER"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

# 200 — list works
curl -s -H "Authorization: Bearer $READER" "http://localhost:4000/books?skip=0&limit=2" | head -c 300

# 403 — write rejected because READER has no WRITE permission
curl -s -i -X POST http://localhost:4000/books \
  -H "Authorization: Bearer $READER" \
  -H 'Content-Type: application/json' \
  -d '{"title":"forbidden"}' | head -10
```

#### 3d. Show pagination

```sh
ADMIN=$(curl -s -X POST http://localhost:4000/token \
  -H 'Content-Type: application/json' -d '{"role":"ADMIN"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

curl -s -H "Authorization: Bearer $ADMIN" "http://localhost:4000/books?skip=2&limit=2"
# Note the response: { items: [...], total: 6, skip: 2, limit: 2 }
```

#### 3e. Show token expiry (the 1-minute trick)

Mint a token, wait ~65 seconds, then call `/books`:

```sh
curl -s -i -H "Authorization: Bearer $ADMIN" http://localhost:4000/books | head -10
# After ~60s: HTTP 401 with body { "error": "token_expired", "expiredAt": "..." }
```

If you don't want to wait live, just describe it: "after `expiresIn` seconds, the next call comes back 401 `token_expired`. The middleware in [lab-7/src/auth/middleware.js](lab-7/src/auth/middleware.js) catches `TokenExpiredError` and turns it into 401."

### Architecture highlights (1 minute)

Open [lab-7/src/auth/roles.js](lab-7/src/auth/roles.js):
> "Permissions are the unit the middleware checks. Roles are shorthand for a permission set. The token can carry either or both — `effectivePermissions()` unions them."

Open [lab-7/src/auth/middleware.js](lab-7/src/auth/middleware.js):
> "Two middlewares: `requireAuth` checks that the JWT verifies (returns 401 on fail). `requirePermission(WRITE)` checks the effective permission set (returns 403 on fail). 401 vs 403 is deliberate — 401 means *you didn't authenticate*, 403 means *you authenticated but you can't do this*."

### Likely questions

| Question | Short answer |
|---|---|
| *Why JWT and not sessions?* | Stateless. The server holds no session table — it just verifies the signature on every request. Easier to scale, perfect fit for a small lab API. |
| *Where's the user database?* | There isn't one — the brief says "tokens include roles" and the `/token` endpoint hands out tokens for whatever role the caller asks for. In production this is preceded by an auth flow that verifies credentials. |
| *Why `1 minute` expiry?* | Lab spec asks for short demo expiry. It also makes the token-expired flow easy to demonstrate live. |
| *What if the JWT secret leaks?* | Anyone can forge tokens. In production it lives in a secrets manager (Vault, AWS Secrets Manager, env var injected by the deployer). For the lab it's `JWT_SECRET` in `.env`. |
| *Pagination sanity?* | `skip` defaults to 0, `limit` defaults to 20, capped at 100. Response includes `total` so the client knows when to stop walking pages. |

---

## 4. The integration story (3 minutes)

This is where 5+6+7 actually pay off — show the system works as one.

1. With the API running on :4000 and the front-end on :5173, open <http://127.0.0.1:5173/pagebound/> in the browser.
2. Click the **Local / API** toggle in the header. The Sign-In dialog appears.
3. Pick role `ADMIN`, click **Sign in**. The dialog hits `POST /token`, stores the JWT in localStorage, and reloads the library from `GET /books`.
4. The grid now shows the **API's** seeded books (different from your local ones).
5. Add a book in the UI → Network tab shows `POST /books` with `Authorization: Bearer …`. The new book lands on the grid.
6. Stop the API server. Try editing a book — the UI surfaces the network failure as an error.
7. Restart the API. After 60 seconds the token expires; the next action returns 401 and the sign-in dialog reopens automatically.

Optional: open <http://localhost:4000/docs> side-by-side with the front-end so the teacher sees Swagger UI is calling the same endpoints the front-end is.

---

## 5. Wrap-up (30 seconds)

Show the mono-repo:

```sh
git log --oneline --graph | head -20
```

Pull up <https://github.com/blinduandi/tum-web-lab> on github.com so they can see it's actually pushed.

> "Three labs in one repo. Lab 5 is the CLI built on raw sockets. Lab 6 is the front-end with persistent storage and theming. Lab 7 is the back-end with JWT auth and Swagger. Lab 6 talks to Lab 7 over HTTP for the bonus integration. Each subfolder builds and runs independently with `npm install && npm start`."

---

## Cheat sheet — copy-pasteable commands

```sh
# === Pre-flight (already done by Claude, kept here just in case) ===
cd lab-7 && npm install && npm start &
cd lab-6 && npm install && npm run dev -- --host 127.0.0.1 --port 5173 &

# === Lab 5 ===
cd lab-5
node src/index.js -h
node src/index.js -u https://example.com
node src/index.js -u https://example.com                   # cache hit
node src/index.js -u http://github.com                     # redirect
node src/index.js -u https://api.github.com/repos/nodejs/node --json
node src/index.js -s lord of the rings
node src/index.js -s lord of the rings --open 1

# === Lab 7 ===
curl -X POST http://localhost:4000/token -H 'Content-Type: application/json' -d '{"role":"ADMIN"}'
TOKEN=...                                                  # copy from above
curl -H "Authorization: Bearer $TOKEN" "http://localhost:4000/books?skip=0&limit=2"
curl -X POST http://localhost:4000/books \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"The Hobbit","author":"J.R.R. Tolkien","status":"reading"}'

# === Lab 6 — open in browser ===
# http://127.0.0.1:5173/pagebound/

# === Swagger UI — open in browser ===
# http://localhost:4000/docs

# === Stop servers when done ===
# (Windows PowerShell)
# Stop-Process -Name node -Force
```

---

## If something breaks live

- **API won't start:** `pkill -f "node.*src/server.js"` then `cd lab-7 && npm start`
- **Front-end can't reach API:** check both are on the right ports (4000 + 5173). Restart with `pkill -f vite` then `npm run dev`.
- **CORS error in browser:** the API allows `http://localhost:5173,http://127.0.0.1:5173` by default. If the front-end is on a different host/port, set `CORS_ORIGIN=…` in `lab-7/.env` and restart the API.
- **Token expired mid-demo:** that's the point — open the sign-in dialog and re-authenticate, then say "this is exactly the flow I wanted to show."
