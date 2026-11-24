import type { Ref } from "react";
import type { DateRange, DateRangePreset } from "./dateRange";

export type { DateRange, DateRangePreset } from "./dateRange";

export type DateRangePickerSize = "sm" | "md" | "lg";

export interface DateRangePickerProps {
  id: string;
  size?: DateRangePickerSize;
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange) => void;
  /**
   * Replaces the built-in presets (Today, Yesterday, Last 7 days, Last 30 days, This month, Last month).
   * Pass an empty array for the month grid only.
   */
  presets?: DateRangePreset[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  minDate?: string;
  maxDate?: string;
  /** First day of the week: 0 Sunday (default) or 1 Monday. */
  weekStart?: 0 | 1;
  /** Turns single days off (holidays, weekends). Those days are struck through and named unavailable. */
  isDateDisabled?: (date: string) => boolean;
  name?: string;
  describedBy?: string;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}
