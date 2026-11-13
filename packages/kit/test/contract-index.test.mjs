/**
 * contracts/index.json intents and levels stay in sync with each contract (the contract wins).
 * Fix drift with: npm run sync:index -w agentic-ds-kit
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { findDrift } from "../scripts/sync-index-intents.mjs";

test("every index intent matches its contract", () => {
  const { drift } = findDrift();
  assert.deepEqual(
    drift.filter((row) => row.field === "intent").map((row) => row.id),
    [],
    "index intents differ from their contracts; run npm run sync:index -w agentic-ds-kit",
  );
});

test("every index level matches its contract", () => {
  const { drift } = findDrift();
  assert.deepEqual(
    drift.filter((row) => row.field === "level").map((row) => row.id),
    [],
    "index levels differ from their contracts; run npm run sync:index -w agentic-ds-kit",
  );
});
