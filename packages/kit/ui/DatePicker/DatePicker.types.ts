export type DatePickerSize = "sm" | "md";
export type DatePickerMode = "single" | "range";

export interface DatePickerRange {
  start: string;
  end?: string;
}

interface DatePickerShared {
  id: string;
  size?: DatePickerSize;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  minDate?: string;
  maxDate?: string;
  name?: string;
  describedBy?: string;
}

export interface DatePickerSingleProps extends DatePickerShared {
  mode?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (date: string) => void;
}

export interface DatePickerRangeProps extends DatePickerShared {
  mode: "range";
  value?: DatePickerRange;
  defaultValue?: DatePickerRange;
  onValueChange?: (range: DatePickerRange) => void;
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;
