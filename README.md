# tum-web-lab

Labs for **Web Programming**, FAF, TUM. Each lab lives in its own subfolder with its own README and runnable code. Commit history for every lab is preserved here via `git subtree`.

| Lab | Folder | Topic | Stack |
|-----|--------|-------|-------|
| 5 | [`lab-5/`](lab-5) | HTTP over raw TCP sockets — `go2web` CLI | Node.js (`net`/`tls`, no HTTP libs) |
| 6 | [`lab-6/`](lab-6) | Front-end book library — Pagebound | React 18, TypeScript, Vite, IndexedDB |
| 7 | [`lab-7/`](lab-7) | REST back-end with JWT auth — `pagebound-api` | Node.js, Express, JWT, Swagger UI |

> Lab 1 lives in its own repository: <https://github.com/blinduandi/tum-web-lab1>

## Working on a single lab

Each lab folder is self-contained. To work on Lab 7, for example:

```sh
cd lab-7
npm install
npm start
```

## Running the full stack (Lab 6 ↔ Lab 7)

```sh
# terminal 1 — REST API
cd lab-7
npm install
npm start                    # http://localhost:4000  (docs at /docs)

# terminal 2 — front-end
cd lab-6
npm install
npm run dev                  # http://localhost:5173/pagebound/
```

In the front-end header, click the **Local / API** toggle, sign in with role `ADMIN`, and your shelf is now backed by the API instead of IndexedDB.
