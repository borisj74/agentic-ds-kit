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
}
