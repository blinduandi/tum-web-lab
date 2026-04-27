# go2web — Demo Commands

Working command list to demo Lab 5. Every command in this file has been verified end-to-end on Windows + Node 22. Run them top-to-bottom for a clean walkthrough; each section maps to one grading bullet.

> The lab spec requires the executable to launch as **`go2web`**. Set that up once with `npm link` (below) and the rest of the demo is one word per line.

---

## 0. Setup (one-time)

```sh
# from this directory:
#   c:/Users/andib/OneDrive/Desktop/FAF/Programare Web/tum-web-lab/lab-5
npm install      # only if node_modules is missing
npm link         # exposes the global `go2web` binary on your PATH
```

Verify:

```sh
which go2web     # should print the install path
go2web -h        # prints the help banner
```

Optional — clear the on-disk cache so demos start fresh:

```sh
rm -rf .cache
```

If `npm link` is unavailable for some reason, every command below also works as `node src/index.js …`.

---

## 1. Help screen

```sh
go2web -h
```

**Expected:** prints the usage banner with `-u`, `-s`, `-h`, and the `--open / --json / --no-cache` modifiers.

---

## 2. Fetch a URL (HTTPS over raw TLS)

```sh
go2web -u https://www.iana.org
```

**Expected:** `HTTP 200 OK`, then the page text with HTML tags stripped — `<a>` links surface as `text (url)`.

> If your network DNS-blocks `example.com` (some ISPs and family-filter resolvers do), use `iana.org`, `httpbin.org`, or `github.com` instead — they're reliably reachable.

---

## 3. HTTP cache hit

Run the same URL twice. The second response carries a `(cache)` tag — no new socket was opened.

```sh
go2web -u https://www.iana.org
go2web -u https://www.iana.org
```

**Expected on second run:** `HTTP 200 OK (cache)` in the header line.

Bypass the cache for a single run:

```sh
go2web -u https://www.iana.org --no-cache
```

---

## 4. Redirect following (`http → https`)

```sh
go2web -u http://github.com
```

**Expected:** the final `URL:` line shows `https://github.com/` — the client followed the 301 transparently.

Other redirect-friendly targets:

```sh
go2web -u https://httpbin.org/redirect/3
```

---

## 5. Content negotiation — JSON

```sh
go2web -u https://api.github.com/repos/nodejs/node --json
```

**Expected:** `Content-Type: application/json…` and a pretty-printed JSON body. Without `--json`, the same URL still works because the server returns JSON anyway, but `--json` proves we control the `Accept` header.

Other JSON targets:

```sh
go2web -u https://api.github.com/users/nodejs --json
go2web -u https://httpbin.org/get --json
```

---

## 6. Search — top 10 results

```sh
go2web -s lord of the rings
```

Multi-word search works without quotes — argv tokens after `-s` are collected greedily. Quoting is also fine:

```sh
go2web -s "node.js raw socket http"
```

**Expected:** a numbered list, 10 entries, each with title and URL. Followed by a tip line about `--open <N>`.

---

## 7. Follow a search result with `--open`

```sh
# Pick the Nth result from the previous search and fetch it.
go2web -s lord of the rings --open 1
go2web -s lord of the rings --open 3
```

**Expected:** `Opening #N: <title>` then the rendered page body. The previous search results are cached on disk, so `--open` doesn't re-search if the query matches.

---

## 8. Putting it together (one-liner demo)

If you want a single block to paste at the start of the demo:

```sh
rm -rf .cache && \
go2web -h && \
echo && go2web -u https://www.iana.org && \
echo && go2web -u https://www.iana.org && \
echo && go2web -u http://github.com 2>&1 | head -10 && \
echo && go2web -u https://api.github.com/repos/nodejs/node --json 2>&1 | head -15 && \
echo && go2web -s lord of the rings && \
echo && go2web -s lord of the rings --open 1 2>&1 | head -10
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

**Expected (10 commits in lab-5's own history):**

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

In the mono-repo (`blinduandi/tum-web-lab`), the same commits are preserved under the `lab-5/` subtree merge — `git log -- lab-5` shows them.

---

## Cheat-sheet (paste into a terminal as you go)

| # | What you're showing | Command |
|---|---|---|
| 1 | Help | `go2web -h` |
| 2 | HTTPS GET, HTML stripped | `go2web -u https://www.iana.org` |
| 3 | Cache hit | (run #2 a second time) |
| 4 | Redirect | `go2web -u http://github.com` |
| 5 | JSON via Accept | `go2web -u https://api.github.com/repos/nodejs/node --json` |
| 6 | Search top 10 | `go2web -s lord of the rings` |
| 7 | Follow Nth result | `go2web -s lord of the rings --open 1` |
| 8 | No-HTTP-lib proof | `grep -RnE "require\\('https?'\\)\|from 'https?'" src/` |
| 9 | Git history | `git log --oneline` |
