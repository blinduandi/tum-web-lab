# go2web — Demo Commands

Working command list to demo Lab 5. Every command in this file has been verified end-to-end. Run them top-to-bottom for a clean walkthrough; each section maps to one grading bullet.

> All commands assume your shell is in this directory:
> `c:/Users/andib/OneDrive/Desktop/FAF/Programare Web/Lab 5/tum-web-lab5`
>
> Either run them with `node src/index.js …` (no install needed) or run `npm link` once and then use the `go2web` binary directly. Examples below use `node src/index.js`.

---

## 0. Setup (one-time, optional)

```sh
# Optional: expose the global `go2web` binary
npm link

# Optional: clear the on-disk cache so demos start fresh
rm -rf .cache
```

---

## 1. Help screen

```sh
node src/index.js -h
```

**Expected:** prints the usage banner with `-u`, `-s`, `-h`, and the `--open / --json / --no-cache` modifiers.

---

## 2. Fetch a URL (HTTPS over raw TLS)

```sh
node src/index.js -u https://example.com
```

**Expected:** `HTTP 200 OK`, then the page text with HTML tags stripped — `<a>` links surface as `text (url)`.

---

## 3. HTTP cache hit

Run the same URL twice. The second response carries a `(cache)` tag — no new socket was opened.

```sh
node src/index.js -u https://example.com
node src/index.js -u https://example.com
```

**Expected on second run:** `HTTP 200 OK (cache)` in the header line.

Bypass the cache for a single run:

```sh
node src/index.js -u https://example.com --no-cache
```

---

## 4. Redirect following (`http → https`)

```sh
node src/index.js -u http://github.com
```

**Expected:** the final `URL:` line shows `https://github.com/` — the client followed the 301 transparently.

Other redirect-friendly targets:

```sh
node src/index.js -u http://google.com
node src/index.js -u https://httpbin.org/redirect/3
```

---

## 5. Content negotiation — JSON

```sh
node src/index.js -u https://api.github.com/repos/nodejs/node --json
```

**Expected:** `Content-Type: application/json…` and a pretty-printed JSON body. Without `--json`, the same URL still works because the server returns JSON anyway, but `--json` proves we control the `Accept` header.

Other JSON targets:

```sh
node src/index.js -u https://api.github.com/users/nodejs --json
node src/index.js -u https://jsonplaceholder.typicode.com/todos/1 --json
```

---

## 6. Search — top 10 results

```sh
node src/index.js -s lord of the rings
```

Multi-word search works without quotes — argv tokens after `-s` are collected greedily. Quoting is also fine:

```sh
node src/index.js -s "node.js raw socket http"
```

**Expected:** a numbered list, 10 entries, each with title and URL. Followed by a tip line about `--open <N>`.

---

## 7. Follow a search result with `--open`

```sh
# Pick the Nth result from the previous search and fetch it.
node src/index.js -s lord of the rings --open 1
node src/index.js -s lord of the rings --open 3
```

**Expected:** `Opening #N: <title>` then the rendered page body. The previous search results are cached on disk, so `--open` doesn't re-search if the query matches.

---

## 8. Putting it together (one-liner demo)

If you want a single block to paste at the start of the demo:

```sh
rm -rf .cache && \
node src/index.js -h && \
echo && node src/index.js -u https://example.com && \
echo && node src/index.js -u https://example.com && \
echo && node src/index.js -u http://github.com 2>&1 | head -10 && \
echo && node src/index.js -u https://api.github.com/repos/nodejs/node --json 2>&1 | head -15 && \
echo && node src/index.js -s lord of the rings && \
echo && node src/index.js -s lord of the rings --open 1 2>&1 | head -10
```

---

## 9. Prove there's no HTTP library in use

These commands return **nothing** — there are no imports of `http`, `https`, `fetch`, `axios`, `got`, or `node-fetch` anywhere in the source.

```sh
grep -RnE "require\\('https?'\\)|from 'https?'" src/
grep -RnE "fetch|axios|got|node-fetch|undici" src/
```

The only network primitives used are Node's built-in `net` and `tls`:

```sh
grep -Rn "from 'node:net'\|from 'node:tls'" src/
```

---

## 10. Git history (rubric: "decent git history")

```sh
git log --oneline
```

**Expected (10 commits):**

```
Render <a> as text (url), keep list items on consecutive lines
Wire CLI commands -u/-s with content negotiation and cache
Add DuckDuckGo search adapter with redirect unwrapping
Add file-backed HTTP cache honoring Cache-Control and Expires
Add HTML-to-text renderer and JSON pretty-printer
Add high-level HTTP client with redirect following
Add raw TCP/TLS transport with chunked + gzip decoding
Add URL parser with scheme/port/path normalization
Add CLI entry point and argv parser with -u/-s/-h
Scaffold go2web project (package.json, README, gitignore)
```

---

## Cheat-sheet (paste into a terminal as you go)

| # | What you're showing | Command |
|---|---|---|
| 1 | Help | `node src/index.js -h` |
| 2 | HTTPS GET, HTML stripped | `node src/index.js -u https://example.com` |
| 3 | Cache hit | (run #2 a second time) |
| 4 | Redirect | `node src/index.js -u http://github.com` |
| 5 | JSON via Accept | `node src/index.js -u https://api.github.com/repos/nodejs/node --json` |
| 6 | Search top 10 | `node src/index.js -s lord of the rings` |
| 7 | Follow Nth result | `node src/index.js -s lord of the rings --open 1` |
| 8 | No-HTTP-lib proof | `grep -RnE "require\\('https?'\\)\|from 'https?'" src/` |
| 9 | Git history | `git log --oneline` |
