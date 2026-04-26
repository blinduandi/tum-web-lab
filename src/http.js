// High-level HTTP client built on top of transport.js.
// Owns request orchestration: redirect following, header construction,
// and turning the parsed response into a stable shape for the renderer.

import { parseUrl, resolveUrl } from "./url.js";
import { buildRequest, parseResponse, sendRequest } from "./transport.js";

const MAX_REDIRECTS = 5;

export async function fetchUrl(url, { headers = {} } = {}) {
  let current = url;
  const trail = [];

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const u = parseUrl(current);
    const requestText = buildRequest({
      host: u.hostname + (u.port === 80 || u.port === 443 ? "" : `:${u.port}`),
      path: u.path,
      headers,
    });

    const raw = await sendRequest({
      hostname: u.hostname,
      port: u.port,
      isHttps: u.isHttps,
      requestText,
    });
    const res = parseResponse(raw);
    trail.push({ url: current, status: res.status });

    // 3xx with a Location header: follow it. We use GET for every hop —
    // this matches what curl/browsers do for 301/302/303/307/308 GETs.
    if (res.status >= 300 && res.status < 400 && res.headers.location) {
      current = resolveUrl(current, res.headers.location);
      continue;
    }

    return { ...res, finalUrl: current, trail };
  }

  throw new Error(`Too many redirects (>${MAX_REDIRECTS}) starting from ${url}`);
}
