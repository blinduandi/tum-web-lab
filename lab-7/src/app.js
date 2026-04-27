// Express app — built once and shared by both the local listener
// (`src/server.js`) and the Vercel serverless handler (`api/index.js`).
// Owns nothing platform-specific; whoever imports it is responsible for
// actually putting the app on a port.

import express from "express";
import cors from "cors";

import { config } from "./config.js";
import { tokenRouter } from "./routes/token.js";
import { booksRouter } from "./routes/books.js";
import { docsMiddleware, openApiSpec } from "./routes/docs.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";

const app = express();

// CORS — a request is allowed if its Origin appears in config.corsOrigins,
// OR if the configured list contains "*". This makes the same image deploy
// to a fixed Vercel URL today and pivot to a more locked-down list later
// without code changes.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // curl / SSR / same-origin
      if (config.corsOrigins.includes("*")) return callback(null, true);
      if (config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ name: "pagebound-api", version: "1.0.0", docs: "/docs" });
});

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use(tokenRouter);
app.use(booksRouter);

// Docs are public — Swagger UI plus the raw spec for tools that consume it.
app.use("/docs", docsMiddleware);
app.get("/openapi.json", (_req, res) => res.json(openApiSpec));

// 404 + error handler must be registered last.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
