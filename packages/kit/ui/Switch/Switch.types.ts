export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps {
  id?: string;
  label?: string;
  ariaLabel?: string;
  size?: SwitchSize;
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  describedBy?: string;
}
