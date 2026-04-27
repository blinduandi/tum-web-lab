# pagebound-api

REST back-end for the [Pagebound](https://github.com/blinduandi/tum-web-lab6) book library — built for **FAF Web Programming, Lab 7**.

- Node.js + Express
- JWT auth with role / permission gating
- Pagination via `?skip=` and `?limit=`
- Swagger UI at `/docs`
- CORS open to the Lab 6 dev server out of the box

## Run

```sh
npm install
npm start              # http://localhost:4000
# or
npm run dev            # restarts on file changes
```

Optional environment overrides — copy `.env.example` to `.env`:

| Variable             | Default                                  | Purpose                          |
|----------------------|------------------------------------------|----------------------------------|
| `PORT`               | `4000`                                   | listen port                      |
| `JWT_SECRET`         | `change-me-in-production`                | HS256 secret                     |
| `TOKEN_TTL_SECONDS`  | `60`                                     | token lifetime (lab spec asks 1m)|
| `CORS_ORIGIN`        | `http://localhost:5173,http://127.0.0.1:5173` | comma-separated allowed origins |

> Run with the env file: `node --env-file=.env src/server.js`

## Endpoints

| Method | Path             | Auth        | Notes                                |
|--------|------------------|-------------|--------------------------------------|
| GET    | `/`              | —           | service banner                       |
| GET    | `/health`        | —           | liveness probe                       |
| POST   | `/token`         | —           | issue a JWT (JSON body)              |
| GET    | `/token`         | —           | issue a JWT (query string)           |
| GET    | `/books`         | `READ`      | paginated list                       |
| GET    | `/books/:id`     | `READ`      | one book by id                       |
| POST   | `/books`         | `WRITE`     | create                               |
| PUT    | `/books/:id`     | `WRITE`     | partial update                       |
| DELETE | `/books/:id`     | `DELETE`    | remove                               |
| GET    | `/docs`          | —           | Swagger UI                           |
| GET    | `/openapi.json`  | —           | raw OpenAPI 3 spec                   |

### Roles → permissions

| Role     | Permissions          |
|----------|----------------------|
| `GUEST`  | (none)               |
| `READER` | `READ`               |
| `EDITOR` | `READ`, `WRITE`      |
| `ADMIN`  | `READ`, `WRITE`, `DELETE` |

You can also grant permissions explicitly without a role — both forms produce the same effective set when the token is verified.

### Status codes

| Code | When                                                   |
|------|--------------------------------------------------------|
| 200  | OK                                                     |
| 201  | Resource created (`POST /books`) — `Location` header set |
| 204  | Resource removed (`DELETE /books/:id`)                 |
| 400  | Validation failure or unknown role                     |
| 401  | Missing / malformed / expired token                    |
| 403  | Token is valid but lacks the required permission       |
| 404  | No matching route or no book with that id              |
| 500  | Unexpected error (logged server-side)                  |

## Demo (curl)

```sh
# 1. Get a token (JSON body)
curl -X POST http://localhost:4000/token \
  -H 'Content-Type: application/json' \
  -d '{"role":"EDITOR"}'
# → { "token": "eyJhbGciOi…", "expiresIn": 60, "permissions": ["READ","WRITE"] }

# 2. Or via query string
curl "http://localhost:4000/token?role=ADMIN&permissions=DELETE"

# Save a token in a shell variable for the rest of the demo
TOKEN=$(curl -s -X POST http://localhost:4000/token \
  -H 'Content-Type: application/json' \
  -d '{"role":"ADMIN"}' | node -e \
  "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

# 3. List books with pagination
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/books?skip=0&limit=2"

# 4. Create a book
curl -X POST http://localhost:4000/books \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"The Hobbit","author":"J.R.R. Tolkien","status":"reading"}'

# 5. Update it (use the returned id)
curl -X PUT http://localhost:4000/books/<id> \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"liked":true,"rating":5}'

# 6. Delete it
curl -X DELETE http://localhost:4000/books/<id> \
  -H "Authorization: Bearer $TOKEN"

# 7. Try writing with a READER token — should return 403
READER=$(curl -s -X POST http://localhost:4000/token \
  -H 'Content-Type: application/json' -d '{"role":"READER"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")
curl -i -X POST http://localhost:4000/books \
  -H "Authorization: Bearer $READER" \
  -H 'Content-Type: application/json' \
  -d '{"title":"forbidden"}'
```

## Demo (Swagger UI)

Open <http://localhost:4000/docs> → click **Authorize** → paste the token from `/token` → every endpoint is now reachable from the page.

## Project layout

```
src/
  server.js                Express app (CORS, routers, error handlers)
  config.js                env-driven config
  auth/
    jwt.js                 sign/verify JWTs
    roles.js               role → permission map
    middleware.js          requireAuth + requirePermission
  routes/
    token.js               POST/GET /token
    books.js               /books CRUD with pagination
    docs.js                Swagger UI mount
  middleware/
    errors.js              404 + central error handler
  store/
    books.js               in-memory store
    seed.js                fixture data
openapi.yaml               machine-readable API spec
```

## Lab 6 integration

The Lab 6 front-end has an **API Sync** toggle (header → cloud icon). When enabled it stops talking to IndexedDB and points all CRUD at this API. The login dialog asks for a role and stores the JWT in `localStorage`. When the token expires, a 401 is intercepted and the user is asked to sign in again.

For local development:

1. `npm start` here → http://localhost:4000
2. `npm run dev` in the [Lab 6 repo](../../Lab%206/tum-web-lab6) → http://localhost:5173/pagebound/
3. In the front-end, click the cloud icon, pick a role, and sign in — books now live in this API instead of in your browser's IndexedDB.
