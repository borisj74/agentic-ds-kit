import type { ComponentPropsWithoutRef, Ref } from "react";

export type GuardrailVerdict = "blocked" | "rewritten" | "flagged";
export type GuardrailOverrideStatus = "idle" | "sending" | "sent" | "error";

export interface GuardrailRule {
  /** Short name, e.g. "No refunds over €500". */
  name: string;
  /** The rule as written. */
  text: string;
  /** Who owns the rule and gets override requests, e.g. "Finance ops". */
  owner: string;
}

export interface GuardrailAgent {
  name: string;
  /** Avatar image. Initials when omitted. */
  src?: string;
}

export interface GuardrailEvent {
  id: string;
  verdict: GuardrailVerdict;
  rule: GuardrailRule;
  agent: GuardrailAgent;
  /** What happened and why in one line, e.g. "Blocked a $5,000 refund on INV-1842, over the $500 cap". The row title; rule, agent and time drop to the caption. */
  summary?: string;
  /** What the agent tried, exactly (a command, call or message). */
  attempted: string;
  /** For rewritten: what ran instead. */
  sentInstead?: string;
  /** When, as shown, e.g. "14:02" or "Mon 09:15". */
  at: string;
  runHref?: string;
}

/** Active filter values. Empty or undefined means any. */
export interface GuardrailFilters {
  verdict?: GuardrailVerdict;
  /** Rule name. */
  rule?: string;
  /** Agent name. */
  agent?: string;
  /** Time window label, e.g. "This week". Filtering by time is the caller's job: pass the events in the window. */
  time?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type GuardrailLogOwnedKeys = "children" | "title" | "aria-labelledby" | "onSelect";

export interface GuardrailLogProps extends Omit<ComponentPropsWithoutRef<"section">, GuardrailLogOwnedKeys> {
  /** Newest first. */
  events: GuardrailEvent[];
  /** Default "Guardrails". */
  title?: string;
  /** Uncontrolled (all any) when omitted. */
  filters?: GuardrailFilters;
  onFiltersChange?: (filters: GuardrailFilters) => void;
  /** Time windows offered in the Time filter. Default ["Today", "This week", "This month"]. */
  timeOptions?: string[];
  /** The event open in the Drawer. Uncontrolled when omitted. */
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Request override, after the AlertDialog confirms. */
  onRequestOverride?: (id: string, reason: string) => void;
  overrideStatus?: GuardrailOverrideStatus;
  /** One line for a header: the summary plus the latest event. */
  compact?: boolean;
  ref?: Ref<HTMLElement>;
}
