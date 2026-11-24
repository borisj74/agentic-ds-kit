import type { ComponentPropsWithoutRef, MouseEventHandler, Ref } from "react";
import type { BadgeTone } from "../Badge/Badge.types";
import type { DeltaGoodWhen } from "../Delta/Delta.types";

export type ScorecardTrend = "up" | "down" | "flat" | "neutral";

export type ScorecardSize = "sm" | "md" | "lg";

/** Delta color when it is not the trend's (up green, down red). */
export type ScorecardDeltaTone = "success" | "warning" | "danger" | "neutral";

/** Which way a change is good: `up` (pass rate, revenue) or `down` (cost, latency, churn). */
export type ScorecardGoodWhen = DeltaGoodWhen;

/** `card` is the framed tile. `plain` drops the frame for a divided strip (Scoreboard appearance divided). */
export type ScorecardAppearance = "card" | "plain";

/** How a selected card is announced: `toggle` (aria-pressed) or `radio` (role radio, aria-checked) inside a radiogroup. */
export type ScorecardSelectionRole = "toggle" | "radio";

/** How the sparkline draws. `plain` is the thin line (default). `reference` adds an area, faint grid, a dashed reference line, dots on the last points and start/end dates. `expressive` is a smooth curve with a soft area, an optional dashed previous period and an end dot with the value. */
export type ScorecardSparklineVariant = "plain" | "reference" | "expressive";

/** A dashed guide on a `reference` sparkline, e.g. a target. */
export interface ScorecardReference {
  value: number;
  /** Short text drawn above the start of the line, e.g. "Target $400k". */
  label: string;
}

/** Whether a meter is good when full (`higher`) or when it stays under its limit (`lower`). */
export type ScorecardMeterDirection = "higher" | "lower";

/** Progress toward a target or under a limit, drawn with kit Meter (bar, sm). */
export interface ScorecardMeter {
  value: number;
  /** The target (`higher`) or limit (`lower`). Must be above 0. */
  max: number;
  /** Text after the bar, e.g. "of $450k target" or "of 3.0% limit". */
  label: string;
  direction?: ScorecardMeterDirection;
}

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
  /**
   * Which way is good, passed to the kit Delta. With trend up or down the delta reads
   * "Better · +6.3 pts" (CircleCheck, neutral) or "Worse · +17%" (TriangleAlert, danger), so a
   * rising cost never reads as good news. `deltaTone` still overrides the colour. Flat and
   * neutral are not judged.
   */
  goodWhen?: ScorecardGoodWhen;
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
  /** How the sparkline draws. Default `plain`. */
  sparklineVariant?: ScorecardSparklineVariant;
  /** `reference` only: a dashed guide line with a label. */
  reference?: ScorecardReference;
  /** `expressive` only: the previous period, oldest first, drawn dashed in --chart-5 with a legend. */
  compare?: number[];
  /** `reference` only: darker dots on the last N points. */
  highlightLast?: number;
  /** `reference` only: start and end dates under the line, e.g. ["Aug 28", "Nov 20"]. */
  sparklineDates?: [string, string];
  /** A bar toward a target or under a limit in place of the sparkline. */
  meter?: ScorecardMeter;
  appearance?: ScorecardAppearance;
  fill?: boolean;
  ref?: Ref<HTMLElement>;
}
