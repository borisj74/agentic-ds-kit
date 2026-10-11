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

/** Native button attributes the kit sets itself on the trigger (or replaces with its own prop). */
type DropdownMenuOwnedKeys =
  | "children"
  | "className"
  | "type"
  | "onClick"
  | "onSelect"
  | "draggable"
  | "onDragStart"
  | "onDragEnd"
  | "aria-label"
  | "aria-disabled"
  | "aria-haspopup"
  | "aria-expanded"
  | "aria-controls"
  | "aria-invalid"
  | "aria-describedby";

/**
 * `ref` and other native attributes go to the trigger button (always mounted, the control users focus).
 * `className` goes to the root wrapper. The menu panel stays kit-owned.
 */
export interface DropdownMenuProps extends Omit<ComponentPropsWithoutRef<"button">, DropdownMenuOwnedKeys> {
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
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  /** @internal Select's pass-through: merged with `ref` on the trigger button. */
  triggerRef?: Ref<HTMLButtonElement>;
  /** @internal Select's pass-through: spread on the trigger button before `rest` and kit attributes. */
  triggerProps?: ComponentPropsWithoutRef<"button">;
}
