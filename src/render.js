// Turn raw response bodies into something a human can read in a terminal.
// Two paths: JSON (pretty-print) and HTML (strip markup, keep structure).
// Anything else falls through as UTF-8 text.

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  copy: "©",
  reg: "®",
  trade: "™",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  laquo: "«",
  raquo: "»",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
};

export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => safeFromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeFromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m);
}

function safeFromCodePoint(cp) {
  try {
    return String.fromCodePoint(cp);
  } catch {
    return "";
  }
}

// Render HTML as plain text. We don't aim for perfect formatting — just
// strip tags and inject sensible whitespace so the output reads naturally.
export function htmlToText(html) {
  let s = html;

  // Drop chunks that never contain user-visible text.
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
  s = s.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "");

  // Convert <br> and block-level tags into newlines so paragraphs survive.
  s = s.replace(/<\s*br\s*\/?\s*>/gi, "\n");
  s = s.replace(
    /<\/?\s*(p|div|section|article|header|footer|nav|main|aside|li|tr|h[1-6]|pre|blockquote|hr|table)\b[^>]*>/gi,
    "\n",
  );

  // Markers for list items so the user can see the structure.
  s = s.replace(/<\s*li\b[^>]*>/gi, "\n  • ");

  // Drop everything that's still a tag.
  s = s.replace(/<[^>]+>/g, "");

  s = decodeEntities(s);

  // Collapse runs of whitespace per line, then drop excess blank lines.
  s = s
    .split("\n")
    .map((line) => line.replace(/[ \t\f\v ]+/g, " ").trim())
    .join("\n");
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return s;
}

export function formatJson(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    // Not valid JSON despite the content-type — return as-is.
    return text;
  }
}

// Choose a renderer based on the response's content-type.
export function renderBody(headers, body) {
  const ct = (headers["content-type"] || "").toLowerCase();
  const text = body.toString("utf8");

  if (ct.includes("application/json") || ct.includes("+json")) {
    return formatJson(text);
  }
  if (ct.includes("text/html") || ct.includes("application/xhtml")) {
    return htmlToText(text);
  }
  return text;
}
