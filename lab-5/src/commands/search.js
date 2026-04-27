// `go2web -s <query>` — search the web and list the top 10 results.
// With `--open N`, follow the Nth result by piping it back to runUrl.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { search } from "../search.js";
import { runUrl } from "./url.js";

const STATE_DIR = path.resolve(".cache");
const LAST_RESULTS = path.join(STATE_DIR, "last-search.json");

export async function runSearch(query, flags) {
  // If the user passed `--open N` and re-ran the same query, allow them
  // to skip a network round-trip by reusing the previous result list.
  // We still re-search if the query differs (or there's no prior state).
  const previous = await readLastResults();
  let results;
  if (previous && previous.query === query) {
    results = previous.results;
  } else {
    results = await search(query);
    await writeLastResults({ query, results });
  }

  if (results.length === 0) {
    console.error(`No results for: ${query}`);
    process.exit(1);
  }

  if (flags.open != null) {
    const idx = flags.open - 1;
    if (idx < 0 || idx >= results.length) {
      throw new Error(`--open ${flags.open} is out of range (1..${results.length})`);
    }
    const target = results[idx];
    console.error(`Opening #${flags.open}: ${target.title}`);
    console.error(`URL: ${target.url}`);
    console.error("");
    await runUrl(target.url, flags);
    return;
  }

  // Default: print a numbered list. Format is stable so people / scripts
  // can grep for "<n>. <title>" lines.
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    console.log(`${String(i + 1).padStart(2, " ")}. ${r.title}`);
    console.log(`    ${r.url}`);
  }
  console.error(`\nTip: re-run with \`--open <N>\` to follow a result.`);
}

async function readLastResults() {
  if (!existsSync(LAST_RESULTS)) return null;
  try {
    return JSON.parse(await readFile(LAST_RESULTS, "utf8"));
  } catch {
    return null;
  }
}

async function writeLastResults(data) {
  if (!existsSync(STATE_DIR)) await mkdir(STATE_DIR, { recursive: true });
  await writeFile(LAST_RESULTS, JSON.stringify(data, null, 2));
}
