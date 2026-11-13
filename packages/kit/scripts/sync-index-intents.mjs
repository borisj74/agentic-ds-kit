#!/usr/bin/env node
/**
 * Copies each contract's `intent` into its contracts/index.json row, so the index never drifts
 * from the contracts. The contract is the source of truth; the index row follows it.
 *
 *   node scripts/sync-index-intents.mjs          # rewrite index.json
 *   node scripts/sync-index-intents.mjs --check  # exit 1 and list rows that differ
 *
 * Rows whose file has no `intent` (tokens/tokens.json) keep their hand-written one.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(kitRoot, "contracts/index.json");

/** Index rows whose intent differs from their contract: [{ id, index, contract }]. */
export function findDrift() {
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  const drift = [];
  for (const row of index) {
    if (!row.path) continue;
    const contract = JSON.parse(readFileSync(join(kitRoot, row.path), "utf8"));
    if (typeof contract.intent !== "string") continue;
    if (row.intent !== contract.intent) drift.push({ id: row.id, index: row.intent, contract: contract.intent });
  }
  return { index, drift };
}

function main() {
  const check = process.argv.includes("--check");
  const { index, drift } = findDrift();
  if (check) {
    if (drift.length === 0) {
      console.log("contracts/index.json intents match their contracts.");
      return;
    }
    console.error(`contracts/index.json: ${drift.length} intent(s) differ from their contract:`);
    for (const row of drift) console.error(`  ${row.id}`);
    console.error("Run: npm run sync:index -w agentic-ds-kit");
    process.exit(1);
  }
  const byId = new Map(drift.map((row) => [row.id, row.contract]));
  for (const row of index) if (byId.has(row.id)) row.intent = byId.get(row.id);
  writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  console.log(`Synced ${drift.length} intent(s) into contracts/index.json.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
