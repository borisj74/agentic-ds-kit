import { contractFor } from "./component-guidance";
import { COMPONENT_GROUPS, componentLabel } from "./playground-nav";

export type PromptTarget = "claude-code" | "cursor" | "mcp";

export const PROMPT_TARGETS: { value: PromptTarget; label: string }[] = [
  { value: "claude-code", label: "Claude Code" },
  { value: "cursor", label: "Cursor" },
  { value: "mcp", label: "MCP" },
];

export interface AgentReads {
  /** a11y requirements: what every use has to keep. */
  must: string[];
  /** Prop defaults the agent gets without asking. */
  defaults: string[];
  /** doNot rules: where the agent stops and asks instead of inventing a cousin. */
  stopsIf: string[];
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function formatDefault(value: unknown): string {
  if (typeof value === "string") return value.length === 0 ? '""' : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export function componentGroupOf(id: string): string | null {
  return COMPONENT_GROUPS.find((group) => (group.ids as readonly string[]).includes(id))?.label ?? null;
}

export function contractStatus(id: string): string {
  const status = contractFor(id)?.status;
  return typeof status === "string" ? status : "stable";
}

export function contractIntent(id: string): string {
  const intent = contractFor(id)?.intent;
  return typeof intent === "string" ? intent : "";
}

export function contractSnippet(id: string): string {
  const snippet = contractFor(id)?.snippet;
  return typeof snippet === "string" ? snippet : "";
}

export function contractJson(id: string): string {
  const contract = contractFor(id);
  return contract ? JSON.stringify(contract, null, 2) : "";
}

export function contractUseWhen(id: string): { use: string[]; avoid: string[] } {
  const contract = contractFor(id);
  return { use: strings(contract?.useWhen), avoid: strings(contract?.doNotUseWhen) };
}

export function agentReads(id: string): AgentReads {
  const contract = contractFor(id);
  const a11y = record(contract?.a11y);
  const props = record(contract?.props) ?? {};
  const defaults = Object.entries(props).flatMap(([name, spec]) => {
    const value = record(spec)?.default;
    return value === undefined ? [] : [`${name} ${formatDefault(value)}`];
  });
  return {
    must: strings(a11y?.requirements),
    defaults,
    stopsIf: strings(contract?.doNot),
  };
}

const EXPORT_NAMES: Record<string, string> = {
  barchart: "BarChart",
  linechart: "LineChart",
  piechart: "PieChart",
};

/** The name the package exports. Chart labels in the nav are short ("Bar"), exports are not. */
export function exportName(id: string): string {
  return EXPORT_NAMES[id] ?? componentLabel(id);
}

export function importLine(id: string): string {
  return `import { ${exportName(id)} } from "agentic-ds-kit";`;
}

/** A short prompt that points the agent at the contract instead of pasting the whole kit. */
export function componentPrompt(id: string, target: PromptTarget): string {
  const name = exportName(id);
  const reads = agentReads(id);
  const path = `node_modules/agentic-ds-kit/contracts/${id}.json`;
  const source =
    target === "mcp"
      ? `Call get_component with name "${id}" on the agentic-ds-kit MCP server and follow what it returns.`
      : target === "cursor"
        ? `Read @${path} before writing code.`
        : `Read ${path} before writing code.`;
  const lines = [
    `Use the nistha ${name} from agentic-ds-kit. ${source}`,
    `${importLine(id)}`,
    `Do not build a local ${name}. Compose it through its props, slots and semantic tokens.`,
  ];
  if (reads.must.length) lines.push("", "Must:", ...reads.must.map((item) => `- ${item}`));
  if (reads.stopsIf.length) {
    lines.push("", "Stop and ask instead of doing any of these:", ...reads.stopsIf.map((item) => `- ${item}`));
  }
  return lines.join("\n");
}

export interface VariantProp {
  name: string;
  /** Enum values, when the prop is an enum. */
  values: string[];
  boolean: boolean;
}

/** Enum and boolean props from the contract: the props a variant card can differ by. */
export function variantProps(id: string): VariantProp[] {
  const props = record(contractFor(id)?.props) ?? {};
  return Object.entries(props).flatMap(([name, spec]) => {
    const r = record(spec);
    if (!r) return [];
    const values = strings(r.values);
    const isBoolean = r.type === "boolean";
    return values.length > 0 || isBoolean ? [{ name, values, boolean: isBoolean }] : [];
  });
}

const VALUE_ALIASES: Record<string, string> = {
  small: "sm",
  medium: "md",
  large: "lg",
  "extra large": "xl",
};

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter(Boolean);
}

/**
 * The props a variant card shows as chips, read from its title against the contract:
 * an enum value named in the title ("Outline" → appearance="outline", "Small" → size="sm"),
 * or a boolean prop named in it ("Disabled" → disabled, "Loading" → isLoading).
 * A title that names nothing in the contract gets no chips.
 */
export function variantChips(title: string, props: VariantProp[]): string[] {
  const titleWords = words(title);
  const joined = titleWords.join(" ");
  const aliased = new Set([...titleWords, ...Object.entries(VALUE_ALIASES).flatMap(([from, to]) => (joined.includes(from) ? [to] : []))]);
  const chips: string[] = [];
  for (const prop of props) {
    const value = prop.values.find((candidate) => {
      const normal = words(candidate).join(" ");
      return normal.length > 0 && (aliased.has(normal) || (normal.includes(" ") && joined.includes(normal)));
    });
    if (value !== undefined) {
      chips.push(`${prop.name}="${value}"`);
      continue;
    }
    if (prop.boolean) {
      const bare = prop.name.replace(/^(is|has|show|can)(?=[A-Z])/, "").toLowerCase();
      if (aliased.has(prop.name.toLowerCase()) || aliased.has(bare)) chips.push(prop.name);
    }
  }
  return chips;
}
