export type DatePickerSize = "sm" | "md";

export interface DatePickerProps {
  id: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (date: string) => void;
  size?: DatePickerSize;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  minDate?: string;
  maxDate?: string;
  name?: string;
}
