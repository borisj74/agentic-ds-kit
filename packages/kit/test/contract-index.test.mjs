/**
 * contracts/index.json intents stay in sync with each contract's `intent` (the contract wins).
 * Fix drift with: npm run sync:index -w agentic-ds-kit
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { findDrift } from "../scripts/sync-index-intents.mjs";

test("every index intent matches its contract", () => {
  const { drift } = findDrift();
  assert.deepEqual(
    drift.map((row) => row.id),
    [],
    "index intents differ from their contracts; run npm run sync:index -w agentic-ds-kit",
  );
});
