#!/usr/bin/env node
/** Bundles contracts + token usage for the playground AI prompt export. */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const kit = join(root, "packages/kit");
const index = JSON.parse(readFileSync(join(kit, "contracts/index.json"), "utf8"));
const usage = JSON.parse(readFileSync(join(kit, "tokens/usage.json"), "utf8"));
const tokens = JSON.parse(readFileSync(join(kit, "tokens/tokens.json"), "utf8"));

function loadContract(path) {
  return JSON.parse(readFileSync(join(kit, path), "utf8"));
}

const contracts = index.map((entry) => {
  const contract = loadContract(entry.path);
  const props = contract.props
    ? Object.fromEntries(
        Object.entries(contract.props).map(([name, spec]) => [
          name,
          {
            type: spec.type,
            values: spec.values,
            default: spec.default,
            required: spec.required,
            note: spec.note,
          },
        ]),
      )
    : undefined;
  return {
    id: entry.id,
    group: entry.group,
    intent: contract.intent ?? entry.intent,
    useWhen: contract.useWhen,
    doNotUseWhen: contract.doNotUseWhen,
    doNot: contract.doNot,
    must: contract.must,
    props,
  };
});

const catalog = {
  kit: JSON.parse(readFileSync(join(kit, "package.json"), "utf8")).name,
  version: JSON.parse(readFileSync(join(kit, "package.json"), "utf8")).version,
  rules: [
    "Import from agentic-ds-kit only. Never invent a local cousin.",
    "Read contracts/index.json, then only the matching contract file(s).",
    "Semantic tokens only (no hex, no primitive --color-* ramps in components).",
    "One appearance=\"solid\" mode=\"primary\" Button per view.",
    "Page content in <main>; chrome in header/nav; nav reachable on small screens.",
    "Layout: content inset + gutter 24px (margin-md / gutter-lg). Section does not own page padding.",
    "Compose-or-stop. If a component is missing from the index, ask — do not add a one-off.",
  ],
  tokens: {
    typeFamily: tokens.semantic.type.family,
    typeLadder: tokens.semantic.type.ladder,
    usage,
  },
  contracts,
};

writeFileSync(join(root, "lib/kit-prompt-catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
console.log(`Wrote lib/kit-prompt-catalog.json (${contracts.length} contracts)`);

void readdirSync;
