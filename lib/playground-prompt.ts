import catalog from "./kit-prompt-catalog.json";
import { generatePrimaryRamp } from "./primary-ramp";
import {
  PLAYGROUND_FONTS,
  PLAYGROUND_HEADING_WEIGHTS,
  readPlaygroundAppearance,
} from "./playground-theme";

const TOKEN_VARS = [
  "--bg-canvas",
  "--bg-subtle",
  "--bg-tray",
  "--bg-surface",
  "--bg-raised",
  "--bg-floating",
  "--bg-field",
  "--bg-control",
  "--bg-control-hover",
  "--bg-track",
  "--bg-inverse",
  "--text-fg",
  "--text-fg-muted",
  "--text-fg-subtle",
  "--text-fg-disabled",
  "--text-fg-inverse",
  "--line",
  "--line-default",
  "--line-strong",
  "--line-focus",
  "--primary-base",
  "--primary-hover",
  "--primary-active",
  "--primary-subtle",
  "--font-heading",
  "--font-body",
  "--font-mono",
  "--type-weight-heading",
  "--radius-base",
  "--radius-xs",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--shadow-xs",
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
] as const;

function computedTokens(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const styles = getComputedStyle(document.documentElement);
  const out: Record<string, string> = {};
  for (const name of TOKEN_VARS) {
    out[name] = styles.getPropertyValue(name).trim();
  }
  return out;
}

export function buildAiPrompt(): string {
  const appearance = readPlaygroundAppearance();
  const fontLabel = PLAYGROUND_FONTS.find((f) => f.value === appearance.font)?.label ?? appearance.font;
  const weightLabel =
    PLAYGROUND_HEADING_WEIGHTS.find((w) => w.value === appearance.headingWeight)?.label ??
    appearance.headingWeight;
  const tokens = computedTokens();
  const ramp =
    appearance.color === "custom" && appearance.primaryHex
      ? generatePrimaryRamp(appearance.primaryHex, appearance.theme === "dark")
      : null;

  const lines: string[] = [
    `# Agentic DS Kit prompt`,
    ``,
    `Use agentic-ds-kit. Code is the contract. Import from the package. Do not invent local cousins.`,
    ``,
    `## Active appearance`,
    `- theme: ${appearance.theme}`,
    `- color shortcut: ${appearance.color}${appearance.primaryHex ? ` (hex ${appearance.primaryHex})` : ""}`,
    `- font trio: ${fontLabel} → --font-heading / --font-body / --font-mono`,
    `- heading weight: ${weightLabel} (--type-weight-heading)`,
    `- radius-base: ${appearance.radiusBase}px`,
    `- shadow-sm: ${appearance.shadowSm}`,
    ``,
    `## Active tokens`,
    ...Object.entries(tokens).map(([name, value]) => `- ${name}: ${value}`),
  ];

  if (ramp) {
    lines.push(
      ``,
      `## Generated primary ramp`,
      `- base ${ramp.base} / hover ${ramp.hover} / active ${ramp.active}`,
      `- subtle ${ramp.subtle} / on-primary ${ramp.onPrimary}`,
    );
  }

  lines.push(``, `## Closed rules`, ...catalog.rules.map((rule) => `- ${rule}`));

  lines.push(``, `## Contracts`);
  for (const contract of catalog.contracts) {
    lines.push(`### ${contract.id} (${contract.group})`);
    lines.push(contract.intent);
    if (contract.useWhen?.length) lines.push(`Use when: ${contract.useWhen.join("; ")}`);
    if (contract.doNotUseWhen?.length) lines.push(`Not for: ${contract.doNotUseWhen.join("; ")}`);
    if (contract.doNot?.length) lines.push(`Do not: ${contract.doNot.join("; ")}`);
    if (contract.must?.length) lines.push(`Must: ${contract.must.join("; ")}`);
    if (contract.props) {
      const enums = Object.entries(contract.props)
        .filter(([, spec]) => spec.values)
        .map(([name, spec]) => `${name}: ${(spec.values as string[]).join("|")}`);
      if (enums.length) lines.push(`Enums: ${enums.join("; ")}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}

export async function copyAiPrompt(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildAiPrompt());
    return true;
  } catch {
    return false;
  }
}
