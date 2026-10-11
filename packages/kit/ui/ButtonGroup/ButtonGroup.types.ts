import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type ButtonGroupOwnedKeys = "role" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<div role="group">`. */
export interface ButtonGroupProps extends Omit<ComponentPropsWithoutRef<"div">, ButtonGroupOwnedKeys> {
  children: ReactNode;
  ariaLabel?: string;
  ref?: Ref<HTMLDivElement>;
}
