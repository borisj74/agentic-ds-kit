import type { ComponentPropsWithoutRef, Ref } from "react";

export type DoneCriterionStatus = "met" | "not_met" | "unverified" | "checking";

/** Proof for one check: a note, a link (PR, page, file) and/or tool output. */
export interface DoneEvidence {
  note?: string;
  href?: string;
  /** Link text. Default: the href. */
  hrefLabel?: string;
  /** Test or tool output, shown in a kit CodeSnippet. */
  output?: string;
  /** CodeSnippet title, e.g. "npm test". */
  outputLabel?: string;
}

export interface DoneCriterion {
  id: string;
  /** The agreed check, one line. */
  text: string;
  status: DoneCriterionStatus;
  evidence?: DoneEvidence;
  /** Why it is not met, in the agent's words. */
  reason?: string;
  /** Who set the status. "person" shows "set by you". Default "agent". */
  setBy?: "agent" | "person";
}

/** Native article attributes the kit sets itself (the root is a kit Card). */
type DoneCheckOwnedKeys = "children" | "title" | "aria-labelledby";

export interface DoneCheckProps extends Omit<ComponentPropsWithoutRef<"article">, DoneCheckOwnedKeys> {
  /** The task, e.g. "Update the EU price list". */
  title: string;
  criteria: DoneCriterion[];
  /** Mark met / Mark not met. The row then shows "set by you". */
  onOverride?: (id: string, status: "met" | "not_met") => void;
  onRecheck?: (id: string) => void;
  /** Accept result, the one solid primary when every check is met. */
  onAccept?: () => void;
  /** Send back to agent, the one solid primary otherwise. */
  onSendBack?: () => void;
  /** e.g. "Checked 14:02". */
  checkedAt?: string;
  ref?: Ref<HTMLElement>;
}
