export type RadioGroupOrientation = "vertical" | "horizontal";

export interface RadioGroupOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  name: string;
  legend: string;
  orientation?: RadioGroupOrientation;
  options: RadioGroupOption[];
  defaultValue?: string;
  disabled?: boolean;
}
