import type { ComponentPropsWithoutRef, Ref } from "react";

export type FilterButtonSize = "sm" | "md" | "lg";
export type FilterButtonToggle = "on" | "off";

/** Native button attributes the kit sets itself (or replaces with its own prop). */
type FilterButtonOwnedKeys =
  | "children"
  | "className"
  | "type"
  | "value"
  | "onClick"
  | "onToggle"
  | "aria-pressed"
  | "aria-haspopup"
  | "aria-expanded"
  | "aria-label";

/**
 * `ref` and other native attributes go to the main `<button>` (the toggle half when split).
 * `className` goes to the visual root (the split wrapper `<span>`, else the button).
 */
export interface FilterButtonProps extends Omit<ComponentPropsWithoutRef<"button">, FilterButtonOwnedKeys> {
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
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}
