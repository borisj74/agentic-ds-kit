/** The pattern contract fields a prompt needs (packages/kit/contracts/patterns/<id>.json). */
export interface PatternPromptContract {
  id: string;
  add: string;
  intent?: string;
  must?: string[];
  defaults?: string[];
}

export type PatternPromptTarget = "default" | "cursor";

/**
 * A prompt that has the agent add a pattern and build from it: install the kit if missing, run
 * the add command, follow `must`, treat `defaults` as suggestions, keep the kit rules.
 * Cursor's variant @-mentions the contract path so Cursor attaches the file.
 */
export function patternPrompt(title: string, contract: PatternPromptContract, target: PatternPromptTarget): string {
  const path = `node_modules/agentic-ds-kit/contracts/patterns/${contract.id}.json`;
  const ref = target === "cursor" ? `@${path}` : path;
  const lines = [
    `Use the nistha ${title} pattern from agentic-ds-kit as the starting point.`,
    "1. If agentic-ds-kit is not installed, run: npm install agentic-ds-kit",
    `2. Run: ${contract.add}`,
    `   It copies the source into components/patterns/${contract.id}/ with its contract beside it. You own that copy.`,
    `3. Read ${ref} before changing it.`,
  ];
  if (contract.intent) lines.push("", `What it is: ${contract.intent}`);
  if (contract.must?.length) {
    lines.push("", "Must (keep these):", ...contract.must.map((item) => `- ${item}`));
  }
  if (contract.defaults?.length) {
    lines.push("", "Defaults (suggestions; change any of them):", ...contract.defaults.map((item) => `- ${item}`));
  }
  lines.push(
    "",
    "Keep the kit rules in AGENTS.md: import kit components from agentic-ds-kit (no local cousins), semantic tokens only, one solid primary Button per view. Stop and ask before breaking a must.",
  );
  return lines.join("\n");
}

/** The block contract fields a prompt needs (packages/kit/contracts/<id>.json, "kind": "block"). */
export interface BlockPromptContract {
  id: string;
  intent?: string;
  snippet?: string;
  doNot?: string[];
}

/**
 * A prompt that has the agent use a block: install the kit if missing, read the contract, import
 * the block from agentic-ds-kit inside the page's <main>, and wire its data and callbacks.
 * Blocks are components, so nothing is copied. Cursor's variant @-mentions the contract path.
 */
export function blockPrompt(name: string, contract: BlockPromptContract, target: PatternPromptTarget): string {
  const path = `node_modules/agentic-ds-kit/contracts/${contract.id}.json`;
  const ref = target === "cursor" ? `@${path}` : path;
  const lines = [
    `Use the nistha ${name} block from agentic-ds-kit.`,
    "1. If agentic-ds-kit is not installed, run: npm install agentic-ds-kit",
    `2. Read ${ref} (props, a11y, doNot) before writing code.`,
    `3. Import it: import { ${name} } from "agentic-ds-kit"; and render it inside the page's <main>. It brings no app chrome.`,
    "4. Pass real data for its props and wire its callbacks to the app.",
  ];
  if (contract.intent) lines.push("", `What it is: ${contract.intent}`);
  if (contract.snippet) lines.push("", "Usage:", contract.snippet);
  if (contract.doNot?.length) lines.push("", "Do not:", ...contract.doNot.map((item) => `- ${item}`));
  lines.push(
    "",
    "Keep the kit rules in AGENTS.md: import kit components from agentic-ds-kit (no local cousins), semantic tokens only, one solid primary Button per view.",
  );
  return lines.join("\n");
}
