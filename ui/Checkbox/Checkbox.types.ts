export type CheckboxSize = "lg" | "md" | "sm";

export interface CheckboxProps {
  id: string;
  label?: string;
  ariaLabel?: string;
  size?: CheckboxSize;
  disabled?: boolean;
  error?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
}
