// Centralized config. We deliberately avoid `dotenv` — Node 20+ supports
// `--env-file=.env` natively, but for the lab we just read process.env and
// fall back to safe defaults so `npm start` works with zero setup.
//
// CORS_ORIGIN may be a comma-separated list of exact origins, or `*` to
// allow any origin. The default opens to `*` so that a freshly-deployed
// Vercel front-end (whose URL we don't know in advance) can reach the API
// without configuration; lock down with an explicit list in production.

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  tokenTtlSeconds: Number(process.env.TOKEN_TTL_SECONDS) || 60,
  corsOrigins: (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
