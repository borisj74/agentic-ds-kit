import type { ComponentPropsWithoutRef, Ref } from "react";

export type AvatarSize = "sm" | "md" | "lg";

/** Native span attributes the kit sets itself (or replaces with its own prop). */
type AvatarOwnedKeys = "children" | "role" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<span>`. */
export interface AvatarProps extends Omit<ComponentPropsWithoutRef<"span">, AvatarOwnedKeys> {
  name: string;
  src?: string;
  initials?: string;
  size?: AvatarSize;
  ref?: Ref<HTMLSpanElement>;
}
