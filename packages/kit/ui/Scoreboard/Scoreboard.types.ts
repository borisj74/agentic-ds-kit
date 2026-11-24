import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ScorecardProps } from "../Scorecard/Scorecard.types";

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type ScoreboardOwnedKeys = "children" | "aria-label" | "defaultValue" | "onChange";

/** A Scorecard in the strip. With selectable, `id` names it for value and onValueChange (defaults to its label) and is not put on the DOM. */
export type ScoreboardItem = ScorecardProps;

/** `cards`: framed Scorecards with a gap. `divided`: one row of plain Scorecards split by thin rules. */
export type ScoreboardAppearance = "cards" | "divided";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface ScoreboardProps extends Omit<ComponentPropsWithoutRef<"section">, ScoreboardOwnedKeys> {
  items: ScoreboardItem[];
  /** @deprecated Has no effect. Scoreboard no longer scrolls: more than four figures wrap. */
  scroll?: boolean;
  appearance?: ScoreboardAppearance;
  /**
   * Turns the strip into a radiogroup: one card is checked, arrow keys move and check, Home/End
   * jump. Each card's onClick and selected are set by the strip. Use it to pick what a chart shows.
   */
  selectable?: boolean;
  /** Controlled checked item (its `id`, or label). Selectable only. */
  value?: string;
  /** Uncontrolled first checked item. Defaults to the first item. Selectable only. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  "aria-label"?: string;
  className?: string;
  ref?: Ref<HTMLElement>;
}
