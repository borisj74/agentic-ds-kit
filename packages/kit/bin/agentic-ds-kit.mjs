#!/usr/bin/env node
/**
 * agentic-ds-kit add <name>: copy a pattern's (or a chrome recipe's) source into your app
 * so you own it. Reads patterns-src/ (built from patterns/ and recipes/ at publish
 * time). No dependencies.
 *
 * agentic-ds-kit init <folder>: a new Next app that starts from a pattern (see ./init.mjs).
 * agentic-ds-kit questions: contracts → neutral option list (see ./questions.mjs).
 * agentic-ds-kit mcp: read-only stdio MCP server (see ./mcp.mjs).
 * agentic-ds-kit review <path>: check UI files against the contracts (see ./review.mjs).
 * agentic-ds-kit inspect <url-or-file>: list the kit pieces on a rendered page (see ./inspect.mjs).
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { addPattern, kindOf, loadManifest as readManifest, pkgRoot } from "./add.mjs";
import { runQuestions } from "./questions.mjs";

const HELP = `Usage: npx agentic-ds-kit add <name> [options]

Copy a pattern (an example screen or layout built from kit components), or a
chrome recipe (a component preset rebuilt from its compose parts), into your
app so you can edit it. Patterns are starting points; change or ignore them.

Options:
  --list         List patterns and recipes you can add
  --dir <path>   Target folder (default: components/patterns/<name> for patterns,
                 components/chrome/<name> for recipes; under src/ when the app uses src/)
  --force        Overwrite files that already exist
  --cwd <path>   App root (default: current folder)
  -v, --version  Print the installed agentic-ds-kit version
  -h, --help     Show this help

Examples:
  npx agentic-ds-kit add --list
  npx agentic-ds-kit add dashboard
  npx agentic-ds-kit add app-shell
  npx agentic-ds-kit add app-header
  npx agentic-ds-kit add list-detail --dir app/projects/_pattern

Other commands:
  init           Start a new Next app in a new folder, from a pattern or a blank page.
                 Example: npx agentic-ds-kit init my-app --template dashboard
                 Run: npx agentic-ds-kit init --help
  review         Check UI files against the kit's contracts and tokens, and say
                 what to fix. Example: npx agentic-ds-kit review app
                 Run: npx agentic-ds-kit review --help
  inspect        List the kit pieces on a rendered page, by level, and check its
                 landmarks. Example: npx agentic-ds-kit inspect http://localhost:3000
                 Run: npx agentic-ds-kit inspect --help
  questions      Build a closed option list from the contracts for a decision
                 model or LLM. Run: npx agentic-ds-kit questions --help
  mcp            Start a read-only stdio MCP server for this install.
                 Run: npx agentic-ds-kit mcp`;

function fail(message) {
  console.error(`agentic-ds-kit: ${message}`);
  process.exit(1);
}

async function loadManifest() {
  try {
    return await readManifest();
  } catch (error) {
    fail(error.message);
  }
}

function printList(manifest) {
  const width = Math.max(...manifest.map((p) => p.id.length));
  const sections = [
    ["Patterns (examples to start from):", "pattern"],
    ["Recipes (chrome presets built from compose parts):", "recipe"],
  ];
  for (const [heading, kind] of sections) {
    const entries = manifest.filter((p) => kindOf(p) === kind);
    if (!entries.length) continue;
    console.log(`${heading}\n`);
    for (const p of entries) console.log(`  ${p.id.padEnd(width)}  ${p.intent}`);
    console.log("");
  }
  console.log("npx agentic-ds-kit add <name>");
}

if (process.argv[2] === "--version" || process.argv[2] === "-v") {
  const { version } = JSON.parse(await readFile(join(pkgRoot, "package.json"), "utf8"));
  console.log(version);
  process.exit(0);
}
if (process.argv[2] === "init") {
  const { runInit } = await import("./init.mjs");
  process.exit(await runInit(process.argv.slice(3)));
}
if (process.argv[2] === "review") {
  const { runReview } = await import("./review.mjs");
  process.exit(runReview(process.argv.slice(3)));
}
if (process.argv[2] === "inspect") {
  const { runInspect } = await import("./inspect.mjs");
  process.exit(await runInspect(process.argv.slice(3)));
}
if (process.argv[2] === "questions") process.exit(runQuestions(process.argv.slice(3)));
if (process.argv[2] === "mcp") {
  const { runMcp } = await import("./mcp.mjs");
  process.exit(await runMcp(process.argv.slice(3)));
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      list: { type: "boolean" },
      dir: { type: "string" },
      force: { type: "boolean" },
      cwd: { type: "string" },
      version: { type: "boolean", short: "v" },
      help: { type: "boolean", short: "h" },
    },
  });
} catch (error) {
  fail(`${error.message}\n\n${HELP}`);
}
const { values: opts, positionals } = parsed;
const [command, ...names] = positionals;

if (opts.version) {
  const { version } = JSON.parse(await readFile(join(pkgRoot, "package.json"), "utf8"));
  console.log(version);
  process.exit(0);
}

if (opts.help || !command) {
  console.log(HELP);
  process.exit(opts.help ? 0 : 1);
}
if (command === "list") {
  printList(await loadManifest());
  process.exit(0);
}
if (command !== "add") fail(`unknown command "${command}". Run: npx agentic-ds-kit --help`);

const manifest = await loadManifest();
if (opts.list) {
  printList(manifest);
  process.exit(0);
}
if (names.length !== 1) {
  fail(names.length ? "add one at a time." : "name a pattern or recipe. Run: npx agentic-ds-kit add --list");
}

try {
  await addPattern({ cwd: opts.cwd ?? process.cwd(), name: names[0], dir: opts.dir, force: opts.force, manifest });
} catch (error) {
  fail(error.message);
}
