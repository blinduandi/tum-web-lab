// Low-level transport: open a TCP (or TLS) socket, write the raw HTTP/1.1
// request bytes, read all response bytes until the server closes the
// connection (we always send Connection: close), and then split header
// from body, decode chunked transfer, and decompress gzip/deflate.

import net from "node:net";
import tls from "node:tls";
import { gunzipSync, inflateSync } from "node:zlib";

const SOCKET_TIMEOUT_MS = 15_000;
const CRLF = "\r\n";

export function sendRequest({ hostname, port, isHttps, requestText }) {
  // Returns the full response Buffer once the peer closes the connection.
  return new Promise((resolve, reject) => {
    const chunks = [];
    const onData = (chunk) => chunks.push(chunk);
    const onError = (err) => reject(err);
    const onEnd = () => resolve(Buffer.concat(chunks));

    const opts = { host: hostname, port };
    const socket = isHttps
      ? tls.connect({ ...opts, servername: hostname })
      : net.connect(opts);

    socket.setTimeout(SOCKET_TIMEOUT_MS, () => {
      socket.destroy(new Error(`Socket timed out after ${SOCKET_TIMEOUT_MS}ms`));
    });

    socket.once(isHttps ? "secureConnect" : "connect", () => {
      socket.write(requestText);
    });
    socket.on("data", onData);
    socket.once("end", onEnd);
    socket.once("error", onError);
  });
}

// Build a well-formed HTTP/1.1 request as a single string. The request line
// uses the origin-form path; headers are CRLF-separated and terminated by a
// blank line. We never send a body — go2web is GET-only.
export function buildRequest({ method = "GET", host, path, headers = {} }) {
  const merged = {
    Host: host,
    "User-Agent": "go2web/1.0 (+https://github.com/)",
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate",
    Connection: "close",
    ...headers,
  };
  const lines = [`${method} ${path} HTTP/1.1`];
  for (const [k, v] of Object.entries(merged)) lines.push(`${k}: ${v}`);
  return lines.join(CRLF) + CRLF + CRLF;
}

// Split the raw response Buffer into a parsed { status, headers, body }.
// Works on bytes (not strings) because the body may be binary (gzip).
export function parseResponse(raw) {
  const sep = Buffer.from("\r\n\r\n");
  const headerEnd = raw.indexOf(sep);
  if (headerEnd < 0) throw new Error("Malformed response: no header terminator");

  const headerText = raw.slice(0, headerEnd).toString("ascii");
  let body = raw.slice(headerEnd + sep.length);

  const [statusLine, ...headerLines] = headerText.split(CRLF);
  const m = /^HTTP\/(\d\.\d)\s+(\d+)\s*(.*)$/.exec(statusLine);
  if (!m) throw new Error(`Malformed status line: ${statusLine}`);
  const status = Number(m[2]);
  const statusText = m[3];

  // Header names are case-insensitive — normalize to lowercase keys.
  const headers = {};
  for (const line of headerLines) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const name = line.slice(0, i).trim().toLowerCase();
    const value = line.slice(i + 1).trim();
    // Set-Cookie can repeat; everything else we keep last-wins (good enough).
    headers[name] = value;
  }

  if ((headers["transfer-encoding"] || "").toLowerCase().includes("chunked")) {
    body = decodeChunked(body);
  }

  const enc = (headers["content-encoding"] || "").toLowerCase();
  if (enc.includes("gzip")) body = gunzipSync(body);
  else if (enc.includes("deflate")) body = inflateSync(body);

  return { status, statusText, headers, body };
}

// Decode chunked transfer encoding (RFC 7230 §4.1).
// Each chunk: <size in hex>\r\n<data>\r\n, terminated by a 0-size chunk.
function decodeChunked(buf) {
  const out = [];
  let i = 0;
  while (i < buf.length) {
    const lineEnd = buf.indexOf("\r\n", i);
    if (lineEnd < 0) break;
    // Strip any chunk extensions after `;` before parsing the size.
    const sizeHex = buf.slice(i, lineEnd).toString("ascii").split(";")[0].trim();
    const size = parseInt(sizeHex, 16);
    if (Number.isNaN(size)) throw new Error(`Invalid chunk size: ${sizeHex}`);
    i = lineEnd + 2;
    if (size === 0) break;
    out.push(buf.slice(i, i + size));
    i += size + 2; // skip data + trailing CRLF
  }
  return Buffer.concat(out);
}
