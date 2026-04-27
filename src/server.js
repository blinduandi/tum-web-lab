import express from "express";
import cors from "cors";

import { config } from "./config.js";
import { tokenRouter } from "./routes/token.js";
import { booksRouter } from "./routes/books.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";

const app = express();

// Open up the API to the configured front-end origins. The list lives in
// config.corsOrigins; for the lab the defaults match Vite's dev server.
app.use(
  cors({
    origin: config.corsOrigins,
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

// 404 + error handler must be registered last.
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`pagebound-api listening on http://localhost:${config.port}`);
  console.log(`  docs:  http://localhost:${config.port}/docs`);
  console.log(`  CORS:  ${config.corsOrigins.join(", ")}`);
});
