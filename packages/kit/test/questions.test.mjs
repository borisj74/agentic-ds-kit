import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { MAX_OPTIONS, buildQuestions } from "../bin/questions.mjs";

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bin = join(kitRoot, "bin/agentic-ds-kit.mjs");
const index = JSON.parse(readFileSync(join(kitRoot, "contracts/index.json"), "utf8"));
const componentIds = index.filter((e) => e.group === "component").map((e) => e.id);
const patternIds = index.filter((e) => e.group === "pattern").map((e) => e.id);
const { version } = JSON.parse(readFileSync(join(kitRoot, "package.json"), "utf8"));

const tmp = mkdtempSync(join(tmpdir(), "kit-questions-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

function run(...args) {
  return spawnSync(process.execPath, [bin, "questions", ...args], { cwd: tmp, encoding: "utf8" });
}

function overlayFile(name, overlay) {
  const file = join(tmp, name);
  writeFileSync(file, typeof overlay === "string" ? overlay : JSON.stringify(overlay));
  return file;
}

const composite = {
  composites: [
    {
      label: "Table card",
      contracts: ["card", "datatable"],
      sentence: "Rows of records in a flush Card.",
      base: "datatable",
    },
  ],
  options: {
    barchart: { label: "Bar chart", sentence: "Shown as monthly totals." },
  },
  drop: ["spinner"],
};

describe("questions: schema", () => {
  test("top-level shape and versions", () => {
    const set = buildQuestions();
    assert.deepEqual(Object.keys(set), ["schema", "kit", "options", "enums"]);
    assert.equal(set.schema, 1);
    assert.equal(set.kit, version);
  });

  test("every option has the documented fields", () => {
    for (const o of buildQuestions().options) {
      assert.deepEqual(Object.keys(o), ["id", "label", "description", "contracts", "kind", "ask"]);
      assert.ok(o.label && o.description, o.id);
      assert.match(o.ask, /^Would .+ show part of what the request asks to see\?$/);
      assert.ok(["component", "pattern"].includes(o.kind));
      assert.ok(o.contracts.length >= 1);
    }
  });

  test("75 component options and 10 pattern options by default", () => {
    const { options } = buildQuestions();
    assert.equal(componentIds.length, 75);
    assert.deepEqual(options.filter((o) => o.kind === "component").map((o) => o.id).sort(), [...componentIds].sort());
    assert.deepEqual(options.filter((o) => o.kind === "pattern").map((o) => o.id).sort(), [...patternIds].sort());
  });

  test("labels are code names; descriptions use intent, useWhen, doNotUseWhen", () => {
    const { options } = buildQuestions();
    const bar = options.find((o) => o.id === "barchart");
    assert.equal(bar.label, "BarChart");
    assert.equal(
      bar.description,
      "Compare magnitudes across categories with vertical or horizontal bars. Use when: Ranking values at a glance; Grouped comparisons with categories plus series. Not for: Part-to-whole share — use PieChart; Change over time — use LineChart.",
    );
    assert.deepEqual(bar.contracts, ["barchart"]);
    assert.equal(options.find((o) => o.id === "input").label, "Input");
    const dash = options.find((o) => o.id === "dashboard");
    assert.equal(dash.label, "DashboardPattern");
    assert.equal(dash.contracts[0], "dashboard");
    assert.ok(dash.contracts.includes("scoreboard"));
  });

  test("--use-when / --not-when counts", () => {
    const zero = buildQuestions({ only: ["barchart"], useWhen: 0, notWhen: 0 }).options[0];
    assert.equal(zero.description, "Compare magnitudes across categories with vertical or horizontal bars.");
    const one = buildQuestions({ only: ["barchart", "piechart"], useWhen: 1, notWhen: 1 }).options[0];
    assert.match(one.description, /Use when: Ranking values at a glance\. Not for: Part-to-whole share — use PieChart\.$/);
  });

  test("Not for lines that point only outside the option set are skipped", () => {
    const alone = buildQuestions({ only: ["barchart"] }).options[0];
    assert.equal(
      alone.description,
      "Compare magnitudes across categories with vertical or horizontal bars. Use when: Ranking values at a glance; Grouped comparisons with categories plus series.",
    );
    const withPie = buildQuestions({ only: ["barchart", "piechart"] }).options.find((o) => o.id === "barchart");
    assert.match(withPie.description, /Not for: Part-to-whole share — use PieChart\.$/);
    // A composite's contracts count as part of the set.
    const overlay = { composites: [{ label: "Trend", contracts: ["linechart"], sentence: "x" }] };
    const withLine = buildQuestions({ only: ["barchart"], overlay }).options.find((o) => o.id === "barchart");
    assert.match(withLine.description, /Not for: Change over time — use LineChart\.$/);
  });

  test("--ask-style strict and part", () => {
    const strict = buildQuestions({ only: ["barchart"], askStyle: "strict" }).options[0];
    assert.equal(strict.ask, "Does the request need BarChart (compare magnitudes across categories with vertical or horizontal bars)?");
    const part = buildQuestions({ only: ["barchart"] }).options[0];
    assert.equal(part.ask, "Would BarChart (compare magnitudes across categories with vertical or horizontal bars) show part of what the request asks to see?");
    const none = buildQuestions({ only: ["card"], none: true, askStyle: "strict" }).options.at(-1);
    assert.equal(none.ask, "Does the request need something none of the other options covers?");
  });

  test("enums list every enum prop of the rendered contracts", () => {
    const { enums } = buildQuestions();
    assert.deepEqual(enums.find((e) => e.component === "barchart" && e.prop === "orientation"), {
      component: "barchart",
      prop: "orientation",
      values: ["vertical", "horizontal"],
      default: "vertical",
    });
    let expected = 0;
    for (const e of index.filter((x) => x.group !== "foundation")) {
      const c = JSON.parse(readFileSync(join(kitRoot, e.path), "utf8"));
      expected += Object.values(c.props ?? {}).filter((p) => Array.isArray(p.values)).length;
    }
    assert.equal(enums.length, expected);
    const narrow = buildQuestions({ only: ["card"] }).enums;
    assert.ok(narrow.length && narrow.every((e) => e.component === "card"));
  });

  test("--enums own (default), all, none", () => {
    const overlay = { composites: [{ label: "Table card", contracts: ["card", "datatable"], sentence: "x", base: "datatable" }] };
    const own = buildQuestions({ only: ["barchart", "dashboard"], overlay }).enums;
    // Own contracts only: barchart, the composite's base (datatable); not card, not the dashboard's parts.
    assert.deepEqual([...new Set(own.map((e) => e.component))], ["barchart", "datatable"]);
    const all = buildQuestions({ only: ["barchart", "dashboard"], overlay, enums: "all" }).enums;
    assert.ok(all.some((e) => e.component === "card"));
    assert.ok(all.length > own.length);
    assert.deepEqual(buildQuestions({ only: ["barchart"], enums: "none" }).enums, []);
    const noBase = { composites: [{ label: "Form", contracts: ["button", "select"], sentence: "x" }] };
    assert.deepEqual(buildQuestions({ only: ["card"], overlay: noBase }).enums.filter((e) => e.component !== "card"), []);
  });

  test("--group and --only filter", () => {
    assert.ok(buildQuestions({ group: "pattern" }).options.every((o) => o.kind === "pattern"));
    assert.equal(buildQuestions({ group: "component" }).options.length, 75);
    assert.deepEqual(buildQuestions({ only: ["tabs", "card"] }).options.map((o) => o.id), ["card", "tabs"]);
  });

  test("--none adds a last option of kind none", () => {
    const { options } = buildQuestions({ none: true });
    const last = options.at(-1);
    assert.equal(last.kind, "none");
    assert.equal(last.label, "None of these");
    assert.deepEqual(last.contracts, []);
  });

  test("no vendor names in the output", () => {
    const json = JSON.stringify(buildQuestions({ none: true }));
    assert.doesNotMatch(json, /jev|typesafe|openai|anthropic|claude/i);
  });
});

describe("questions: determinism", () => {
  test("options sorted by label", () => {
    const labels = buildQuestions().options.map((o) => o.label.toLowerCase());
    assert.deepEqual(labels, [...labels].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
  });

  test("same input gives byte-identical CLI output", () => {
    const overlay = overlayFile("det.json", composite);
    const a = run("--overlay", overlay, "--none");
    const b = run("--overlay", overlay, "--none");
    assert.equal(a.status, 0, a.stderr);
    assert.equal(a.stdout, b.stdout);
    assert.ok(a.stdout.endsWith("}\n"));
    assert.deepEqual(JSON.parse(a.stdout), buildQuestions({ overlay: composite, none: true }));
  });

  test("--pretty indents, --out writes a file", () => {
    const pretty = run("--only", "card", "--pretty");
    assert.match(pretty.stdout, /^\{\n {2}"schema": 1,/);
    const out = run("--only", "card", "--out", "q.json");
    assert.equal(out.status, 0, out.stderr);
    assert.equal(out.stdout, "");
    assert.deepEqual(JSON.parse(readFileSync(join(tmp, "q.json"), "utf8")), buildQuestions({ only: ["card"] }));
  });
});

describe("questions: --out", () => {
  test("creates missing parent folders", () => {
    const r = run("--only", "card", "--out", "new/deep/q.json");
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(readFileSync(join(tmp, "new/deep/q.json"), "utf8")), buildQuestions({ only: ["card"] }));
  });

  test("a write error is one line, exit 1, no stack trace", () => {
    writeFileSync(join(tmp, "afile"), "x");
    const notDir = run("--only", "card", "--out", "afile/q.json");
    assert.equal(notDir.status, 1);
    assert.equal(notDir.stderr.trim().split("\n").length, 1, notDir.stderr);
    assert.match(notDir.stderr, /^agentic-ds-kit: could not write afile\/q\.json: a file is in the way .+ \(E[A-Z]+\)\.$/m);
    mkdirSync(join(tmp, "locked"));
    chmodSync(join(tmp, "locked"), 0o500);
    try {
      const denied = run("--only", "card", "--out", "locked/q.json");
      if (process.getuid?.() !== 0) {
        assert.equal(denied.status, 1);
        assert.equal(denied.stderr.trim().split("\n").length, 1, denied.stderr);
      }
    } finally {
      chmodSync(join(tmp, "locked"), 0o700);
    }
  });
});

describe("questions: overlay", () => {
  test("composites, renames, extra sentences and drops merge", () => {
    const { options } = buildQuestions({ overlay: composite });
    const card = options.find((o) => o.id === "table-card");
    assert.equal(card.kind, "composite");
    assert.deepEqual(card.contracts, ["card", "datatable"]);
    assert.match(card.description, /Rows of records in a flush Card\. Use when:/);
    assert.equal(card.ask, "Would Table card (rows of records in a flush Card) show part of what the request asks to see?");
    const bar = options.find((o) => o.id === "barchart");
    assert.equal(bar.label, "Bar chart");
    assert.match(bar.description, /horizontal bars\. Shown as monthly totals\. Use when:/);
    assert.equal(bar.ask, "Would Bar chart (shown as monthly totals) show part of what the request asks to see?");
    assert.ok(!options.some((o) => o.id === "spinner"));
    assert.equal(options.length, 85);
  });

  test("only allowlist keeps composites; --only wins over it", () => {
    const overlay = { ...composite, only: ["barchart", "linechart", "spinner"] };
    assert.deepEqual(buildQuestions({ overlay }).options.map((o) => o.id), ["barchart", "linechart", "table-card"]);
    assert.deepEqual(buildQuestions({ overlay, only: ["tabs"] }).options.map((o) => o.id), ["table-card", "tabs"]);
    const r = run("--overlay", overlayFile("only.json", overlay), "--only", "card");
    assert.deepEqual(JSON.parse(r.stdout).options.map((o) => o.id), ["card", "table-card"]);
  });

  test("description replaces the generated text; sentence appends after it", () => {
    const overlay = {
      options: {
        scoreboard: { label: "Studio KPIs", description: "This week's headline studio numbers side by side" },
        barchart: { description: "Fill rate by class type", sentence: "In Tempo it covers the last 4 weeks" },
      },
    };
    const { options } = buildQuestions({ overlay, only: ["scoreboard", "barchart"] });
    const kpis = options.find((o) => o.id === "scoreboard");
    assert.equal(kpis.description, "This week's headline studio numbers side by side.");
    assert.equal(kpis.ask, "Would Studio KPIs (this week's headline studio numbers side by side) show part of what the request asks to see?");
    const bar = options.find((o) => o.id === "barchart");
    assert.equal(bar.description, "Fill rate by class type. In Tempo it covers the last 4 weeks.");
    assert.equal(bar.ask, "Would BarChart (in Tempo it covers the last 4 weeks) show part of what the request asks to see?");
  });

  test("composite without base uses its sentence", () => {
    const overlay = { composites: [{ id: "record", label: "Record", contracts: ["card", "table"], sentence: "One record on its own" }] };
    const record = buildQuestions({ overlay }).options.find((o) => o.id === "record");
    assert.equal(record.description, "One record on its own.");
  });
});

describe("questions: errors exit non-zero", () => {
  const cases = [
    ["unknown contract id", { composites: [{ label: "X", contracts: ["nope"], sentence: "x" }] }, /unknown contract id "nope"/],
    ["unknown option id", { options: { nope: { label: "X" } } }, /unknown contract id "nope"/],
    ["unknown drop id", { drop: ["nope"] }, /unknown contract id "nope"/],
    ["duplicate label", { options: { card: { label: "Tabs" } } }, /duplicate label "Tabs"/],
    ["duplicate composite label", { composites: [{ label: "card", contracts: ["card"], sentence: "x" }] }, /duplicate label/],
    ["bad shape: not an object", [], /overlay must be a JSON object/],
    ["bad shape: unknown key", { rename: {} }, /unknown key "rename"/],
    ["bad shape: composite missing sentence", { composites: [{ label: "X", contracts: ["card"] }] }, /sentence must be a non-empty string/],
    ["bad shape: composites not array", { composites: {} }, /composites must be an array/],
    ["unknown only id", { only: ["card", "nope"] }, /overlay\.only: unknown contract id "nope"/],
    ["bad shape: only not array", { only: "card" }, /only must be a non-empty array/],
    ["bad shape: empty description", { options: { card: { description: " " } } }, /card\.description must be a non-empty string/],
  ];
  for (const [name, overlay, message] of cases) {
    test(name, () => {
      const r = run("--overlay", overlayFile(`${name.replace(/\W+/g, "-")}.json`, overlay));
      assert.equal(r.status, 1);
      assert.equal(r.stdout, "");
      assert.match(r.stderr, message);
    });
  }

  test("more than 255 options", () => {
    const composites = Array.from({ length: MAX_OPTIONS - 85 + 1 }, (_, i) => ({
      label: `Composite ${String(i).padStart(3, "0")}`,
      contracts: ["card"],
      sentence: "x",
    }));
    const r = run("--overlay", overlayFile("many.json", { composites }));
    assert.equal(r.status, 1);
    assert.match(r.stderr, /256 options is more than 255/);
    composites.pop();
    assert.equal(run("--overlay", overlayFile("max.json", { composites })).status, 0);
  });

  test("invalid JSON overlay, missing file, bad flags", () => {
    assert.match(run("--overlay", overlayFile("bad.json", "{ nope")).stderr, /could not read overlay/);
    assert.match(run("--overlay", "missing.json").stderr, /could not read overlay/);
    const group = run("--group", "foundation");
    assert.equal(group.status, 1);
    assert.match(group.stderr, /--group must be component or pattern/);
    assert.match(run("--only", "card,nope").stderr, /--only: unknown contract id "nope"/);
    assert.match(run("--use-when", "x").stderr, /--use-when must be a whole number/);
    assert.match(run("--ask-style", "loose").stderr, /--ask-style must be part or strict/);
    assert.match(run("--enums", "some").stderr, /--enums must be own, all or none/);
    assert.equal(run("--bogus").status, 1);
  });

  test("--help exits 0; add help lists questions", () => {
    const help = run("--help");
    assert.equal(help.status, 0);
    assert.match(help.stdout, /Usage: npx agentic-ds-kit questions/);
    const top = spawnSync(process.execPath, [bin, "--help"], { encoding: "utf8" });
    assert.match(top.stdout, /questions {6}Build a closed option list/);
  });
});
