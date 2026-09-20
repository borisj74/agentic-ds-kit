export type CalendarSize = "sm" | "md" | "lg";

export interface CalendarProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (date: string) => void;
  start?: string;
  end?: string;
  size?: CalendarSize;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}
