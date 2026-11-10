import type { ComponentPropsWithoutRef, Ref } from "react";

export type ApprovalCardRisk = "low" | "medium" | "high";
export type ApprovalCardStatus = "pending" | "approved" | "denied" | "expired";

/** One line of a diff preview. */
export interface ApprovalCardDiffLine {
  type: "context" | "add" | "remove";
  text: string;
}

/** A shell command the agent wants to run. */
export interface ApprovalCardCommand {
  kind: "command";
  /** The exact command, shown after a `$` prompt. */
  command: string;
  /** Optional comment under the command, e.g. "applies 2 migrations · drops a column". */
  note?: string;
  /** Where it runs, e.g. "acme-demo / staging". */
  target?: string;
}

/** A file edit the agent wants to make. */
export interface ApprovalCardDiff {
  kind: "diff";
  /** File path shown in the preview header. */
  file: string;
  lines: ApprovalCardDiffLine[];
}

export type ApprovalCardAction = ApprovalCardCommand | ApprovalCardDiff;

/** Native article attributes the kit sets itself (or replaces with its own prop). */
type ApprovalCardOwnedKeys = "children" | "title" | "aria-labelledby" | "aria-describedby" | "onKeyDown";

/** `ref`, `className` and other native attributes land on the root `<article>`. */
export interface ApprovalCardProps extends Omit<ComponentPropsWithoutRef<"article">, ApprovalCardOwnedKeys> {
  /** The question, e.g. "Run database migration?". */
  title: string;
  description?: string;
  risk?: ApprovalCardRisk;
  /** Exactly what will run: a command or a diff. */
  action: ApprovalCardAction;
  status?: ApprovalCardStatus;
  /** Seconds until auto-deny. The card counts down and calls onExpire (or onDeny) at 0. */
  countdownSec?: number;
  onApprove?: () => void;
  onDeny?: () => void;
  /** Called when the countdown reaches 0. Falls back to onDeny. */
  onExpire?: () => void;
  /** Resolved row: who decided, e.g. "you". */
  resolvedBy?: string;
  /** Resolved row: when, e.g. "2s ago". */
  resolvedAt?: string;
  approveLabel?: string;
  denyLabel?: string;
  ref?: Ref<HTMLElement>;
}
