/**
 * `review <path>` and the `review_ui` MCP tool: a good and a bad screen per rule
 * (test/fixtures/review/<rule>/), the JSON shape, exit codes, --help, and a review of fresh
 * `init --template dashboard` and `init --template settings` apps (zero findings). No network.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SCORE_FORMULA, contractFit, reviewCode, reviewPath } from "../bin/review.mjs";
import { loadKit } from "../bin/review/kit.mjs";
import { COUNTED_NATIVE_TAGS, rebuildCandidates, shareMatch } from "../bin/review/rules.mjs";

const kitRoot = fileURLToPath(new URL("..", import.meta.url));
const cli = join(kitRoot, "bin/agentic-ds-kit.mjs");
const fixtures = join(kitRoot, "test/fixtures/review");
const tmp = mkdtempSync(join(tmpdir(), "kit-review-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

const run = (args, cwd = kitRoot) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", cwd, timeout: 20000 });
const review = (rel) => reviewPath(join(fixtures, rel), { cwd: fixtures });
const rules = (result) => result.findings.map((f) => f.rule);

const FIELDS = ["id", "rule", "severity", "file", "line", "contractId", "message", "fix"];

describe("review rules", () => {
  test("raw-value: the good screens are clean", () => {
    for (const file of ["raw-value/good.tsx", "raw-value/good.module.css"]) {
      assert.deepEqual(review(file).findings, [], file);
    }
  });

  test("raw-value: hardcoded colour, spacing, radius, shadow and ramps, with the closest token", () => {
    const css = review("raw-value/bad.module.css");
    assert.deepEqual(
      css.findings.map((f) => [f.line, f.message.split(" in ")[0]]),
      [
        [2, "Hardcoded colour #0f172a"],
        [3, "Hardcoded spacing 12px"],
        [4, "Hardcoded radius 6px"],
        [5, "Hardcoded shadow"],
        [6, "Primitive colour ramp var(--color-neutral-200)"],
      ],
    );
    assert.equal(css.findings[0].fix, "Use var(--text-fg). It is the closest semantic colour.");
    assert.equal(css.findings[1].fix, "Use var(--space-inset-md).");
    assert.equal(css.findings[2].fix, "Use var(--radius-md).");
    assert.equal(css.findings[3].fix, "Use var(--shadow-md).");
    assert.match(css.findings[4].fix, /^Use var\(--bg-[\w-]+\)\.$/);
    for (const f of css.findings) {
      assert.equal(f.severity, "error");
      assert.equal(f.contractId, "tokens");
    }

    const tsx = review("raw-value/bad.tsx");
    assert.equal(tsx.errors, 6);
    const messages = tsx.findings.map((f) => f.message).join("\n");
    assert.match(messages, /colour #ffffff in background/);
    assert.match(messages, /spacing 12px in padding/);
    assert.match(messages, /radius 6 in border-radius/);
    assert.match(messages, /ramp var\(--color-blue-500\) in color/);
    assert.match(messages, /colour #f3f4f6 in background-color/);
    assert.ok(tsx.findings.some((f) => f.fix === "Use p-[var(--space-inset-md)]."), "Tailwind fix keeps the class form");
  });

  test("wrong-use: Button with href, two solid primary Buttons, icon-only without a label", () => {
    assert.deepEqual(review("wrong-use/good.tsx").findings, []);
    const bad = review("wrong-use/bad.tsx");
    assert.deepEqual(
      bad.findings.map((f) => [f.line, f.rule, f.contractId]),
      [
        [6, "wrong-use", "button"],
        [7, "wrong-use", "button"],
        [8, "wrong-use", "button"],
        [9, "wrong-use", "button"],
      ],
    );
    assert.match(bad.findings[0].message, /Button with href navigates/);
    assert.match(bad.findings[0].fix, /<Link href/);
    assert.match(bad.findings[1].message, /More than one solid primary Button in this file \(3\)/);
    assert.match(bad.findings[3].message, /Icon-only Button without an aria label/);
  });

  test("outside-kit: other UI libraries and local copies", () => {
    assert.deepEqual(review("outside-kit/good.tsx").findings, []);
    const bad = review("outside-kit/bad.tsx");
    assert.deepEqual(rules(bad), ["outside-kit", "outside-kit", "outside-kit"]);
    assert.match(bad.findings[0].message, /@radix-ui\/react-dialog/);
    assert.equal(bad.findings[1].contractId, "button");
    assert.equal(bad.findings[1].fix, 'import { Button } from "agentic-ds-kit";');
    assert.match(bad.findings[2].message, /@mui\/material/);
  });

  test("rebuild: names the block the file builds by hand", () => {
    assert.deepEqual(review("rebuild/good.tsx").findings, []);
    const bad = review("rebuild/bad.tsx");
    assert.equal(bad.findings.length, 1);
    const [f] = bad.findings;
    assert.equal(f.rule, "rebuild");
    assert.equal(f.severity, "warning");
    assert.equal(f.contractId, "agentoverview");
    assert.equal(f.message, "This file rebuilds AgentOverview by hand. Use AgentOverview (block).");
    assert.equal(bad.errors, 0);
    assert.equal(bad.warnings, 1);
  });

  test("pattern-fits: best pattern only, with the add command; small patterns need every part", () => {
    assert.deepEqual(review("pattern-fits/good.tsx").findings, []);
    const bad = review("pattern-fits/bad.tsx");
    assert.deepEqual(rules(bad), ["pattern-fits"]);
    assert.equal(bad.findings[0].contractId, "dashboard");
    assert.equal(bad.findings[0].fix, "npx agentic-ds-kit add dashboard");
    const signIn = review("pattern-fits/sign-in-bad.tsx");
    assert.deepEqual(rules(signIn), ["pattern-fits"]);
    assert.equal(signIn.findings[0].fix, "npx agentic-ds-kit add sign-in");
  });

  test("thresholds: two distinctive parts, two thirds of them and of the whole list", () => {
    const kit = loadKit();
    const overview = kit.byId.get("agentoverview").contains;
    const used = (ids) => new Set(ids);
    assert.ok(shareMatch(kit, overview, used(["agentlanes", "agentinbox", "barchart", "scoreboard", "segmentedcontrol"])));
    assert.equal(shareMatch(kit, overview, used(["agentlanes", "agentinbox", "barchart", "scoreboard"])), null, "4 of 7 is under two thirds");
    assert.equal(shareMatch(kit, overview, used(["agentlanes", "empty", "segmentedcontrol", "scorecard"])), null);
    const signIn = kit.patterns.find((p) => p.id === "sign-in").contains;
    assert.equal(shareMatch(kit, signIn, used(signIn.slice(1)), { allowSmall: true }), null);
    assert.ok(shareMatch(kit, signIn, used(signIn), { allowSmall: true }));
    for (const candidate of rebuildCandidates(kit)) {
      assert.ok(candidate.contains.filter((id) => !kit.common.has(id)).length >= 2, candidate.id);
    }
  });

  test("dynamic values are unknown, not findings", () => {
    const code = [
      'import { Button } from "agentic-ds-kit";',
      "export function X(p: { a: string; m: string; s: object }) {",
      "  return (<div style={p.s}><Button appearance={p.a}>A</Button><Button mode={p.m}>B</Button><Button {...p}>C</Button></div>);",
      "}",
    ].join("\n");
    assert.deepEqual(reviewCode(code, "x.tsx").findings, []);
  });

  test("JSX inside a string (a code sample) is not read as JSX", () => {
    const code = [
      'import { Button } from "agentic-ds-kit";',
      "const SAMPLE = '<Button>Save</Button>';",
      'const MORE = `<Button href="/x">Go</Button>`;',
      "export function X() {",
      "  return <Button>Save</Button>;",
      "}",
    ].join("\n");
    assert.deepEqual(reviewCode(code, "x.tsx").findings, []);
  });
});

describe("review JSON, text and exit codes", () => {
  test("--json prints findings with every field and the counts; exit 1 on errors", () => {
    const res = run(["review", join(fixtures, "wrong-use/bad.tsx"), "--json"]);
    assert.equal(res.status, 1, res.stderr);
    const out = JSON.parse(res.stdout);
    assert.deepEqual(Object.keys(out).sort(), ["errors", "files", "findings", "kit", "warnings"]);
    assert.equal(out.files, 1);
    assert.equal(out.errors, 4);
    assert.equal(out.warnings, 0);
    for (const f of out.findings) {
      assert.deepEqual(Object.keys(f), FIELDS);
      assert.equal(f.file, "test/fixtures/review/wrong-use/bad.tsx");
      assert.equal(typeof f.line, "number");
    }
    assert.equal(new Set(out.findings.map((f) => f.id)).size, out.findings.length, "ids are unique");
  });

  test("warnings alone exit 0; clean files exit 0", () => {
    assert.equal(run(["review", join(fixtures, "rebuild/bad.tsx")]).status, 0);
    const clean = run(["review", join(fixtures, "rebuild/good.tsx")]);
    assert.equal(clean.status, 0);
    assert.match(clean.stdout, /No problems found in 1 file\./);
  });

  test("text output groups by file with a Fix line and a total", () => {
    const res = run(["review", "raw-value"], fixtures);
    assert.equal(res.status, 1);
    assert.match(res.stdout, /^raw-value\/bad\.module\.css$/m);
    assert.match(res.stdout, /^\s+2\s+error\s+raw-value\s+Hardcoded colour #0f172a in color\.$/m);
    assert.match(res.stdout, /Fix: Use var\(--text-fg\)/);
    assert.match(res.stdout, /11 errors, 0 warnings in 4 files\./);
  });

  test("folders skip node_modules, dist, .next and token sources", () => {
    const result = reviewPath(kitRoot, { cwd: kitRoot });
    const files = new Set(result.findings.map((f) => f.file));
    assert.ok(![...files].some((f) => /(^|\/)(node_modules|dist|\.next)\//.test(f) || /tokens\.(css|ts)$/.test(f)));
  });

  test("--help, and usage problems exit 2", () => {
    const help = run(["review", "--help"]);
    assert.equal(help.status, 0);
    for (const rule of ["raw-value", "wrong-use", "outside-kit", "rebuild", "pattern-fits", "--json"]) {
      assert.ok(help.stdout.includes(rule), rule);
    }
    assert.match(run(["--help"]).stdout, /review\s+Check UI files/);
    const missing = run(["review", "no/such/path"]);
    assert.equal(missing.status, 2);
    assert.match(missing.stderr, /does not exist/);
    assert.equal(run(["review"]).status, 2);
    assert.equal(run(["review", "--nope", "x"]).status, 2);
  });
});

describe("review of new apps from init --template", () => {
  for (const template of ["dashboard", "settings"]) {
    test(`init --template ${template} reviews clean`, () => {
      const made = run(["init", `app-${template}`, "--template", template], tmp);
      assert.equal(made.status, 0, made.stderr);
      const result = reviewPath(join(tmp, `app-${template}`));
      assert.deepEqual(result.findings, []);
      assert.ok(result.files > 3);
    });
  }
});

describe("review_ui MCP tool", () => {
  let client;
  before(async () => {
    client = new Client({ name: "review-test", version: "0.0.0" });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [cli, "mcp"], cwd: kitRoot, stderr: "pipe" }));
  });
  after(async () => {
    await client?.close();
  });

  const text = (result) => result.content.find((c) => c.type === "text").text;

  test("is read-only and listed", async () => {
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "review_ui");
    assert.ok(tool);
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.deepEqual(Object.keys(tool.inputSchema.properties).sort(), ["code", "filename", "path"]);
  });

  test("path gives the same findings as the CLI", async () => {
    const result = await client.callTool({ name: "review_ui", arguments: { path: "test/fixtures/review/outside-kit/bad.tsx" } });
    assert.notEqual(result.isError, true, text(result));
    const out = JSON.parse(text(result));
    const cliOut = JSON.parse(run(["review", "test/fixtures/review/outside-kit/bad.tsx", "--json", "--score"]).stdout);
    assert.deepEqual(out, cliOut);
    assert.equal(typeof out.score.value, "number");
  });

  test("code plus filename reviews a draft that is not saved", async () => {
    const code = readFileSync(join(fixtures, "wrong-use/bad.tsx"), "utf8");
    const result = await client.callTool({ name: "review_ui", arguments: { code, filename: "app/draft/page.tsx" } });
    const out = JSON.parse(text(result));
    assert.equal(out.errors, 4);
    assert.equal(out.findings[0].file, "app/draft/page.tsx");
    assert.equal(out.findings[0].id, "wrong-use:app/draft/page.tsx:6");
    assert.equal(out.score.errors, 4);
    assert.equal(out.score.formula, SCORE_FORMULA);
  });

  test("missing or mixed arguments are tool errors", async () => {
    for (const args of [{}, { code: "x" }, { filename: "a.tsx" }, { path: "a", code: "b", filename: "c.tsx" }, { path: "no/such/file.tsx" }]) {
      const result = await client.callTool({ name: "review_ui", arguments: args });
      assert.equal(result.isError, true, JSON.stringify(args));
    }
  });
});

describe("contract fit score", () => {
  const SCORE_FIELDS = ["value", "kitElements", "otherElements", "errors", "warnings", "formula"];
  const score = (code, filename = "x.tsx") => reviewCode(code, filename, { score: true }).score;

  test("the formula: share x 100, minus 5 per error and 2 per warning, kept in 0-100", () => {
    assert.equal(contractFit({ kitElements: 18, otherElements: 2, errors: 1, warnings: 0 }).value, 85);
    assert.equal(contractFit({ kitElements: 1, otherElements: 2, errors: 0, warnings: 1 }).value, 31);
    assert.equal(contractFit({ kitElements: 1, otherElements: 1, errors: 20, warnings: 0 }).value, 0);
    assert.equal(contractFit({ kitElements: 0, otherElements: 0, errors: 0, warnings: 0 }).value, 100);
    assert.deepEqual(Object.keys(contractFit({ kitElements: 0, otherElements: 0, errors: 0, warnings: 0 })), SCORE_FIELDS);
  });

  test("counts kit tags by root name and only the listed native tags", () => {
    assert.deepEqual(COUNTED_NATIVE_TAGS, ["button", "a", "input", "select", "textarea", "img", "table", "dialog"]);
    const code = [
      'import { Button, Card } from "agentic-ds-kit";',
      'import { Plus } from "lucide-react";',
      'import Image from "next/image";',
      'import { Local } from "./local";',
      "export function X() {",
      "  return (",
      "    <main><div><h1>T</h1><p>x</p><ul><li>a</li></ul><span /></div>",
      '      <>Hi</><Card><Card.Header>H</Card.Header></Card><Button><Plus /></Button>',
      '      <a href="/x">x</a><button type="button">b</button><input /><img alt="" src="/a.png" />',
      '      <Image alt="" src="/a.png" /><Local /></main>',
      "  );",
      "}",
    ].join("\n");
    const s = score(code);
    assert.equal(s.kitElements, 3, "Card, Card.Header, Button");
    assert.equal(s.otherElements, 4, "a, button, input, img");
  });

  test("zero countable elements: share is 1, then penalties", () => {
    assert.equal(score(".a { color: var(--text-fg); }", "a.module.css").value, 100, "a clean CSS-only file scores 100");
    const css = score(".a { color: #0f172a; padding: 12px; }", "a.module.css");
    assert.equal(css.kitElements + css.otherElements, 0);
    assert.equal(css.errors, 2);
    assert.equal(css.value, 90);
    assert.equal(score("export const x = 1;", "x.ts").value, 100);
    const fixture = reviewPath(join(fixtures, "raw-value/bad.module.css"), { cwd: fixtures, score: true }).score;
    assert.equal(fixture.value, 75, "5 errors, no elements");
  });

  test("JSON without --score keeps its shape; with --score adds score", () => {
    const file = join(fixtures, "wrong-use/bad.tsx");
    const plain = run(["review", file, "--json"]);
    assert.equal(plain.status, 1);
    assert.deepEqual(Object.keys(JSON.parse(plain.stdout)).sort(), ["errors", "files", "findings", "kit", "warnings"]);
    const scored = run(["review", file, "--json", "--score"]);
    assert.equal(scored.status, 1, "errors still exit 1");
    const out = JSON.parse(scored.stdout);
    assert.deepEqual(Object.keys(out).sort(), ["errors", "files", "findings", "kit", "score", "warnings"]);
    assert.deepEqual(Object.keys(out.score), SCORE_FIELDS);
    assert.equal(out.score.errors, out.errors);
    assert.equal(out.score.formula, SCORE_FORMULA);
    assert.equal(out.score.kitElements, 4);
  });

  test("text output prints the score and the formula", () => {
    const res = run(["review", join(fixtures, "rebuild/good.tsx"), "--score"]);
    assert.equal(res.status, 0);
    assert.match(res.stdout, /No problems found in 1 file\./);
    assert.match(res.stdout, /Contract fit: 100\/100/);
    assert.match(res.stdout, /value = max\(0, min\(100, round\(100 \* share - 5 \* errors - 2 \* warnings\)\)\)/);
    assert.doesNotMatch(run(["review", join(fixtures, "rebuild/good.tsx")]).stdout, /Contract fit/);
  });

  test("--min exit codes", () => {
    const clean = join(fixtures, "rebuild/good.tsx");
    const warned = join(fixtures, "rebuild/bad.tsx");
    assert.equal(run(["review", clean, "--min", "100"]).status, 0);
    assert.match(run(["review", clean, "--min", "100"]).stdout, /Contract fit: 100/, "--min turns on --score");
    const low = run(["review", warned, "--min", "100"]);
    assert.equal(low.status, 1, "a warning alone takes it under 100");
    assert.match(low.stdout, /is below --min 100/);
    assert.equal(run(["review", warned, "--min", "50"]).status, 0, "warnings alone still exit 0 when the score is high enough");
    assert.equal(run(["review", warned, "--json", "--min", "100"]).status, 1);
    for (const bad of ["abc", "-1", "101", ""]) {
      const res = run(["review", clean, "--min", bad]);
      assert.equal(res.status, 2, bad);
      if (bad !== "-1") assert.match(res.stderr, /--min needs a number from 0 to 100/);
    }
    assert.equal(run(["review", clean, "--min"]).status, 2);
  });

  test("--help names --score and --min", () => {
    const help = run(["review", "--help"]).stdout;
    for (const word of ["--score", "--min", "Contract fit", "button, a, input, select, textarea, img, table, dialog"]) {
      assert.ok(help.includes(word), word);
    }
  });
});

describe("contract fit workflow template", () => {
  const yml = readFileSync(join(kitRoot, "templates/github/contract-fit.yml"), "utf8");

  test("runs on pull_request only, never pull_request_target", () => {
    assert.match(yml, /^on:\n {2}pull_request:\n/m);
    assert.ok(!yml.includes("pull_request_target"));
  });

  test("posts one comment by marker, with only the allowed actions and permissions", () => {
    assert.ok(yml.includes("<!-- agentic-ds-kit-contract-fit -->"));
    assert.match(yml, /permissions:\n {2}contents: read\n {2}pull-requests: write\n/);
    const actions = [...yml.matchAll(/uses:\s*([\w-]+\/[\w-]+)@/g)].map((m) => m[1]).sort();
    assert.deepEqual([...new Set(actions)], ["actions/checkout", "actions/github-script", "actions/setup-node"]);
    assert.ok(!/secrets\./.test(yml), "no secrets");
    assert.match(yml, /agentic-ds-kit review "\$REVIEW_PATH" --json --score/);
    assert.ok(!yml.includes("0.23.0"), "does not pin 0.23.0");
  });
});
