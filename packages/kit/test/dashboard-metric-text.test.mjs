/**
 * DashboardPattern: the chart card's finding title and the KPI arrows on the demo data. The pattern
 * is copy-in source (not in dist), so this transpiles the two plain TS files it needs into a temp folder.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { after, before, describe, test } from "node:test";
import ts from "typescript";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../patterns/DashboardPattern");
const out = mkdtempSync(join(tmpdir(), "dashboard-text-"));
let data;
let text;

function transpile(name) {
  const source = readFileSync(join(dir, `${name}.ts`), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false },
  });
  writeFileSync(join(out, `${name}.mjs`), outputText.replace(/from "\.\/([\w-]+)"/g, 'from "./$1.mjs"'));
}

before(async () => {
  transpile("dashboard-data");
  transpile("metricText");
  data = await import(pathToFileURL(join(out, "dashboard-data.mjs")).href);
  text = await import(pathToFileURL(join(out, "metricText.mjs")).href);
});

after(() => rmSync(out, { recursive: true, force: true }));

const byId = (period, granularity) => Object.fromEntries(data.metricsFor(period, granularity).map((m) => [m.id, m]));

describe("DashboardPattern finding title", () => {
  test("MRR, last 3 months: $7.4k below the $420k target, as on the board", () => {
    assert.equal(text.findingFor(byId("3m", "weekly").mrr), "MRR is $7.4k below the $420k target");
  });

  test("names the reference by its first word, drops the tile count and agrees in number", () => {
    const m = byId("3m", "weekly");
    assert.equal(text.findingFor(m.overdue), "Overdue is $8.9k above the $40k limit");
    assert.equal(text.findingFor(m.failed), "Failed payments are $830 below the $2.5k limit");
    assert.equal(text.findingFor(m.collected), "Collected in November is $13.6k below the $300k goal");
  });

  test("at the reference, and with no points", () => {
    const mrr = byId("3m", "weekly").mrr;
    assert.equal(text.findingFor({ ...mrr, series: { current: [420000], previous: [] } }), "MRR is at the $420k target");
    assert.equal(text.findingFor({ ...mrr, series: { current: [], previous: [] } }), "MRR");
  });
});

describe("DashboardPattern KPI arrows", () => {
  test("from the delta's sign: MRR, Collected and Overdue up; Failed payments (2 fewer) down from its line", () => {
    const m = byId("3m", "weekly");
    assert.equal(text.trendFor(m.mrr), "up");
    assert.equal(text.trendFor(m.collected), "up");
    assert.equal(text.trendFor(m.overdue), "up");
    assert.equal(text.trendFor(m.failed), "down");
  });

  test("a minus sign is down; an unsigned delta on a flat line is flat", () => {
    const mrr = byId("3m", "weekly").mrr;
    assert.equal(text.trendFor({ ...mrr, delta: "−2.1%" }), "down");
    assert.equal(text.trendFor({ ...mrr, delta: "-2.1%" }), "down");
    assert.equal(text.trendFor({ ...mrr, delta: "same", series: { current: [5, 5], previous: [] } }), "flat");
  });
});
