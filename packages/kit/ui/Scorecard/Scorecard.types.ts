import type { ComponentPropsWithoutRef, MouseEventHandler, Ref } from "react";
import type { BadgeTone } from "../Badge/Badge.types";

export type ScorecardTrend = "up" | "down" | "flat" | "neutral";

export type ScorecardSize = "sm" | "md" | "lg";

/** Delta color when it is not the trend's (up green, down red). */
export type ScorecardDeltaTone = "success" | "warning" | "danger" | "neutral";

/** `card` is the framed tile. `plain` drops the frame for a divided strip (Scoreboard appearance divided). */
export type ScorecardAppearance = "card" | "plain";

/** How a selected card is announced: `toggle` (aria-pressed) or `radio` (role radio, aria-checked) inside a radiogroup. */
export type ScorecardSelectionRole = "toggle" | "radio";

/** Native article attributes the kit sets itself (or replaces with its own prop). */
type ScorecardOwnedKeys = "children" | "onClick" | "aria-labelledby" | "aria-pressed";

/** `ref`, `className` and other native attributes land on the root: `<button>` when `onClick` is set, `<article>` otherwise. */
export interface ScorecardProps extends Omit<ComponentPropsWithoutRef<"article">, ScorecardOwnedKeys> {
  label: string;
  value: string;
  delta?: string;
  trend?: ScorecardTrend;
  /**
   * Override the delta color (default: from `trend`). E.g. `warning` for an amber "3 urgent"
   * count. The icon follows `trend`; with trend `neutral` a status icon shows instead of the dash.
   */
  deltaTone?: ScorecardDeltaTone;
  hint?: string;
  size?: ScorecardSize;
  badge?: string;
  badgeTone?: BadgeTone;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * With `onClick`: the card is a toggle in a picker (e.g. the metric a chart shows). Sets
   * `aria-pressed`, draws the selected style, and adds the badge to the button's name, so a
   * badge such as "In chart" on the selected card is read with it. Leave undefined otherwise.
   */
  selected?: boolean;
  /**
   * With `onClick` and `selected`: `toggle` (default) sets aria-pressed; `radio` sets role radio
   * and aria-checked for a card in a radiogroup. Scoreboard selectable sets radio itself.
   */
  selectionRole?: ScorecardSelectionRole;
  /**
   * A small trend line under the value, oldest first. Decorative (aria-hidden): the delta and hint
   * carry the meaning. Needs two or more finite numbers; others are skipped.
   */
  sparkline?: number[];
  appearance?: ScorecardAppearance;
  fill?: boolean;
  ref?: Ref<HTMLElement>;
}
