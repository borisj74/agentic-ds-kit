import type { ComponentPropsWithoutRef, Ref } from "react";

export type RedactionStatus = "pending" | "sent" | "cancelled" | "error";
export type RedactionLayout = "inline" | "split";

/** A sensitive value in the payload: characters [start, end) and its type, e.g. "email", "card", "apiKey". */
export interface RedactionSpan {
  start: number;
  end: number;
  type: string;
}

/** Mask on (true) or off (false) per type. Types not listed are masked. */
export type RedactionRules = Record<string, boolean>;

/** Native article attributes the kit sets itself (the root is a kit Card, or a one-line section once resolved). */
type RedactionPreviewOwnedKeys = "children" | "title" | "aria-labelledby";

export interface RedactionPreviewProps extends Omit<ComponentPropsWithoutRef<"article">, RedactionPreviewOwnedKeys> {
  /** Where the data goes, e.g. "Claude (Anthropic API)" or "Zendesk". */
  destination: string;
  /** Data region of the destination, e.g. "EU", "US". A Badge. */
  region?: string;
  /** Exactly what will be sent, as plain text. */
  payload: string;
  spans: RedactionSpan[];
  /** Mask per type. Default: every type masked. */
  rules?: RedactionRules;
  /** Types that always stay masked (secrets); their Switch is locked on. Default ["apiKey", "password", "secret"]. */
  lockedTypes?: string[];
  /** Why locked types stay masked. Shown as the Switch hint. */
  lockedReason?: string;
  /** Labels per type, e.g. { card: "Card number" }. Common types have defaults. */
  typeLabels?: Record<string, string>;
  onRulesChange?: (rules: RedactionRules) => void;
  /** Send, the one solid primary. Gets the payload with masked values replaced by "[type]". */
  onSend?: (maskedPayload: string) => void;
  onCancel?: () => void;
  /** sent and cancelled fold to one line. error keeps the card, shows a danger Alert and turns Send into Try again. */
  status?: RedactionStatus;
  /** status "error": why it failed, under "Couldn't send. Nothing left the product." */
  errorText?: string;
  /** status "error": Try again. Falls back to onSend when omitted. */
  onRetry?: () => void;
  /** inline (default): one payload with mask chips. split: Before (only you see it) and After (what is sent) side by side; on a narrow card After shows first and Before sits behind "Show before". */
  layout?: RedactionLayout;
  /** Characters kept at the end of masked values per type, e.g. { card: 4 } sends "[Card number •••• 4242]". Never applies to lockedTypes. */
  keepLast?: Record<string, number>;
  ref?: Ref<HTMLElement>;
}
