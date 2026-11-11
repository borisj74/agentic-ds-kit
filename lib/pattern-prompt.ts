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
