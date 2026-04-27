// Simple file-backed HTTP cache. We honor Cache-Control: max-age and the
// Expires header. We do NOT implement conditional revalidation (ETag /
// Last-Modified) — once an entry expires we just refetch.
//
// Layout: .cache/<sha1(method + url + accept)>.json
// Each entry stores the parsed response (status, headers, body-as-base64)
// and an absolute expiry timestamp.

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const CACHE_DIR = path.resolve(".cache");
const DEFAULT_TTL_MS = 60_000; // fallback for 200s with no caching headers

function keyFor(method, url, accept) {
  return createHash("sha1").update(`${method} ${url} ${accept}`).digest("hex");
}

async function ensureDir() {
  if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR, { recursive: true });
}

export async function readCache(method, url, accept) {
  const file = path.join(CACHE_DIR, `${keyFor(method, url, accept)}.json`);
  if (!existsSync(file)) return null;
  try {
    const entry = JSON.parse(await readFile(file, "utf8"));
    if (Date.now() > entry.expiresAt) return null;
    return {
      status: entry.status,
      statusText: entry.statusText,
      headers: entry.headers,
      body: Buffer.from(entry.bodyB64, "base64"),
      finalUrl: entry.finalUrl,
      fromCache: true,
    };
  } catch {
    return null;
  }
}

export async function writeCache(method, url, accept, response) {
  // Only cache successful GETs — 4xx/5xx and redirects are not worth keeping.
  if (response.status < 200 || response.status >= 300) return;

  const ttl = computeTtl(response.headers);
  if (ttl <= 0) return;

  await ensureDir();
  const file = path.join(CACHE_DIR, `${keyFor(method, url, accept)}.json`);
  const entry = {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    bodyB64: response.body.toString("base64"),
    finalUrl: response.finalUrl,
    expiresAt: Date.now() + ttl,
  };
  await writeFile(file, JSON.stringify(entry));
}

function computeTtl(headers) {
  const cc = (headers["cache-control"] || "").toLowerCase();
  if (cc.includes("no-store") || cc.includes("no-cache") || cc.includes("private")) {
    return 0;
  }
  const m = /max-age=(\d+)/.exec(cc);
  if (m) return Number(m[1]) * 1000;

  if (headers.expires) {
    const t = Date.parse(headers.expires);
    if (!Number.isNaN(t)) return Math.max(0, t - Date.now());
  }
  return DEFAULT_TTL_MS;
}
