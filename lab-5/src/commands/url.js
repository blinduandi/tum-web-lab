// `go2web -u <URL>` — fetch and pretty-print a URL.
// Wires together: cache lookup -> raw HTTP -> renderer -> cache write.

import { fetchUrl } from "../http.js";
import { readCache, writeCache } from "../cache.js";
import { renderBody } from "../render.js";

export async function runUrl(url, flags) {
  // Content negotiation: with --json, ask the server for JSON first and
  // fall back to anything; otherwise prefer HTML/JSON over the rest.
  const accept = flags.json
    ? "application/json, */*;q=0.5"
    : "text/html, application/xhtml+xml, application/json;q=0.9, */*;q=0.8";

  if (!flags.noCache) {
    const cached = await readCache("GET", url, accept);
    if (cached) {
      printResponse(cached, { cached: true });
      return;
    }
  }

  const res = await fetchUrl(url, { headers: { Accept: accept } });
  if (!flags.noCache) await writeCache("GET", url, accept, res);
  printResponse(res, { cached: false });
}

function printResponse(res, { cached }) {
  const tag = cached ? " (cache)" : "";
  console.error(`HTTP ${res.status} ${res.statusText || ""}${tag}`.trim());
  if (res.finalUrl) console.error(`URL: ${res.finalUrl}`);
  const ct = res.headers["content-type"];
  if (ct) console.error(`Content-Type: ${ct}`);
  console.error("");
  process.stdout.write(renderBody(res.headers, res.body));
  process.stdout.write("\n");
}
