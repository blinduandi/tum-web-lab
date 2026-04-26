// Minimal argv parser tailored to go2web.
// We accept three primary modes (-u, -s, -h) plus a few modifiers:
//   --open N   follow the Nth search result
//   --json     prefer JSON via Accept header (content negotiation)
//   --no-cache bypass the response cache for this run

export const HELP_TEXT = `go2web — HTTP over raw TCP sockets

Usage:
  go2web -u <URL>             fetch a URL and print a human-readable response
  go2web -s <search-term>     search the web and list the top 10 results
  go2web -h                   show this help

Modifiers:
  --open <N>                  with -s, follow the Nth result (1-based)
  --json                      with -u, prefer JSON via Accept header
  --no-cache                  bypass the response cache for this run

Examples:
  go2web -u https://example.com
  go2web -u https://api.github.com/repos/nodejs/node --json
  go2web -s "lord of the rings"
  go2web -s "lord of the rings" --open 3
`;

export function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0) return { command: "help" };

  const flags = { json: false, noCache: false, open: null };
  const positional = [];
  let command = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "-h":
      case "--help":
        return { command: "help" };
      case "-u":
        command = "url";
        positional.push(args[++i]);
        break;
      case "-s":
        command = "search";
        // Greedily collect subsequent non-flag tokens so multi-word
        // searches work without quoting (e.g. -s lord of the rings).
        while (i + 1 < args.length && !args[i + 1].startsWith("-")) {
          positional.push(args[++i]);
        }
        break;
      case "--json":
        flags.json = true;
        break;
      case "--no-cache":
        flags.noCache = true;
        break;
      case "--open": {
        const n = Number(args[++i]);
        if (!Number.isInteger(n) || n < 1) {
          throw new Error(`--open expects a positive integer, got ${args[i]}`);
        }
        flags.open = n;
        break;
      }
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!command) return { command: "help" };

  if (command === "url") {
    if (!positional[0]) throw new Error("-u requires a URL");
    return { command: "url", url: positional[0], flags };
  }

  if (command === "search") {
    if (positional.length === 0) throw new Error("-s requires a search term");
    return { command: "search", query: positional.join(" "), flags };
  }

  return { command: "help" };
}
