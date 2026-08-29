export type SelectSize = "md" | "sm";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id: string;
  size?: SelectSize;
  options: SelectOption[];
  disabled?: boolean;
  error?: boolean;
  defaultValue?: string;
  name?: string;
  ariaLabel?: string;
}
