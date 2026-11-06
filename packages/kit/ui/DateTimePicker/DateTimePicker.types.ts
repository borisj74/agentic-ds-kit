import type { HourCycle } from "../TimePicker/time";

export type DateTimePickerSize = "sm" | "md";

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
  name?: string;
  describedBy?: string;
  placeholder?: string;
  className?: string;
}
