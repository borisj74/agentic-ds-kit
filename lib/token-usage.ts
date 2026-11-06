import usage from "agentic-ds-kit/tokens/usage.json";

export interface TokenUsageNote {
  note: string;
  useWhen: string;
  doNot: string;
}

const tokens = usage.tokens as Record<string, TokenUsageNote>;
const families = usage.families as Record<string, TokenUsageNote>;

export function lookupTokenUsage(cssVar: string): TokenUsageNote {
  const exact = tokens[cssVar];
  if (exact) return exact;
  let best: TokenUsageNote | undefined;
  let bestLen = 0;
  for (const [prefix, note] of Object.entries(families)) {
    if (cssVar.startsWith(prefix) && prefix.length > bestLen) {
      best = note;
      bestLen = prefix.length;
    }
  }
  return (
    best ?? {
      note: "Semantic token.",
      useWhen: "The matching visual role",
      doNot: "Do not invent a local cousin",
    }
  );
}
