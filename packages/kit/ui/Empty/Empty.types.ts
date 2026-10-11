import type { KitIcon } from "../Button/lucideName";
import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type EmptyOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<div>`. */
export interface EmptyProps extends Omit<ComponentPropsWithoutRef<"div">, EmptyOwnedKeys> {
  title: string;
  description?: string;
  icon?: KitIcon;
  media?: ReactNode;
  actions?: ReactNode;
  outlined?: boolean;
  ref?: Ref<HTMLDivElement>;
}
