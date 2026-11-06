import type { HourCycle } from "./time";

export type { HourCycle } from "./time";

export type TimePickerSize = "sm" | "md";

export interface TimePickerProps {
  id: string;
  size?: TimePickerSize;
  /** 24-hour HH:mm. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  hourCycle?: HourCycle;
  disabled?: boolean;
  error?: boolean;
  name?: string;
  describedBy?: string;
  ariaLabel?: string;
  className?: string;
}
