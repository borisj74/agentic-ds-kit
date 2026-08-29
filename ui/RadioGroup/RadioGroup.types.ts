export type RadioGroupSize = "sm" | "md" | "lg";
export type RadioGroupOrientation = "vertical" | "horizontal";

export interface RadioGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  legend: string;
  size?: RadioGroupSize;
  orientation?: RadioGroupOrientation;
  options: RadioGroupOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  hint?: string;
}
