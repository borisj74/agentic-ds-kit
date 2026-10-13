#!/usr/bin/env node
/**
 * agentic-ds-kit add <name>: copy a pattern's (or a chrome recipe's) source into your app
 * so you own it. Reads patterns-src/ (built from patterns/ and recipes/ at publish
 * time). No dependencies.
 */
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(pkgRoot, "patterns-src");

const HELP = `Usage: npx agentic-ds-kit add <name> [options]

Copy a pattern (an example screen or layout built from kit components), or a
chrome recipe (a component preset rebuilt from its building blocks), into your
app so you can edit it. Patterns are starting points; change or ignore them.

Options:
  --list         List patterns and recipes you can add
  --dir <path>   Target folder (default: components/patterns/<name> for patterns,
                 components/chrome/<name> for recipes; under src/ when the app uses src/)
  --force        Overwrite files that already exist
  --cwd <path>   App root (default: current folder)
  -h, --help     Show this help

Examples:
  npx agentic-ds-kit add --list
  npx agentic-ds-kit add dashboard
  npx agentic-ds-kit add app-shell
  npx agentic-ds-kit add app-header
  npx agentic-ds-kit add inbox --dir app/inbox/_pattern`;

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
    ["Recipes (chrome presets built from blocks):", "recipe"],
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

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      list: { type: "boolean" },
      dir: { type: "string" },
      force: { type: "boolean" },
      cwd: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
} catch (error) {
  fail(`${error.message}\n\n${HELP}`);
}
const { values: opts, positionals } = parsed;
const [command, ...names] = positionals;

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
// create-next-app maps "@/*" to the app root (or src/); fall back to the folder path.
const tsconfig = existsSync(join(cwd, "tsconfig.json")) ? await readFile(join(cwd, "tsconfig.json"), "utf8") : "";
const aliasBase = usesSrc ? "src/" : "";
const spec =
  tsconfig.includes('"@/*"') && !rel.startsWith("..") && rel.startsWith(aliasBase)
    ? `@/${rel.slice(aliasBase.length)}`
    : rel;
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
