/**
 * DashboardPattern: the MRR change strip's steps on the demo data. The pattern is copy-in source
 * (not in dist), so this transpiles the two plain TS files it needs with TypeScript into a temp folder.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { after, before, describe, test } from "node:test";
import ts from "typescript";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../patterns/DashboardPattern");
const out = mkdtempSync(join(tmpdir(), "dashboard-steps-"));
let data;
let steps;

function transpile(name) {
  const source = readFileSync(join(dir, `${name}.ts`), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false },
  });
  writeFileSync(join(out, `${name}.mjs`), outputText.replace(/from "\.\/([\w-]+)"/g, 'from "./$1.mjs"'));
}

before(async () => {
  transpile("dashboard-data");
  transpile("mrrSteps");
  data = await import(pathToFileURL(join(out, "dashboard-data.mjs")).href);
  steps = await import(pathToFileURL(join(out, "mrrSteps.mjs")).href);
});

after(() => rmSync(out, { recursive: true, force: true }));

describe("DashboardPattern MRR change strip", () => {
  test("Last 30 days, daily: first step is the change from the hidden start, largest drop is Nov 6", () => {
    const metrics = data.metricsFor("30d", "daily");
    const mrr = metrics.find((m) => m.id === "mrr");
    const labels = data.labelsFor("30d", "daily");
    const values = steps.mrrSteps(mrr, metrics);
    assert.equal(values.length, labels.length);
    assert.equal(values[0], 300);
    assert.deepEqual(values, metrics.find((m) => m.id === "netNew").series.current, "matches net new MRR");
    const at = steps.largestDrop(values);
    assert.equal(labels[at], "Nov 6");
    assert.equal(values[at], -700);
  });

  test("falls back to net new, then 0, when there is no previous period", () => {
    const metrics = data.metricsFor("30d", "daily");
    const mrr = metrics.find((m) => m.id === "mrr");
    const bare = { ...mrr, series: { current: mrr.series.current, previous: [] } };
    assert.equal(steps.mrrSteps(bare, metrics)[0], 300);
    assert.equal(steps.mrrSteps(bare, [bare])[0], 0);
  });

  test("largestDrop is -1 when nothing fell", () => {
    assert.equal(steps.largestDrop([0, 100, 200]), -1);
  });
});
