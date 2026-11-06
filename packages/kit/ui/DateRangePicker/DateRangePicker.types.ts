import type { Ref } from "react";
import type { DateRange, DateRangePreset } from "./dateRange";

export type { DateRange, DateRangePreset } from "./dateRange";

export type DateRangePickerSize = "sm" | "md";

export interface DateRangePickerProps {
  id: string;
  size?: DateRangePickerSize;
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange) => void;
  /**
   * Replaces the built-in presets (Today, Yesterday, Last 7 days, Last 30 days, This month, Last month).
   * Pass an empty array for the month grid only — prefer DatePicker mode=range for that.
   */
  presets?: DateRangePreset[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  minDate?: string;
  maxDate?: string;
  name?: string;
  describedBy?: string;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}
