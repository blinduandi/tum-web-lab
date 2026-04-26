// URL parser. We rely on the WHATWG URL parser only for syntax — the
// network/transport layer below opens the socket itself.

export function parseUrl(input) {
  // Allow callers to pass a bare hostname (example.com) without a scheme.
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(input)
    ? input
    : `http://${input}`;

  let u;
  try {
    u = new URL(withScheme);
  } catch {
    throw new Error(`Invalid URL: ${input}`);
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error(`Unsupported protocol: ${u.protocol}`);
  }

  const isHttps = u.protocol === "https:";
  const port = u.port ? Number(u.port) : isHttps ? 443 : 80;
  const path = `${u.pathname || "/"}${u.search || ""}`;

  return {
    href: u.href,
    protocol: u.protocol,
    isHttps,
    hostname: u.hostname,
    port,
    path,
  };
}

// RFC 3986 §5.3 — combine a base URL with a (possibly relative) reference.
// Used when a server returns a Location header for redirects.
export function resolveUrl(base, reference) {
  return new URL(reference, base).href;
}
