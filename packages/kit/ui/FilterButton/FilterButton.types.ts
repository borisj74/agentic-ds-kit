export type FilterButtonSize = "sm" | "md" | "lg";
export type FilterButtonToggle = "on" | "off";

export interface FilterButtonProps {
  size?: FilterButtonSize;
  open?: boolean;
  disabled?: boolean;
  count?: number;
  value?: string;
  toggle?: FilterButtonToggle;
  onToggle?: () => void;
  hasDropdown?: boolean;
  children: string;
  onClick?: () => void;
}
