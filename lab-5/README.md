# go2web

A small CLI that speaks HTTP/HTTPS over raw TCP sockets — no `http`, `https`, `fetch`, `axios`, or any other HTTP library. Just `net` and `tls`.

## Usage

```sh
go2web -u <URL>          # fetch a URL and print a human-readable response
go2web -s <search-term>  # search the web and list the top 10 results
go2web -h                # show help
```

After a search, results are numbered. Open one with:

```sh
go2web -s "lord of the rings" --open 3
```

## Install

```sh
npm install
npm link            # exposes the `go2web` binary on your PATH
```

Or run without linking:

```sh
node src/index.js -u https://example.com
```

## Features

- Raw TCP (`net`) + TLS (`tls`) — request/response framing implemented by hand
- HTTP/1.1 with `Host`, `Connection: close`, `Accept-Encoding: gzip`
- Chunked transfer decoding
- gzip / deflate response decoding
- Redirect following (3xx, up to 5 hops)
- File-based response cache honoring `Cache-Control: max-age` and `Expires`
- Content negotiation — JSON is pretty-printed, HTML is rendered as readable text
- Search via DuckDuckGo's HTML endpoint, top 10 results with titles + URLs
- `--open N` to follow a numbered search result without retyping the URL

## Project layout

```
src/
  index.js        CLI entry point
  cli.js          argv parser
  url.js          URL parsing
  http.js         raw HTTP/HTTPS client (TCP + TLS)
  transport.js    socket I/O, gzip/chunked decoding
  cache.js        on-disk HTTP cache
  render.js       HTML-to-text and JSON formatting
  search.js       DuckDuckGo search adapter
```
