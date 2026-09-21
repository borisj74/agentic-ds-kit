#!/usr/bin/env node
/**
 * Rewrites current-version pins in docs/getting-started.md from
 * packages/kit/package.json. Historical versions (0.1.0, 0.2.0) stay put.
 * Runs from bump:kit (npm version) and as a safety net on publish:kit.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = JSON.parse(
  readFileSync(join(root, "packages/kit/package.json"), "utf8"),
).version;

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`Unexpected kit version: ${version}`);
}

const file = join(root, "docs/getting-started.md");
let md = readFileSync(file, "utf8");

const patches = [
  [
    /Current latest is \*\*\d+\.\d+\.\d+\*\*/,
    `Current latest is **${version}**`,
  ],
  [
    /Use \*\*\d+\.\d+\.\d+ or later\*\*/,
    `Use **${version} or later**`,
  ],
  [
    /# expect \d+\.\d+\.\d+ or higher/,
    `# expect ${version} or higher`,
  ],
  [
    /"agentic-ds-kit": "\^\d+\.\d+\.\d+"/,
    `"agentic-ds-kit": "^${version}"`,
  ],
  [
    /No `transpilePackages` for this package \(\d+\.\d+\.\d+\+\)/,
    `No \`transpilePackages\` for this package (${version}+)`,
  ],
];

for (const [re, replacement] of patches) {
  if (!re.test(md)) {
    throw new Error(`docs/getting-started.md: missing pattern ${re}`);
  }
  re.lastIndex = 0;
  md = md.replace(re, replacement);
}

writeFileSync(file, md);
console.log(`Synced docs/getting-started.md to ${version}`);
