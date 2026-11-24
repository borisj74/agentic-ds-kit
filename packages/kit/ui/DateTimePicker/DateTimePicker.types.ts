import type { HourCycle } from "../TimePicker/time";

export type DateTimePickerSize = "sm" | "md" | "lg";

export interface DateTimeValue {
  /** YYYY-MM-DD */
  date?: string;
  /** HH:mm */
  time?: string;
}

export interface DateTimePickerProps {
  id: string;
  size?: DateTimePickerSize;
  value?: DateTimeValue;
  defaultValue?: DateTimeValue;
  onValueChange?: (value: DateTimeValue) => void;
  hourCycle?: HourCycle;
  disabled?: boolean;
  error?: boolean;
  /** Earliest day the grid offers, YYYY-MM-DD. Days before it are struck through and unavailable. */
  minDate?: string;
  /** Latest day the grid offers, YYYY-MM-DD. */
  maxDate?: string;
  name?: string;
  describedBy?: string;
  placeholder?: string;
  className?: string;
}
