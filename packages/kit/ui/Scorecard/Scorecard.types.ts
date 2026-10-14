import type { ComponentPropsWithoutRef, MouseEventHandler, Ref } from "react";
import type { BadgeTone } from "../Badge/Badge.types";

export type ScorecardTrend = "up" | "down" | "flat" | "neutral";

export type ScorecardSize = "sm" | "md" | "lg";

/** Delta color when it is not the trend's (up green, down red). */
export type ScorecardDeltaTone = "success" | "warning" | "danger" | "neutral";

/** Native article attributes the kit sets itself (or replaces with its own prop). */
type ScorecardOwnedKeys = "children" | "onClick" | "aria-labelledby";

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
  fill?: boolean;
  ref?: Ref<HTMLElement>;
}
