/**
 * inspect: kit pieces by level from data-nistha markers, landmark checks, text and JSON output,
 * exit codes, --help, and the MCP tool inspect_ui. Reads local fixtures and a loopback HTTP
 * server started here; no outside network and no Playwright.
 */
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join, resolve } from "node:path";
import { after, before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { InspectError, inspectHtml } from "../bin/inspect.mjs";

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bin = join(kitRoot, "bin/agentic-ds-kit.mjs");
const fixtures = join(kitRoot, "test/fixtures/inspect");
const fixture = (name) => join(fixtures, name);
const read = (name) => readFileSync(fixture(name), "utf8");

const run = (...args) => spawnSync(process.execPath, [bin, "inspect", ...args], { encoding: "utf8", timeout: 10_000 });

/** Async run, so a loopback server in this process can answer while the CLI waits. */
function runAsync(...args) {
  return new Promise((done) => {
    const child = spawn(process.execPath, [bin, "inspect", ...args]);
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (status) => done({ status, stdout, stderr }));
  });
}

const pieces = (result) =>
  Object.fromEntries(result.levels.flatMap((group) => group.pieces.map((piece) => [piece.id, piece.count])));

let server;
let base;

before(async () => {
  server = createServer((request, response) => {
    if (request.url === "/missing") {
      response.writeHead(404, { "content-type": "text/html" });
      response.end("<p>Not found</p>");
      return;
    }
    if (request.url === "/json") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end("{}");
      return;
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(read("mixed.html"));
  });
  await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server?.close());

describe("inspectHtml", () => {
  test("counts each id, groups by level biggest first, and skips scripts, styles and comments", () => {
    const result = inspectHtml(read("mixed.html"), { source: "mixed.html" });
    assert.equal(result.inspectMode, true);
    assert.deepEqual(
      result.levels.map((group) => group.level),
      ["block", "organism", "molecule", "atom"],
    );
    assert.deepEqual(pieces(result), {
      agentoverview: 1,
      appheader: 1,
      card: 2,
      dropdownmenu: 1,
      select: 1,
      tiltcard: 1,
      button: 2,
    });
    assert.deepEqual(result.unknown, [{ id: "notakitpiece", count: 1 }]);
    assert.equal(result.total, 10);
    assert.equal(result.distinct, 8);
    assert.deepEqual(result.landmarks, { main: 1, h1: 1 });
    assert.deepEqual(result.problems, []);
    assert.equal(result.errors, 0);
    const molecule = result.levels.find((group) => group.level === "molecule");
    assert.equal(molecule.count, 5);
    assert.equal(molecule.pieces[0].name, "Card");
  });

  test("no main, two mains and no h1 are errors", () => {
    assert.deepEqual(
      inspectHtml(read("no-main.html")).problems.map((problem) => problem.rule),
      ["no-main"],
    );
    const two = inspectHtml(read("two-mains.html"));
    assert.deepEqual(two.problems.map((problem) => problem.rule), ["multiple-main"]);
    assert.equal(two.landmarks.main, 2);
    const noH1 = inspectHtml(read("no-h1.html"));
    assert.deepEqual(noH1.problems.map((problem) => problem.rule), ["no-h1"]);
    assert.equal(noH1.errors, 1);
  });

  test("no markers is a note, not an error", () => {
    const result = inspectHtml(read("no-markers.html"));
    assert.equal(result.inspectMode, false);
    assert.match(result.note, /Inspect mode may be off/);
    assert.match(result.note, /NEXT_PUBLIC_NISTHA_INSPECT=1/);
    assert.equal(result.total, 0);
    assert.deepEqual(result.levels, []);
    assert.equal(result.errors, 0);
  });

  test("a role=heading with aria-level 1 counts as an h1", () => {
    const result = inspectHtml('<main><div role="heading" aria-level="1">Title</div></main>');
    assert.equal(result.landmarks.h1, 1);
    assert.deepEqual(result.problems, []);
  });

  test("non-string html throws InspectError", () => {
    assert.throws(() => inspectHtml(undefined), InspectError);
  });
});

describe("inspect command", () => {
  test("--help exits 0 and names the switch, the checks and the exit codes", () => {
    const help = run("--help");
    assert.equal(help.status, 0);
    assert.match(help.stdout, /Usage: npx agentic-ds-kit inspect <url-or-file>/);
    assert.match(help.stdout, /NEXT_PUBLIC_NISTHA_INSPECT=1/);
    assert.match(help.stdout, /no-main/);
    assert.match(help.stdout, /multiple-main/);
    assert.match(help.stdout, /no-h1/);
    assert.match(help.stdout, /--browser/);
    assert.match(help.stdout, /Exit codes/);
    const top = spawnSync(process.execPath, [bin, "--help"], { encoding: "utf8", timeout: 5000 });
    assert.match(top.stdout, /inspect\s+List the kit pieces on a rendered page/);
  });

  test("text output lists pieces by level with counts; exit 0", () => {
    const out = run(fixture("mixed.html"));
    assert.equal(out.status, 0, out.stderr);
    assert.match(out.stdout, /10 kit pieces, 8 different\./);
    assert.match(out.stdout, /block \(1\)\n {2}AgentOverview\s+1/);
    assert.match(out.stdout, /atom \(2\)\n {2}Button\s+2/);
    assert.match(out.stdout, /Not in this kit's index\n {2}notakitpiece\s+1/);
    assert.match(out.stdout, /Landmarks: 1 <main>, 1 <h1>\./);
    assert.match(out.stdout, /No landmark problems\./);
    assert.ok(out.stdout.indexOf("block (") < out.stdout.indexOf("atom ("));
  });

  test("--json prints the same data", () => {
    const out = run(fixture("mixed.html"), "--json");
    assert.equal(out.status, 0, out.stderr);
    const json = JSON.parse(out.stdout);
    const direct = inspectHtml(read("mixed.html"), { source: fixture("mixed.html") });
    assert.deepEqual(json, direct);
  });

  test("landmark errors exit 1", () => {
    for (const name of ["no-main.html", "two-mains.html", "no-h1.html"]) {
      const out = run(fixture(name));
      assert.equal(out.status, 1, name);
      assert.match(out.stdout, /error/);
    }
    const json = JSON.parse(run(fixture("two-mains.html"), "--json").stdout);
    assert.equal(json.errors, 1);
  });

  test("no markers exits 0 and says inspect mode may be off", () => {
    const out = run(fixture("no-markers.html"));
    assert.equal(out.status, 0);
    assert.match(out.stdout, /Inspect mode may be off/);
  });

  test("exit 2 when it cannot run", () => {
    const cases = [
      [],
      [fixture("mixed.html"), fixture("no-h1.html")],
      [fixture("nope.html")],
      [fixture("not-html.txt")],
      [fixtures],
      ["ftp://example.com/page.html"],
      [fixture("mixed.html"), "--nope"],
    ];
    for (const args of cases) {
      const out = run(...args);
      assert.equal(out.status, 2, args.join(" "));
      assert.match(out.stderr, /agentic-ds-kit:/);
    }
  });

  test("--browser without Playwright exits 2 with an install hint", () => {
    const out = run(fixture("mixed.html"), "--browser");
    assert.equal(out.status, 2);
    assert.match(out.stderr, /Playwright/);
    assert.match(out.stderr, /npm i -D playwright/);
  });

  test("a URL is read with fetch", async () => {
    const out = await runAsync(`${base}/`, "--json");
    assert.equal(out.status, 0, out.stderr);
    const json = JSON.parse(out.stdout);
    assert.equal(json.source, `${base}/`);
    assert.equal(json.mode, "html");
    assert.equal(json.total, 10);
  });

  test("a URL that does not answer, answers 404, or is not HTML exits 2", async () => {
    for (const url of [`${base}/missing`, `${base}/json`]) {
      const out = await runAsync(url);
      assert.equal(out.status, 2, url);
      assert.match(out.stderr, /agentic-ds-kit:/);
    }
    const closed = await runAsync("http://127.0.0.1:1/");
    assert.equal(closed.status, 2);
    assert.match(closed.stderr, /could not load/);
  });
});

describe("inspect_ui MCP tool", { timeout: 20_000 }, () => {
  let client;

  before(async () => {
    const transport = new StdioClientTransport({ command: process.execPath, args: [bin, "mcp"], stderr: "pipe" });
    transport.stderr?.resume();
    client = new Client({ name: "agentic-ds-kit-inspect-test", version: "0.0.0" });
    await client.connect(transport);
  });

  after(async () => {
    await client?.close();
  });

  const textOf = (result) => result.content.find((item) => item.type === "text").text;

  test("is listed, read-only", async () => {
    const { tools } = await client.listTools();
    const tool = tools.find((item) => item.name === "inspect_ui");
    assert.ok(tool);
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
    assert.deepEqual(Object.keys(tool.inputSchema.properties).sort(), ["html", "name", "url"]);
  });

  test("html plus name gives the same result as the CLI", async () => {
    const result = await client.callTool({ name: "inspect_ui", arguments: { html: read("mixed.html"), name: "mixed.html" } });
    assert.notEqual(result.isError, true, textOf(result));
    assert.deepEqual(JSON.parse(textOf(result)), inspectHtml(read("mixed.html"), { source: "mixed.html" }));
  });

  test("url reads the page", async () => {
    const result = await client.callTool({ name: "inspect_ui", arguments: { url: `${base}/` } });
    assert.notEqual(result.isError, true, textOf(result));
    const json = JSON.parse(textOf(result));
    assert.equal(json.source, `${base}/`);
    assert.equal(json.distinct, 8);
  });

  test("landmark problems come back as data, not a tool error", async () => {
    const result = await client.callTool({ name: "inspect_ui", arguments: { html: read("no-main.html"), name: "no-main.html" } });
    assert.notEqual(result.isError, true);
    assert.deepEqual(JSON.parse(textOf(result)).problems.map((problem) => problem.rule), ["no-main"]);
  });

  test("missing or mixed arguments are tool errors", async () => {
    const cases = [
      [{}, /Pass url/],
      [{ html: "<main></main>" }, /name is required/],
      [{ name: "page.html" }, /html is required/],
      [{ url: `${base}/`, html: "<main></main>", name: "x" }, /not both/],
      [{ url: "file:///etc/hosts" }, /http:\/\/ or https:\/\//],
      [{ url: `${base}/missing` }, /404/],
    ];
    for (const [args, message] of cases) {
      const result = await client.callTool({ name: "inspect_ui", arguments: args });
      assert.equal(result.isError, true, JSON.stringify(args));
      assert.match(textOf(result), message);
    }
  });
});
