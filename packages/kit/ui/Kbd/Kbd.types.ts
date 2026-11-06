import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/** Native kbd attributes the kit sets itself. */
type KbdOwnedKeys = "children";

/** `ref`, `className` and other native attributes land on the root `<kbd>`. */
export interface KbdProps extends Omit<ComponentPropsWithoutRef<"kbd">, KbdOwnedKeys> {
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}
