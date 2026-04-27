#!/usr/bin/env node
import { parseArgs, HELP_TEXT } from "./cli.js";
import { runUrl } from "./commands/url.js";
import { runSearch } from "./commands/search.js";

async function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv);
  } catch (err) {
    console.error(`go2web: ${err.message}`);
    console.error("Run `go2web -h` for usage.");
    process.exit(2);
  }

  switch (parsed.command) {
    case "help":
      process.stdout.write(HELP_TEXT);
      return;
    case "url":
      await runUrl(parsed.url, parsed.flags);
      return;
    case "search":
      await runSearch(parsed.query, parsed.flags);
      return;
  }
}

main().catch((err) => {
  console.error(`go2web: ${err.message}`);
  process.exit(1);
});
