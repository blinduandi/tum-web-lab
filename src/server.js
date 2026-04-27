import express from "express";

import { config } from "./config.js";
import { tokenRouter } from "./routes/token.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "pagebound-api",
    version: "1.0.0",
    docs: "/docs",
  });
});

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use(tokenRouter);

app.listen(config.port, () => {
  console.log(`pagebound-api listening on http://localhost:${config.port}`);
});
