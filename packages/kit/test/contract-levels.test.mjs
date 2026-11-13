/**
 * Every contract says where it sits with `level` (atom, molecule, organism, block, template).
 * Blocks are `block`, patterns are `template`, and no component is `template`.
 * The index copies `level` from each contract (see scripts/sync-index-intents.mjs).
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { LEVELS } from "../scripts/sync-index-intents.mjs";

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const contractsDir = join(kitRoot, "contracts");
const patternsDir = join(contractsDir, "patterns");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const components = readdirSync(contractsDir)
  .filter((file) => file.endsWith(".json") && file !== "index.json")
  .map((file) => ({ file, contract: readJson(join(contractsDir, file)) }));

const patterns = readdirSync(patternsDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => ({ file, contract: readJson(join(patternsDir, file)) }));

const index = readJson(join(contractsDir, "index.json"));

test("LEVELS lists the five levels, smallest first", () => {
  assert.deepEqual([...LEVELS], ["atom", "molecule", "organism", "block", "template"]);
});

test("every contract has a known level", () => {
  const bad = [...components, ...patterns]
    .filter(({ contract }) => !LEVELS.includes(contract.level))
    .map(({ file, contract }) => `${file}: ${contract.level ?? "(none)"}`);
  assert.deepEqual(bad, [], "contracts with a missing or unknown level");
});

test("every non-foundation index row has a known level", () => {
  const bad = index
    .filter((row) => row.group !== "foundation")
    .filter((row) => !LEVELS.includes(row.level))
    .map((row) => `${row.id}: ${row.level ?? "(none)"}`);
  assert.deepEqual(bad, [], "index rows with a missing or unknown level");
});

test("foundation index rows have no level", () => {
  const bad = index.filter((row) => row.group === "foundation" && "level" in row).map((row) => row.id);
  assert.deepEqual(bad, [], "tokens are a foundation, not a level");
});

test("blocks are level block, and only blocks are", () => {
  const notBlockLevel = components
    .filter(({ contract }) => contract.kind === "block" && contract.level !== "block")
    .map(({ file }) => file);
  assert.deepEqual(notBlockLevel, [], 'kind: "block" contracts must be level block');

  const notKindBlock = [...components, ...patterns]
    .filter(({ contract }) => contract.level === "block" && contract.kind !== "block")
    .map(({ file }) => file);
  assert.deepEqual(notKindBlock, [], 'level block contracts must have kind: "block"');
});

test("patterns are level template, and no component is", () => {
  const notTemplate = patterns.filter(({ contract }) => contract.level !== "template").map(({ file }) => file);
  assert.deepEqual(notTemplate, [], "pattern contracts must be level template");

  const componentTemplates = components
    .filter(({ contract }) => contract.level === "template")
    .map(({ file }) => file);
  assert.deepEqual(componentTemplates, [], "components cannot be level template");
});
