#!/usr/bin/env node
/**
 * agentic-ds-kit add <name>: copy a pattern's (or a chrome recipe's) source into your app
 * so you own it. Reads patterns-src/ (built from patterns/ and recipes/ at publish
 * time). No dependencies.
 *
 * agentic-ds-kit questions: contracts → neutral option list (see ./questions.mjs).
 * agentic-ds-kit mcp: read-only stdio MCP server (see ./mcp.mjs).
 */
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { runQuestions } from "./questions.mjs";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(pkgRoot, "patterns-src");

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
  questions      Build a closed option list from the contracts for a decision
                 model or LLM. Run: npx agentic-ds-kit questions --help
  mcp            Start a read-only stdio MCP server for this install.
                 Run: npx agentic-ds-kit mcp`;

// Removes line and block comments outside strings (tsconfig allows them); strings such as the
// "@/" path key keep their slashes and stars.
function stripJsonComments(text) {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += text[i + 1] ?? "";
        i += 1;
      } else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i += 1;
      out += "\n";
    } else if (ch === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i += 1;
    } else out += ch;
  }
  return out;
}

/**
 * The `@/...` import for `target` when tsconfig.json (or jsconfig.json) maps "@/*", else null.
 * Reads compilerOptions.paths and baseUrl (comments and trailing commas allowed), so both
 * "@/*": ["./*"] and "@/*": ["./src/*"] resolve. Falls back to the create-next-app layout
 * (app root, or src/ when the app uses it) if the file cannot be parsed.
 */
async function aliasImport(cwd, target) {
  for (const name of ["tsconfig.json", "jsconfig.json"]) {
    const file = join(cwd, name);
    if (!existsSync(file)) continue;
    const text = await readFile(file, "utf8");
    let mapped;
    let baseUrl = ".";
    try {
      const json = JSON.parse(stripJsonComments(text).replace(/,(\s*[}\]])/g, "$1"));
      baseUrl = json.compilerOptions?.baseUrl ?? ".";
      mapped = json.compilerOptions?.paths?.["@/*"]?.[0];
    } catch {
      if (!text.includes('"@/*"')) continue;
      mapped = existsSync(join(cwd, "src")) && !existsSync(join(cwd, "components")) ? "./src/*" : "./*";
    }
    if (typeof mapped !== "string" || !mapped.endsWith("*")) continue;
    const aliasRoot = resolve(cwd, baseUrl, mapped.slice(0, -1));
    const inside = relative(aliasRoot, target).split("\\").join("/");
    if (inside && !inside.startsWith("..") && !inside.startsWith("/")) return `@/${inside}`;
  }
  return null;
}

function fail(message) {
  console.error(`agentic-ds-kit: ${message}`);
  process.exit(1);
}

async function loadManifest() {
  const file = join(srcRoot, "index.json");
  if (!existsSync(file)) {
    fail("pattern sources are missing from this install (patterns-src/index.json). Reinstall agentic-ds-kit.");
  }
  return JSON.parse(await readFile(file, "utf8"));
}

/** `DashboardPattern`, `dashboard-pattern`, `Dashboard` → `dashboard` */
function normalize(name) {
  return name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-?pattern$/, "");
}

/** Manifests from before recipes have no `kind`: every entry is a pattern. */
const kindOf = (entry) => entry.kind ?? "pattern";

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

const id = normalize(names[0]);
const pattern = manifest.find((p) => p.id === id);
if (!pattern) {
  fail(`unknown pattern or recipe "${names[0]}". Available: ${manifest.map((p) => p.id).join(", ")}\nRun: npx agentic-ds-kit add --list`);
}

const cwd = resolve(opts.cwd ?? process.cwd());
const usesSrc = existsSync(join(cwd, "src")) && !existsSync(join(cwd, "components"));
const folder = kindOf(pattern) === "recipe" ? "components/chrome" : "components/patterns";
const target = resolve(cwd, opts.dir ?? join(usesSrc ? "src" : "", folder, pattern.id));

const clashes = pattern.files.filter((file) => existsSync(join(target, file)));
if (clashes.length && !opts.force) {
  fail(
    `${relative(cwd, target) || "."} already has ${clashes.join(", ")}. Nothing was written.\nRe-run with --force to overwrite.`,
  );
}

await mkdir(target, { recursive: true });
for (const file of pattern.files) {
  await copyFile(join(srcRoot, pattern.id, file), join(target, file));
}

const rel = relative(cwd, target).split("\\").join("/");
const { version } = JSON.parse(await readFile(join(pkgRoot, "package.json"), "utf8"));
console.log(`Added ${pattern.id} (agentic-ds-kit ${version}) to ${rel}/`);
for (const file of pattern.files) console.log(`  ${rel}/${file}${clashes.includes(file) ? "  (overwritten)" : ""}`);
// A pattern that builds on others (manifest `requires`) imports them as `../<id>`: copy each
// one beside the target unless that folder is already there (you own it; --force does not touch it).
const added = new Set([pattern.id]);
async function addRequired(entry) {
  for (const depId of entry.requires ?? []) {
    if (added.has(depId)) continue;
    added.add(depId);
    const dep = manifest.find((p) => p.id === depId);
    if (!dep) fail(`${entry.id} requires "${depId}", which is missing from this install. Reinstall agentic-ds-kit.`);
    const depTarget = join(dirname(target), depId);
    const depRel = relative(cwd, depTarget).split("\\").join("/");
    if (existsSync(depTarget)) {
      console.log(`  ${depRel}/  (kept: ${entry.id} imports it as ../${depId})`);
    } else {
      await mkdir(depTarget, { recursive: true });
      for (const file of dep.files) await copyFile(join(srcRoot, dep.id, file), join(depTarget, file));
      console.log(`Added ${dep.id} to ${depRel}/ (${entry.id} imports it as ../${depId})`);
      for (const file of dep.files) console.log(`  ${depRel}/${file}`);
    }
    await addRequired(dep);
  }
}
await addRequired(pattern);
// Copies from 0.4.5 and earlier have Foo.module.css; the new Foo.tsx imports Foo.css instead.
const stale = pattern.files
  .filter((f) => f.endsWith(".css"))
  .map((f) => f.replace(/\.css$/, ".module.css"))
  .filter((f) => existsSync(join(target, f)));
if (stale.length) {
  console.log(`\nNo longer imported (patterns now use plain CSS); delete them once any edits are moved over:`);
  for (const file of stale) console.log(`  ${rel}/${file}`);
}
const spec = (await aliasImport(cwd, target)) ?? rel;
const contracts = pattern.files.filter((f) => f.endsWith(".contract.json")).join(", ");
const rules =
  kindOf(pattern) === "pattern"
    ? "agents follow its `must` lines (kit look and accessibility); its `defaults` are\nsuggestions you can change"
    : "agents keep the kit rules (tokens, one primary Button, kit components only)";
console.log(`
Use it:
  import { ${pattern.name} } from "${spec}";

You own these files now; edit them freely. Keep ${contracts} next to
them so ${rules}.`);
