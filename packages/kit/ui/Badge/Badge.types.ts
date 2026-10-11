import type { ComponentPropsWithoutRef, Ref } from "react";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";
export type BadgeSize = "sm" | "md" | "lg";

/** Native span attributes the kit sets itself (or replaces with its own prop). */
type BadgeOwnedKeys = "children" | "aria-disabled";

/** `ref`, `className` and other native attributes land on the root `<span>`. */
export interface BadgeProps extends Omit<ComponentPropsWithoutRef<"span">, BadgeOwnedKeys> {
  children: string;
  tone?: BadgeTone;
  size?: BadgeSize;
  removable?: boolean;
  disabled?: boolean;
  onRemove?: () => void;
  ref?: Ref<HTMLSpanElement>;
}
