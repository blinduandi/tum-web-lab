# Deploying to Vercel

You'll create **two** Vercel projects from the same GitHub repo (`blinduandi/tum-web-lab`), each pointing at a different lab folder.

| Project | Purpose | Root directory |
|---|---|---|
| `pagebound-api`  | Lab 7 — REST + JWT + Swagger | `lab-7` |
| `pagebound-app`  | Lab 6 — React front-end       | `lab-6` |

Deploy the API first (you need its URL to wire up the front-end).

---

## A · Deploy Lab 7 (API)

### A1. Via the Vercel dashboard

1. Open <https://vercel.com/new> while signed in.
2. **Import Git Repository** → pick `blinduandi/tum-web-lab`.
3. **Project Name**: `pagebound-api` (or anything; it becomes the subdomain).
4. **Root Directory**: click *Edit*, choose `lab-7`.
5. **Framework Preset**: leave as *Other* (Vercel will read `vercel.json`).
6. **Build & Output Settings**: leave defaults — there is no build step for the API.
7. **Environment Variables** (optional but recommended):
   | Name | Value | Notes |
   |---|---|---|
   | `JWT_SECRET` | any long random string | overrides the dev placeholder |
   | `TOKEN_TTL_SECONDS` | `60` | lab spec, 1 minute |
   | `CORS_ORIGIN` | `*` (or your front-end URL once you have it) | comma-separated list ok |
8. Click **Deploy**. Wait for the build to finish (~60 seconds).
9. Copy the production URL Vercel gives you, e.g. `https://pagebound-api.vercel.app`.
10. Sanity-check it:
    - `https://pagebound-api.vercel.app/health` → `{"ok":true,"ts":...}`
    - `https://pagebound-api.vercel.app/docs` → Swagger UI
    - `https://pagebound-api.vercel.app/token?role=ADMIN` → a JWT

### A2. Via the Vercel CLI

From `lab-7/`:

```sh
vercel login          # one-time
vercel                # first deploy → answers Y/N + names the project
vercel --prod         # promote to production
```

Set env vars from the CLI:

```sh
vercel env add JWT_SECRET production
vercel env add CORS_ORIGIN production
```

---

## B · Deploy Lab 6 (front-end)

### B1. Via the dashboard

1. <https://vercel.com/new> → **Import** the same repo again.
2. **Project Name**: `pagebound-app`.
3. **Root Directory**: `lab-6`.
4. **Framework Preset**: Vercel will auto-detect *Vite*.
5. **Build & Output**:
   - Build command: `npm run build` (default).
   - Output directory: `dist` (default).
6. **Environment Variables**:
   | Name | Value | Notes |
   |---|---|---|
   | `VITE_API_BASE` | the Lab 7 URL from step A9 (e.g. `https://pagebound-api.vercel.app`) | used at build time as the default API base |
7. Click **Deploy**. Wait ~30 seconds.
8. Open the production URL — the front-end should load. Click the **API** toggle in the nav, sign in, and your CRUD now hits the Vercel-deployed back-end.

### B2. Via the CLI

From `lab-6/`:

```sh
vercel
vercel env add VITE_API_BASE production    # paste your API URL
vercel --prod
```

---

## C · Lock down CORS after both deploys

Once both URLs are known, edit `pagebound-api`'s `CORS_ORIGIN` env var to the exact front-end origin instead of `*`:

```
CORS_ORIGIN=https://pagebound-app.vercel.app
```

Redeploy the API (Vercel re-runs the build automatically on env-var change, or trigger it manually).

---

## D · How the pieces fit

```
                         ┌──────────────────────────────────┐
                         │ github.com/blinduandi/tum-web-lab │
                         └──────────────┬───────────────────┘
                                        │ git push origin main
                                        ▼
                       ┌──────────────────────────────┐
                       │   Vercel (auto-deploys both) │
                       └───┬──────────────────────┬───┘
                           │ root: lab-6          │ root: lab-7
                           ▼                      ▼
                  pagebound-app.vercel.app   pagebound-api.vercel.app
                  (Vite SPA → static)        (Express → serverless fn)
                           │                      ▲
                           │   fetch /books, etc. │
                           └──────────────────────┘
```

Every push to `main` triggers a redeploy of both projects automatically.

---

## E · Common gotchas

- **CORS error in browser**: the API's `CORS_ORIGIN` doesn't include the front-end URL. Either set `CORS_ORIGIN=*` or add the exact origin.
- **Front-end shows the wrong API**: clear `localStorage["pagebound:apiBase"]` in DevTools (or use the Sign-In dialog's *API base URL* field to override) — this value is sticky once set.
- **Swagger UI 404**: `/docs/` (with trailing slash) usually works better than `/docs`.
- **`openapi.yaml` not found in production**: this is what `vercel.json`'s `includeFiles` solves — make sure your project root matches `lab-7` so the path picks up the YAML.
- **JWT token expired during demo**: that's by design (1-minute TTL). Mint a new one from `/token`.
