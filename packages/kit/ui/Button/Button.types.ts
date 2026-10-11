import type { KitIcon } from "./lucideName";
import type { ComponentPropsWithoutRef, DragEventHandler, MouseEventHandler, Ref } from "react";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonType = "button" | "submit" | "reset";
export type ButtonShape = "default" | "pill";

/** Native button attributes the kit sets itself. */
type ButtonOwnedKeys = "children" | "type" | "aria-label" | "aria-disabled" | "onClick";

interface ButtonBase extends Omit<ComponentPropsWithoutRef<"button">, ButtonOwnedKeys> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  block?: boolean;
  disabled?: boolean;
  type?: ButtonType;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  iconStart?: KitIcon;
  iconEnd?: KitIcon;
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
