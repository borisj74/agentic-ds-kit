import type { KitIcon } from "./lucideName";
import type { ComponentPropsWithoutRef, DragEventHandler, MouseEventHandler, Ref } from "react";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonAppearance = "solid" | "outline" | "soft" | "ghost";
export type ButtonMode = "primary" | "neutral" | "danger";
export type ButtonType = "button" | "submit" | "reset";
export type ButtonShape = "default" | "pill";

/** Native button attributes the kit sets itself. */
type ButtonOwnedKeys = "children" | "type" | "aria-label" | "aria-disabled" | "onClick";

interface ButtonBase extends Omit<ComponentPropsWithoutRef<"button">, ButtonOwnedKeys> {
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  mode?: ButtonMode;
  /** Flat set: no elevation. Ghost is not used — coerced to soft. */
  flat?: boolean;
  shape?: ButtonShape;
  block?: boolean;
  disabled?: boolean;
  type?: ButtonType;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  iconStart?: KitIcon;
  iconEnd?: KitIcon;
  /**
   * Visual key hint after the label, e.g. "⏎", "Esc", "⌘⏎". Decorative (aria-hidden): the caller wires the
   * key itself and can set `aria-keyshortcuts`. Ignored on icon-only buttons.
   */
  shortcut?: string;
  draggable?: boolean;
  onDragStart?: DragEventHandler<HTMLButtonElement>;
  onDragEnd?: DragEventHandler<HTMLButtonElement>;
  ref?: Ref<HTMLButtonElement>;
}

export type ButtonProps =
  | (ButtonBase & {
      children: string;
      ariaLabel?: string;
    })
  | (ButtonBase & {
      children?: undefined;
      ariaLabel: string;
    });
