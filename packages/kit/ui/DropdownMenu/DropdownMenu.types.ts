import type { ComponentPropsWithoutRef, DragEventHandler, Ref } from "react";
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

/** Removable kit Tag shown in a field trigger (Select valueDisplay="tags"). */
export interface DropdownMenuTriggerTag {
  id: string;
  label: string;
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
  triggerTags?: DropdownMenuTriggerTag[];
  onTriggerTagRemove?: (id: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  triggerDraggable?: boolean;
  onTriggerDragStart?: DragEventHandler<HTMLButtonElement>;
  onTriggerDragEnd?: DragEventHandler<HTMLButtonElement>;
  /** @internal Select's pass-through: merged onto the root. K24 owns DropdownMenu's own escape hatches. */
  className?: string;
  /** @internal Select's pass-through: ref to the field trigger button (`triggerStyle="field"` only). */
  triggerRef?: Ref<HTMLButtonElement>;
  /** @internal Select's pass-through: spread on the field trigger button before kit attributes. */
  triggerProps?: ComponentPropsWithoutRef<"button">;
}
