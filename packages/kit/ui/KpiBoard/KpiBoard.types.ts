import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ChartDatum } from "../shared/chartMath";
import type { DataTableColumn, DataTableRow } from "../DataTable/DataTable.types";
import type { ScorecardDeltaTone, ScorecardGoodWhen, ScorecardTrend } from "../Scorecard/Scorecard.types";

/** A time range the whole board switches to, e.g. { value: "30d", label: "30 days" }. */
export interface KpiBoardRange {
  value: string;
  label: string;
}

/** A metric's figures for one range. Pre-formatted: currency and units stay with the caller. */
export interface KpiBoardValue {
  value: string;
  delta?: string;
  trend?: ScorecardTrend;
  deltaTone?: ScorecardDeltaTone;
  /** Muted text after the delta for this range, e.g. "vs Oct". Default "last <range label>". */
  hint?: string;
}

/** One KPI: a Scorecard in the strip, and when selected, the chart and the table. */
export interface KpiBoardMetric {
  id: string;
  label: string;
  /**
   * Which way is good, passed through Scorecard to the kit Delta: "Better · +4.2%" or
   * "Worse · +18.0%". Up for revenue, down for overdue or churn.
   */
  goodWhen?: ScorecardGoodWhen;
  /** Figures per range value. A range with no entry shows "—". */
  values: Record<string, KpiBoardValue>;
  /** Columns of the table behind this metric (e.g. Customer, Revenue, Change). */
  columns: DataTableColumn[];
  /** Table heading, e.g. "Top customers". Default "Top rows". */
  rowsTitle?: string;
  /** Numeric column key to rank rows by, highest first. Without it rows keep their order. */
  rankBy?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type KpiBoardOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface KpiBoardProps extends Omit<ComponentPropsWithoutRef<"section">, KpiBoardOwnedKeys> {
  /** Three to six KPIs. Five or six wrap in the Scoreboard. */
  metrics: KpiBoardMetric[];
  /** Chart samples by metric id, then range value: series[metricId][range]. */
  series: Record<string, Record<string, ChartDatum[]>>;
  /** Table rows by metric id, then range value: rows[metricId][range]. Each row needs an `id`. */
  rows: Record<string, Record<string, DataTableRow[]>>;
  /** The range choices, in order. Two to four. */
  ranges: KpiBoardRange[];
  /** Controlled range. */
  range?: string;
  /** Uncontrolled starting range. Default the first range. */
  defaultRange?: string;
  onRangeChange?: (range: string) => void;
  /** Controlled selected metric id. */
  selectedMetric?: string;
  /** Uncontrolled starting metric. Default the first metric. */
  defaultSelectedMetric?: string;
  onSelectedMetricChange?: (metricId: string) => void;
  /** How many rows the table shows. Default 5. */
  rowLimit?: number;
  /** Line under the heading, e.g. "Acme · all regions". */
  description?: string;
  /** Block heading. Default "Key metrics". */
  title?: string;
  ref?: Ref<HTMLElement>;
}
