// Search adapter — uses DuckDuckGo's HTML endpoint (html.duckduckgo.com).
// We parse the HTML response with a regex (good enough for DDG's stable
// markup; this is not a general-purpose HTML parser).
//
// DDG wraps result URLs through a redirector like
//   //duckduckgo.com/l/?uddg=<percent-encoded-target>&...
// so we unwrap that to get the real destination.

import { fetchUrl } from "./http.js";
import { decodeEntities } from "./render.js";

const SEARCH_HOST = "https://html.duckduckgo.com/html/";

export async function search(query) {
  const url = `${SEARCH_HOST}?q=${encodeURIComponent(query)}`;
  const res = await fetchUrl(url, {
    headers: {
      // DDG's HTML endpoint serves real results only when it sees a
      // browser-ish UA. The UA value is otherwise irrelevant.
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  });
  if (res.status !== 200) {
    throw new Error(`Search failed: HTTP ${res.status}`);
  }
  return parseResults(res.body.toString("utf8")).slice(0, 10);
}

export function parseResults(html) {
  const out = [];
  // Each result looks like:
  //   <a class="result__a" href="...">Title</a>
  //   <a class="result__snippet" href="...">snippet text</a>
  const linkRe =
    /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const rawHref = decodeEntities(m[1]);
    const title = textOnly(m[2]);
    const url = unwrapRedirect(rawHref);
    if (!url || !title) continue;
    out.push({ title, url });
  }
  return out;
}

function textOnly(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function unwrapRedirect(href) {
  // Normalize protocol-relative URLs and DDG's redirector wrapper.
  let abs = href;
  if (abs.startsWith("//")) abs = `https:${abs}`;

  try {
    const u = new URL(abs, "https://duckduckgo.com");
    if (u.hostname.endsWith("duckduckgo.com") && u.searchParams.has("uddg")) {
      return u.searchParams.get("uddg");
    }
    return u.href;
  } catch {
    return null;
  }
}
