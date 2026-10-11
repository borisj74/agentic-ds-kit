import type { ComponentPropsWithoutRef, Ref } from "react";

export type AlertVariant = "info" | "success" | "warning" | "danger";

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type AlertOwnedKeys = "children" | "title" | "role";

/** `ref`, `className` and other native attributes land on the root `<div>`. */
export interface AlertProps extends Omit<ComponentPropsWithoutRef<"div">, AlertOwnedKeys> {
  children: string;
  variant?: AlertVariant;
  title?: string;
  ref?: Ref<HTMLDivElement>;
}
