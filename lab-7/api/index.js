// Vercel serverless entry. Vercel routes every request matched by
// vercel.json into this file's default export. Express is fully compatible
// with the Vercel function signature — `(req, res)` — so we just hand
// the shared app over.

export { default } from "../src/app.js";
