import type { RedactionRules, RedactionSpan } from "./RedactionPreview.types";

/** Pure helpers behind RedactionPreview. No React here. */

export const DEFAULT_LOCKED = ["apiKey", "password", "secret"];

const DEFAULT_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  name: "Name",
  address: "Address",
  card: "Card number",
  iban: "IBAN",
  apiKey: "API key",
  password: "Password",
  secret: "Secret",
  ip: "IP address",
  dob: "Date of birth",
};

export function typeLabel(type: string, labels: Record<string, string> = {}): string {
  if (labels[type]) return labels[type];
  if (DEFAULT_LABELS[type]) return DEFAULT_LABELS[type];
  const words = type.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}

/** Spans in order, clipped to the payload, overlaps dropped (first one wins). */
export function cleanSpans(payload: string, spans: RedactionSpan[]): RedactionSpan[] {
  const sorted = spans
    .map((s) => ({ ...s, start: Math.max(0, s.start), end: Math.min(payload.length, s.end) }))
    .filter((s) => s.end > s.start)
    .sort((a, b) => a.start - b.start || b.end - a.end);
  const out: RedactionSpan[] = [];
  let cursor = 0;
  for (const span of sorted) {
    if (span.start < cursor) continue;
    out.push(span);
    cursor = span.end;
  }
  return out;
}

/** True when this type goes out masked. Locked types always do. */
export function isMasked(type: string, rules: RedactionRules = {}, locked: string[] = DEFAULT_LOCKED): boolean {
  return locked.includes(type) || rules[type] !== false;
}

/**
 * A span segment's `key` names the value, not its position: type, the masked text and which
 * occurrence of that text it is. It stays the same when the payload or spans are reordered.
 */
export type Segment = { kind: "text"; text: string } | { kind: "span"; text: string; span: RedactionSpan; index: number; key: string };

/** Payload cut into plain text and sensitive spans. */
export function segments(payload: string, spans: RedactionSpan[]): Segment[] {
  const out: Segment[] = [];
  const seen = new Map<string, number>();
  let cursor = 0;
  cleanSpans(payload, spans).forEach((span, index) => {
    if (span.start > cursor) out.push({ kind: "text", text: payload.slice(cursor, span.start) });
    const text = payload.slice(span.start, span.end);
    const value = JSON.stringify([span.type, text]);
    const occurrence = seen.get(value) ?? 0;
    seen.set(value, occurrence + 1);
    out.push({ kind: "span", text, span, index, key: `${value}#${occurrence}` });
    cursor = span.end;
  });
  if (cursor < payload.length) out.push({ kind: "text", text: payload.slice(cursor) });
  return out;
}

/** What actually leaves: masked spans replaced by "[type]". */
export function maskedPayload(payload: string, spans: RedactionSpan[], rules: RedactionRules = {}, locked: string[] = DEFAULT_LOCKED): string {
  return segments(payload, spans)
    .map((seg) => (seg.kind === "span" && isMasked(seg.span.type, rules, locked) ? `[${seg.span.type}]` : seg.text))
    .join("");
}

/** Count per type, in first-seen order: [{ type, count }]. */
export function typeCounts(payload: string, spans: RedactionSpan[]): { type: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const span of cleanSpans(payload, spans)) counts.set(span.type, (counts.get(span.type) ?? 0) + 1);
  return [...counts].map(([type, count]) => ({ type, count }));
}

export function maskedCount(payload: string, spans: RedactionSpan[], rules: RedactionRules = {}, locked: string[] = DEFAULT_LOCKED): number {
  return cleanSpans(payload, spans).filter((s) => isMasked(s.type, rules, locked)).length;
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}
