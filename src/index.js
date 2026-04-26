#!/usr/bin/env node
import { parseArgs, HELP_TEXT } from "./cli.js";

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
    case "search":
      console.error("go2web: not yet implemented");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`go2web: ${err.message}`);
  process.exit(1);
});
