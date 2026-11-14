import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { after, before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { COMPONENT_LEVELS } from "../bin/levels.mjs";
import { buildQuestions } from "../bin/questions.mjs";

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bin = join(kitRoot, "bin/agentic-ds-kit.mjs");
const index = JSON.parse(readFileSync(join(kitRoot, "contracts/index.json"), "utf8"));
const button = JSON.parse(readFileSync(join(kitRoot, "contracts/button.json"), "utf8"));
const dashboard = JSON.parse(readFileSync(join(kitRoot, "contracts/patterns/dashboard.json"), "utf8"));
const tokens = JSON.parse(readFileSync(join(kitRoot, "tokens/tokens.json"), "utf8"));
const usage = JSON.parse(readFileSync(join(kitRoot, "tokens/usage.json"), "utf8"));
const resolvePrimitive = (ref) =>
  typeof ref === "string" && ref.startsWith("primitive.")
    ? ref.slice("primitive.".length).split(".").reduce((node, key) => node?.[key], tokens.primitive)
    : ref;
const agents = readFileSync(join(kitRoot, "AGENTS.md"), "utf8");
const { version } = JSON.parse(readFileSync(join(kitRoot, "package.json"), "utf8"));
const componentIds = index.filter((entry) => entry.group === "component").map((entry) => entry.id);
const patternIds = index.filter((entry) => entry.group === "pattern").map((entry) => entry.id);

const TOOLS = [
  "get_component",
  "get_pattern",
  "get_rules",
  "get_tokens",
  "list_components",
  "list_patterns",
  "questions",
  "review_ui",
  "search_components",
];

let client;
let transport;

function textOf(result) {
  const block = result.content?.find((item) => item.type === "text");
  assert.equal(typeof block?.text, "string");
  return block.text;
}

async function call(name, args = {}) {
  const result = await client.callTool({ name, arguments: args });
  assert.notEqual(result.isError, true, textOf(result));
  return JSON.parse(textOf(result));
}

async function callError(name, args = {}) {
  const result = await client.callTool({ name, arguments: args });
  assert.equal(result.isError, true);
  return textOf(result);
}

function assertSummary(item) {
  assert.equal(typeof item.id, "string");
  assert.equal(typeof item.name, "string");
  assert.ok(item.name.length > 0);
  assert.equal(item.category, "component");
  assert.ok(COMPONENT_LEVELS.includes(item.level), `${item.id} level ${item.level}`);
  assert.equal(typeof item.purpose, "string");
  assert.equal(item.purpose.includes("\n"), false);
  assert.ok(item.purpose.length > 0);
}

function assertToken(token) {
  assert.equal(typeof token.name, "string");
  assert.match(token.name, /^--/);
  assert.equal(typeof token.group, "string");
  assert.equal(typeof token.value, "string");
  assert.equal(typeof token.note, "string");
  assert.equal(typeof token.useWhen, "string");
  assert.equal(typeof token.doNot, "string");
  if (token.group === "color") {
    assert.ok(token.dark === null || typeof token.dark === "string");
  }
}

describe("mcp server", { timeout: 20_000 }, () => {
  before(async () => {
    transport = new StdioClientTransport({
      command: process.execPath,
      args: [bin, "mcp"],
      stderr: "pipe",
    });
    transport.stderr?.resume();
    client = new Client({ name: "agentic-ds-kit-mcp-test", version: "0.0.0" });
    await client.connect(transport);
  });

  after(async () => {
    await client?.close();
  });

  test("exposes the read-only tools", async () => {
    const listed = await client.listTools();
    assert.deepEqual(listed.tools.map((tool) => tool.name).sort(), TOOLS);
    for (const tool of listed.tools) {
      assert.equal(typeof tool.description, "string");
      assert.ok(tool.description.length > 20);
      assert.equal(tool.annotations?.readOnlyHint, true);
    }
  });

  test("list_components matches the installed contracts", async () => {
    const listed = await call("list_components", { detail: "full" });
    assert.equal(listed.kit, version);
    assert.equal(listed.components.length, componentIds.length);
    for (const item of listed.components) assertSummary(item);
    assert.deepEqual(
      listed.components.map((item) => item.id),
      componentIds,
    );
    const buttonRow = listed.components.find((item) => item.id === "button");
    assert.equal(buttonRow.name, "Button");
    assert.equal(buttonRow.purpose, button.intent);
  });

  test("get_component returns the contract, import, and example", async () => {
    const result = await call("get_component", { name: "Button" });
    const component = result.component;
    assert.equal(result.kit, version);
    assert.equal(component.id, "button");
    assert.equal(component.name, "Button");
    assert.equal(component.category, "component");
    assert.equal(component.level, button.level);
    assert.equal(component.level, "atom");
    assert.equal(component.purpose, button.intent);
    assert.deepEqual(component.props, button.props);
    assert.deepEqual(component.doNot, button.doNot);
    assert.deepEqual(component.must, button.must ?? []);
    assert.deepEqual(component.tokens, button.tokens);
    assert.equal(component.import, 'import { Button } from "agentic-ds-kit";');
    assert.equal(component.example, button.snippet);
    const appearance = component.variants.find((variant) => variant.prop === "appearance");
    assert.deepEqual(appearance.values, button.props.appearance.values);
    assert.equal(appearance.default, button.props.appearance.default);

    const byId = await call("get_component", { name: "button-group" });
    assert.equal(byId.component.id, "buttongroup");
  });

  test("get_component reports unknown names and patterns", async () => {
    const missing = await callError("get_component", { name: "NotAComponent" });
    assert.match(missing, /No component named "NotAComponent"/);
    const pattern = await callError("get_component", { name: "dashboard" });
    assert.match(pattern, /get_pattern/);
  });

  test("search_components matches name, purpose, and keywords", async () => {
    const byName = await call("search_components", { query: "button" });
    assert.ok(byName.components.some((item) => item.name === "Button"));
    for (const item of byName.components) assertSummary(item);

    const byPurpose = await call("search_components", { query: "KPI" });
    assert.ok(byPurpose.components.some((item) => item.id === "scorecard"));

    const byKeyword = await call("search_components", { query: "icon-only" });
    assert.ok(byKeyword.components.some((item) => item.id === "button"));

    const empty = await call("search_components", { query: "zzzz-not-a-component" });
    assert.deepEqual(empty.components, []);
  });

  test("get_tokens reads tokens.json and usage.json", async () => {
    const all = await call("get_tokens", { detail: "full" });
    assert.equal(all.kit, version);
    assert.equal(all.group, null);
    assert.deepEqual([...new Set(all.tokens.map((token) => token.group))].sort(), [
      "color",
      "grid",
      "radius",
      "space",
      "type",
    ]);
    for (const token of all.tokens) assertToken(token);
    assert.equal(all.tokens.some((token) => token.name.startsWith("--color-")), false);

    const color = await call("get_tokens", { group: "color", detail: "full" });
    assert.ok(color.tokens.every((token) => token.group === "color"));
    assert.ok(color.tokens.length < all.tokens.length);
    const canvas = color.tokens.find((token) => token.name === "--bg-canvas");
    assert.equal(canvas.value, resolvePrimitive(tokens.semantic.light.bg.canvas));
    assert.equal(canvas.dark, resolvePrimitive(tokens.semantic.dark.bg.canvas));
    assert.equal(canvas.note, usage.tokens["--bg-canvas"].note);
    assert.equal(canvas.useWhen, usage.tokens["--bg-canvas"].useWhen);
    assert.equal(canvas.doNot, usage.tokens["--bg-canvas"].doNot);

    const type = await call("get_tokens", { group: "type", detail: "full" });
    const ui = type.tokens.find((token) => token.name === "--type-size-ui-md");
    assert.equal(ui.value, tokens.semantic.type.ladder.uiMd.size);

    const space = await call("get_tokens", { group: "space", detail: "full" });
    assert.equal(space.tokens.find((token) => token.name === "--space-4").value, tokens.primitive.space["4"]);
    assert.equal(space.tokens.find((token) => token.name === "--space-inset-md").value, tokens.primitive.space["3"]);

    const radius = await call("get_tokens", { group: "radius", detail: "full" });
    const base = radius.tokens.find((token) => token.name === "--radius-base");
    assert.equal(base.value, tokens.primitive.radius.base);
    assert.equal(base.note, usage.tokens["--radius-base"].note);
    const md = radius.tokens.find((token) => token.name === "--radius-md");
    assert.equal(md.note, usage.families["--radius-"].note);

    const grid = await call("get_tokens", { group: "grid", detail: "full" });
    const columns = grid.tokens.find((token) => token.name === "--grid-columns");
    assert.equal(columns.value, tokens.semantic.grid.columns);
    assert.equal(columns.note, usage.families["--grid-"].note);
    assert.equal(columns.useWhen, usage.families["--grid-"].useWhen);
  });

  test("list_patterns and get_pattern include the add command", async () => {
    const listed = await call("list_patterns");
    assert.equal(listed.kit, version);
    assert.deepEqual(
      listed.patterns.map((pattern) => pattern.id),
      patternIds,
    );
    for (const pattern of listed.patterns) {
      assert.equal(typeof pattern.description, "string");
      assert.equal(pattern.level, "template");
      assert.match(pattern.add, new RegExp(`^npx agentic-ds-kit add ${pattern.id}$`));
    }

    const result = await call("get_pattern", { id: "dashboard" });
    assert.equal(result.pattern.level, "template");
    assert.equal(result.pattern.description, dashboard.intent);
    assert.equal(result.pattern.add, "npx agentic-ds-kit add dashboard");
    assert.deepEqual(result.pattern.must, dashboard.must);
    assert.deepEqual(result.pattern.defaults, dashboard.defaults);
    assert.deepEqual(result.pattern.contains, dashboard.contains);

    assert.deepEqual(result.pattern.requires, []);

    // A pattern built on another lists it, so an agent knows add copies both.
    const settings = await call("get_pattern", { id: "settings" });
    assert.deepEqual(settings.pattern.requires, ["billing-schedule"]);

    const missing = await callError("get_pattern", { id: "not-a-pattern" });
    assert.match(missing, /No pattern "not-a-pattern"/);
    const component = await callError("get_pattern", { id: "Button" });
    assert.match(component, /get_component/);
  });

  test("get_rules is this install's AGENTS.md, including the grid rule", async () => {
    const rules = await call("get_rules");
    assert.equal(rules.kit, version);
    assert.equal(rules.source, "AGENTS.md");
    assert.equal(rules.rules, agents);
    assert.match(rules.rules, /Page layout/);
    assert.match(rules.rules, /--grid-columns/);
    assert.match(rules.rules, /grid-template-columns/);
  });

  test("questions reuses the CLI builder", async () => {
    assert.deepEqual(await call("questions"), buildQuestions());
    assert.deepEqual(
      await call("questions", { group: "pattern", none: true, enums: "none", useWhen: 1, notWhen: 0 }),
      buildQuestions({ group: "pattern", none: true, enums: "none", useWhen: 1, notWhen: 0 }),
    );
  });

  test("list_components defaults to short summary rows; kind filters and limit/offset page", async () => {
    const summary = await call("list_components");
    assert.equal(summary.detail, "summary");
    assert.equal(summary.components.length, componentIds.length);
    assert.equal(summary.page.total, componentIds.length);
    assert.equal(summary.page.next, null);
    for (const row of summary.components) {
      assert.deepEqual(Object.keys(row).sort(), ["id", "kind", "level", "name", "purpose"]);
      assert.ok(row.purpose.length <= 100);
    }
    const blocks = await call("list_components", { kind: "block" });
    assert.ok(blocks.components.length > 0 && blocks.components.every((row) => row.kind === "block"));
    const full = await call("list_components", { detail: "full" });
    for (const row of full.components) assert.ok(COMPONENT_LEVELS.includes(row.level), row.id);
    const first = await call("list_components", { limit: 10 });
    assert.equal(first.components.length, 10);
    assert.equal(first.page.next, 10);
    const second = await call("list_components", { limit: 10, offset: first.page.next });
    assert.equal(second.components[0].id, componentIds[10]);
  });

  test("list_components level filter returns only that level; an unknown level is a tool error", async () => {
    const byLevel = Object.fromEntries(index.filter((row) => row.group === "component").map((row) => [row.id, row.level]));
    for (const level of COMPONENT_LEVELS) {
      const listed = await call("list_components", { level });
      const expected = Object.keys(byLevel).filter((id) => byLevel[id] === level);
      assert.ok(listed.components.length > 0, `no ${level} rows`);
      assert.ok(listed.components.every((row) => row.level === level), level);
      assert.deepEqual(listed.components.map((row) => row.id), expected);
    }
    // kind and level work together.
    const blocks = await call("list_components", { kind: "block", level: "block" });
    assert.ok(blocks.components.length > 0);
    const none = await call("list_components", { kind: "block", level: "atom" });
    assert.deepEqual(none.components, []);

    const unknown = await callError("list_components", { level: "galaxy" });
    assert.match(unknown, /level/);
    const template = await callError("list_components", { level: "template" });
    assert.match(template, /level/);
  });

  test("get_tokens defaults to name, group and value; full adds the usage notes", async () => {
    const summary = await call("get_tokens", { group: "color" });
    assert.equal(summary.detail, "summary");
    const canvas = summary.tokens.find((token) => token.name === "--bg-canvas");
    assert.deepEqual(Object.keys(canvas).sort(), ["dark", "group", "name", "value"]);
    const space = await call("get_tokens", { group: "space", limit: 5 });
    assert.equal(space.tokens.length, 5);
    assert.deepEqual(Object.keys(space.tokens[0]).sort(), ["group", "name", "value"]);
    assert.equal(space.page.next, 5);
  });

  test("questions stays the full CLI JSON by default; summary and paging are opt-in", async () => {
    const full = await call("questions");
    assert.deepEqual(full, buildQuestions({ root: kitRoot }));
    const summary = await call("questions", { detail: "summary", limit: 5 });
    assert.equal(summary.options.length, 5);
    assert.deepEqual(Object.keys(summary.options[0]).sort(), ["id", "kind", "label"]);
    assert.equal(summary.enums, undefined);
    assert.equal(summary.page.total, full.options.length);
  });

  test("default answers stay small", async () => {
    const sizes = {};
    for (const [name, args] of [["list_components", {}], ["get_tokens", {}], ["questions", { detail: "summary" }]]) {
      const result = await client.callTool({ name, arguments: args });
      sizes[name] = JSON.stringify(result).length;
    }
    // Summary rows carry level (about 3.5 KB for 141 rows), so the budget is 28 KB, not 25 KB.
    assert.ok(sizes.list_components < 28_000, `list_components ${sizes.list_components}`);
    assert.ok(sizes.get_tokens < 30_000, `get_tokens ${sizes.get_tokens}`);
    assert.ok(sizes.questions < 15_000, `questions summary ${sizes.questions}`);
  });

  test("rejects a token group the kit does not publish", async () => {
    const bad = await callError("get_tokens", { group: "shadow" });
    assert.match(bad, /color/);
    assert.match(bad, /grid/);
  });
});

describe("mcp command", () => {
  test("--help exits 0 and lists the tools", () => {
    const help = spawnSync(process.execPath, [bin, "mcp", "--help"], { encoding: "utf8", timeout: 5000 });
    assert.equal(help.status, 0);
    assert.match(help.stdout, /list_components/);
    assert.match(help.stdout, /get_tokens/);
    assert.match(help.stdout, /questions/);
    assert.match(help.stdout, /review_ui/);
    const top = spawnSync(process.execPath, [bin, "--help"], { encoding: "utf8", timeout: 5000 });
    assert.equal(top.status, 0);
    assert.match(top.stdout, /mcp\s+Start a read-only stdio MCP server/);
  });

  test("unknown mcp flag exits non-zero", () => {
    const bad = spawnSync(process.execPath, [bin, "mcp", "--nope"], { encoding: "utf8", timeout: 5000 });
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /agentic-ds-kit:/);
  });
});
