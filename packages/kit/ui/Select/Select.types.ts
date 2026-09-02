export type SelectSize = "sm" | "md";
export type SelectItemCheck = "check" | "checkbox";

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
  multiple?: boolean;
  itemCheck?: SelectItemCheck;
  maxVisible?: number;
  searchable?: boolean;
  placeholder?: string;
  defaultValue?: string | string[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  name?: string;
  ariaLabel?: string;
  describedBy?: string;
}
