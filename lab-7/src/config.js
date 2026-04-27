// Centralized config. We deliberately avoid `dotenv` — Node 20+ supports
// `--env-file=.env` natively, but for the lab we just read process.env and
// fall back to safe defaults so `npm start` works with zero setup.

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  tokenTtlSeconds: Number(process.env.TOKEN_TTL_SECONDS) || 60,
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
