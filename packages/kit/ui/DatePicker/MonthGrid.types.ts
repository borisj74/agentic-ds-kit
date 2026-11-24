export type MonthGridSize = "sm" | "md" | "lg";

export interface MonthGridProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (date: string) => void;
  start?: string;
  end?: string;
  size?: MonthGridSize;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  /** First day of the week: 0 Sunday (default) or 1 Monday. */
  weekStart?: 0 | 1;
  /** Turns single days off (holidays, weekends): they are struck through and named unavailable. */
  isDateDisabled?: (date: string) => boolean;
  /** Controlled month shown, as YYYY-MM-01. Two grids side by side share one view this way. */
  view?: string;
  onViewChange?: (month: string) => void;
  /** Which month arrows to show. A left grid shows prev, a right grid next. Default both. */
  nav?: "both" | "prev" | "next";
  /** No card frame (border, shadow, padding): for a grid inside another overlay. */
  bare?: boolean;
  /** Controlled range-preview day, so hovering one grid previews the range in the other. */
  hoverDate?: string | null;
  onHoverDateChange?: (date: string | null) => void;
}
