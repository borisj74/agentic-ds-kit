import type { ComponentPropsWithoutRef, Ref } from "react";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "highlight";
export type BadgeAppearance = "soft" | "tint" | "solid" | "outline";
export type BadgeSize = "sm" | "md" | "lg";

/** Native span attributes the kit sets itself (or replaces with its own prop). */
type BadgeOwnedKeys = "children" | "aria-disabled";

/** `ref`, `className` and other native attributes land on the root `<span>`. */
export interface BadgeProps extends Omit<ComponentPropsWithoutRef<"span">, BadgeOwnedKeys> {
  children: string;
  tone?: BadgeTone;
  appearance?: BadgeAppearance;
  size?: BadgeSize;
  removable?: boolean;
  disabled?: boolean;
  onRemove?: () => void;
  ref?: Ref<HTMLSpanElement>;
}
