#!/usr/bin/env node
/**
 * Release-time changelog step. Each PR adds one file to changes/ instead of editing CHANGELOG.md,
 * so PRs never conflict on it. This script moves every changes/*.md entry (plus anything still
 * under [Unreleased]) under a new version heading in CHANGELOG.md, then deletes those files.
 *
 *   npm run changelog                      # version from packages/kit/package.json, today's date
 *   npm run changelog -- 0.28.0            # explicit version
 *   npm run changelog -- 0.28.0 --date 2026-11-20
 *   npm run changelog -- --dry-run         # print the new CHANGELOG.md, change nothing
 *
 * Plain Node, no dependencies. The parsing lives in exported functions so it can be tested.
 */

import { readdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Keep a Changelog section order. Entry files may only use these headings. */
export const SECTIONS = ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"];

/** Files in changes/ that are not entries. */
const IGNORED = new Set(["README.md"]);

/**
 * Parses `### Section` blocks into { Section: [line, ...] }. Blank lines are dropped; every other
 * line is kept as written, so a bullet can wrap onto indented lines. Throws on an unknown heading
 * or on text before the first heading.
 */
export function parseSections(text, source) {
  const out = {};
  let current = null;
  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) continue;
    const heading = /^###\s+(.+)$/.exec(line);
    if (heading) {
      const name = heading[1].trim();
      if (!SECTIONS.includes(name)) {
        throw new Error(`${source}: unknown section "### ${name}". Use one of: ${SECTIONS.join(", ")}.`);
      }
      current = name;
      out[current] ??= [];
      continue;
    }
    if (/^#{1,2}\s/.test(line)) throw new Error(`${source}: only "### <Section>" headings are allowed, found "${line}".`);
    if (!current) throw new Error(`${source}: text before the first "### <Section>" heading: "${line}".`);
    out[current].push(line);
  }
  return out;
}

/** Appends b's lines to a, section by section. */
function mergeInto(a, b) {
  for (const [name, lines] of Object.entries(b)) (a[name] ??= []).push(...lines);
  return a;
}

/** Renders sections in Keep a Changelog order, skipping empty ones. */
export function renderSections(sections) {
  return SECTIONS.filter((name) => sections[name]?.length)
    .map((name) => `### ${name}\n\n${sections[name].join("\n")}\n`)
    .join("\n");
}

/**
 * Returns the new CHANGELOG text. `entries` is [{ name, text }] in the order they should appear.
 * Whatever is already under [Unreleased] comes first, then the entries; [Unreleased] is left empty.
 */
export function buildChangelog(changelog, entries, version, date) {
  const text = changelog.replace(/\r\n/g, "\n");
  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error(`"${version}" is not a version like 0.28.0.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`"${date}" is not a date like 2026-11-20.`);
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`^## \\[${escaped}\\]`, "m").test(text)) throw new Error(`CHANGELOG.md already has a [${version}] heading.`);

  const start = text.search(/^## \[Unreleased\][^\n]*$/m);
  if (start === -1) throw new Error('CHANGELOG.md has no "## [Unreleased]" heading.');
  const bodyStart = text.indexOf("\n", start) + 1;
  const nextRelease = text.slice(bodyStart).search(/^## \[/m);
  const bodyEnd = nextRelease === -1 ? text.length : bodyStart + nextRelease;

  const sections = parseSections(text.slice(bodyStart, bodyEnd), "CHANGELOG.md [Unreleased]");
  for (const entry of entries) {
    const parsed = parseSections(entry.text, `changes/${entry.name}`);
    if (!Object.values(parsed).some((lines) => lines.length)) throw new Error(`changes/${entry.name} has no entry lines.`);
    mergeInto(sections, parsed);
  }
  const rendered = renderSections(sections);
  if (!rendered) throw new Error("Nothing to release: changes/ is empty and [Unreleased] has no entries.");

  const head = text.slice(0, bodyStart);
  const tail = text.slice(bodyEnd);
  return `${head}\n## [${version}] - ${date}\n\n${rendered}${tail ? `\n${tail}` : ""}`;
}

/** Entry files in changes/, sorted by name so the output is stable. */
export function readEntries(dir) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  return names
    .filter((name) => name.endsWith(".md") && !IGNORED.has(name))
    .sort()
    .map((name) => ({ name, text: readFileSync(join(dir, name), "utf8") }));
}

function today() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function main(argv) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const args = [...argv];
  const dryRun = args.includes("--dry-run");
  const dateAt = args.indexOf("--date");
  const date = dateAt === -1 ? today() : args[dateAt + 1];
  const positional = args.filter((arg, i) => !arg.startsWith("--") && (dateAt === -1 || i !== dateAt + 1));
  const version = positional[0] ?? JSON.parse(readFileSync(join(root, "packages/kit/package.json"), "utf8")).version;

  const changelogPath = join(root, "CHANGELOG.md");
  const changesDir = join(root, "changes");
  const entries = readEntries(changesDir);
  const next = buildChangelog(readFileSync(changelogPath, "utf8"), entries, version, date ?? "");

  if (dryRun) {
    process.stdout.write(next);
    return;
  }
  writeFileSync(changelogPath, next);
  for (const entry of entries) unlinkSync(join(changesDir, entry.name));
  console.log(`CHANGELOG.md: added [${version}] - ${date} from ${entries.length} file(s) in changes/.`);
}

// Run only as a CLI, not when imported by the test. Real paths, so a symlinked folder still matches.
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`changelog: ${error.message}`);
    process.exit(1);
  }
}
