import type { ButtonSize, ButtonVariant } from "../Button/Button.types";

export type DropdownMenuAlign = "start" | "end";
export type DropdownMenuTriggerStyle = "button" | "field" | "nav";

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  description?: string;
  href?: string;
  selected?: boolean;
  checkbox?: boolean;
  submenu?: DropdownMenuGroup[];
}

export interface DropdownMenuGroup {
  heading?: string;
  items: DropdownMenuItem[];
}

export interface DropdownMenuProps {
  trigger?: string;
  triggerStyle?: DropdownMenuTriggerStyle;
  iconStart?: string;
  iconEnd?: string;
  id?: string;
  disabled?: boolean;
  error?: boolean;
  describedBy?: string;
  ariaLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  align?: DropdownMenuAlign;
  columns?: 1 | 2;
  groups: DropdownMenuGroup[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (id: string) => void;
  closeOnSelect?: boolean;
  triggerMuted?: boolean;
  triggerBadge?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}
