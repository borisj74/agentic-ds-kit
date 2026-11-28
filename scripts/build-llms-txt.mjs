#!/usr/bin/env node
/**
 * Writes public/llms.txt for the docs site from packages/kit/contracts/index.json, so
 * /llms.txt lists every kit piece with its docs URL. Runs at build time (npm run catalog / build);
 * the output is gitignored.
 *
 * Sections:
 * - Foundations: one entry for the foundations docs page, not one line per token.
 * - Components: index rows in the "component" group that are not blocks.
 * - Blocks: rows with "kind": "block". Docs slugs come from lib/blocks (BLOCK_DOCS), e.g. evalsuite -> eval-suite.
 * - Patterns: rows in the "pattern" group (contracts/patterns/*.json), the same set the /patterns pages show.
 * Rows with status "deprecated" are left out. Each line is the name, the contract intent and the docs URL.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BLOCK_CATEGORIES, CATEGORIES } from "./sync-readme-catalog.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(repoRoot, "packages/kit/contracts/index.json");
const blocksDir = join(repoRoot, "lib/blocks");
const outPath = join(repoRoot, "public/llms.txt");

export const SITE = "https://agentic-ds-kit.vercel.app";

/** Block contract id -> docs slug, read from lib/blocks/<slug>.ts (the files BLOCK_DOCS is built from). */
export function readBlockSlugs(dir = blocksDir) {
  const slugs = new Map();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".ts") || file.includes(".sample.") || file === "index.ts" || file === "types.ts") continue;
    const text = readFileSync(join(dir, file), "utf8");
    const id = text.match(/contracts\/([a-z0-9-]+)\.json/)?.[1];
    const slug = text.match(/\bslug:\s*"([^"]+)"/)?.[1];
    if (id && slug) slugs.set(id, slug);
  }
  return slugs;
}

/** "settings-form" -> "Settings form", the way the pattern pages title themselves. */
const patternName = (id) => id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ");

/** One line of plain text: whitespace (including newlines) collapsed. */
const oneLine = (text) => String(text ?? "").replace(/\s+/g, " ").trim();

const line = (name, description, url) => `- [${name}](${url}): ${oneLine(description)}`;

/** Builds the llms.txt text. Throws when a live block has no docs slug. */
export function buildLlmsTxt(index = JSON.parse(readFileSync(indexPath, "utf8")), blockSlugs = readBlockSlugs()) {
  const live = (row) => row.status !== "deprecated";
  const names = new Map(
    [...Object.values(CATEGORIES), ...Object.values(BLOCK_CATEGORIES)].flat().map((name) => [name.toLowerCase(), name]),
  );
  const nameOf = (row) => names.get(row.id) ?? row.id;

  const components = index.filter((row) => row.group === "component" && row.kind !== "block" && live(row));
  const blocks = index.filter((row) => row.group === "component" && row.kind === "block" && live(row));
  const patterns = index.filter((row) => row.group === "pattern" && live(row));

  const missing = blocks.filter((row) => !blockSlugs.has(row.id)).map((row) => row.id);
  if (missing.length) throw new Error(`No docs slug in lib/blocks for block(s): ${missing.join(", ")}`);

  const out = [
    "# agentic-ds-kit",
    "",
    "> React design system for SaaS and agent UIs. Every component, block and pattern has a JSON contract; import components from agentic-ds-kit, style with its semantic tokens, and start screens from patterns (npx agentic-ds-kit add <id>).",
    "",
    "## Foundations",
    "",
    line(
      "Foundations",
      "Semantic tokens for color, type, space, icons, layout grid, radius, border, shadow, motion and opacity. Components bind to semantic vars only, never hex or primitive ramps.",
      `${SITE}/foundations`,
    ),
    "",
    "## Components",
    "",
    ...components.map((row) => line(nameOf(row), row.intent, `${SITE}/components/${row.id}`)),
    "",
    "## Blocks",
    "",
    ...blocks.map((row) => line(nameOf(row), row.intent, `${SITE}/blocks/${blockSlugs.get(row.id)}`)),
    "",
    "## Patterns",
    "",
    ...patterns.map((row) => line(patternName(row.id), row.intent, `${SITE}/patterns/${row.id}`)),
    "",
  ];
  return out.join("\n");
}

function main() {
  const text = buildLlmsTxt();
  writeFileSync(outPath, text);
  const count = text.split("\n").filter((row) => row.startsWith("- ")).length;
  console.log(`Wrote public/llms.txt (${count} entries)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
