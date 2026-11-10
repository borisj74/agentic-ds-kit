import type { ComponentPropsWithoutRef, Ref } from "react";

export type InlineDiffStatus = "pending" | "accepted" | "rejected" | "stale" | "loading" | "error" | "empty";
export type InlineDiffMode = "unified" | "split" | "inline";

export interface DiffLine {
  type: "context" | "add" | "remove";
  text: string;
  /** Line number in the old file (context and remove). */
  oldNo?: number;
  /** Line number in the new file (context and add). */
  newNo?: number;
}

/** A piece of an inline (prose) edit. */
export interface DiffSegment {
  type: "same" | "add" | "remove";
  text: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type InlineDiffOwnedKeys = "children" | "title" | "aria-labelledby" | "onKeyDown";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface InlineDiffProps extends Omit<ComponentPropsWithoutRef<"section">, InlineDiffOwnedKeys> {
  /** e.g. "Proposed edit · calcTotal" */
  title: string;
  mode?: InlineDiffMode;
  /** unified / split: file path in the hunk header. */
  file?: string;
  /** e.g. "@@ -41,2 +41,3 @@ calcTotal" */
  hunkHeader?: string;
  lines?: DiffLine[];
  /** inline mode: prose with removed and added phrases. */
  segments?: DiffSegment[];
  status?: InlineDiffStatus;
  /** Footer note, e.g. "1 of 2 hunks". */
  hunkLabel?: string;
  /** stale: why, e.g. "invoice.ts changed after this edit was proposed. Ask for a fresh diff." */
  staleReason?: string;
  errorMessage?: string;
  onRetry?: () => void;
  /** Accept: the one solid primary; ⌘/Ctrl+Enter in the card. */
  onAccept?: () => void;
  /** Reject: Escape in the card. */
  onReject?: () => void;
  onAcceptAll?: () => void;
  /** Resolved line detail, e.g. "calcTotal · +2 −1 · src/billing/invoice.ts". */
  resolvedSummary?: string;
  resolvedAt?: string;
  ref?: Ref<HTMLElement>;
}
