#!/usr/bin/env node
/**
 * Copies each contract's `intent` and `level` into its contracts/index.json row, so the index
 * never drifts from the contracts. The contract is the source of truth; the index row follows it.
 *
 *   node scripts/sync-index-intents.mjs          # rewrite index.json
 *   node scripts/sync-index-intents.mjs --check  # exit 1 and list rows that differ
 *
 * Rows whose file has no `intent` or `level` (tokens/tokens.json) keep what they have.
 * Tokens are a foundation, not a level, so the tokens row has no `level`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LEVELS } from "../bin/levels.mjs";

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(kitRoot, "contracts/index.json");

/** The five levels, smallest first. Defined once in bin/levels.mjs (shipped) and re-exported here. */
export { LEVELS };

/** Fields copied from each contract into its index row. */
const SYNCED_FIELDS = ["intent", "level"];

/**
 * Index rows that differ from their contract: [{ id, field, index, contract }].
 * `field` is "intent" or "level".
 */
export function findDrift() {
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  const drift = [];
  for (const row of index) {
    if (!row.path) continue;
    const contract = JSON.parse(readFileSync(join(kitRoot, row.path), "utf8"));
    for (const field of SYNCED_FIELDS) {
      if (typeof contract[field] !== "string") continue;
      if (row[field] !== contract[field]) {
        drift.push({ id: row.id, field, index: row[field], contract: contract[field] });
      }
    }
  }
  return { index, drift };
}

/** Sets `row.level`, adding it right after `status` when the row has none yet. */
function setLevel(row, level) {
  if ("level" in row) {
    row.level = level;
    return row;
  }
  const next = {};
  for (const [key, value] of Object.entries(row)) {
    next[key] = value;
    if (key === "status") next.level = level;
  }
  if (!("level" in next)) next.level = level;
  return next;
}

function main() {
  const check = process.argv.includes("--check");
  const { index, drift } = findDrift();
  if (check) {
    if (drift.length === 0) {
      console.log("contracts/index.json intents and levels match their contracts.");
      return;
    }
    console.error(`contracts/index.json: ${drift.length} field(s) differ from their contract:`);
    for (const row of drift) console.error(`  ${row.id} (${row.field})`);
    console.error("Run: npm run sync:index -w agentic-ds-kit");
    process.exit(1);
  }
  const updated = index.map((row) => {
    let next = row;
    for (const item of drift) {
      if (item.id !== row.id) continue;
      if (item.field === "level") next = setLevel(next, item.contract);
      else next[item.field] = item.contract;
    }
    return next;
  });
  writeFileSync(indexPath, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`Synced ${drift.length} field(s) into contracts/index.json.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
