import type { KitIcon } from "../Button/lucideName";
import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/** Why the region is empty. Sets the default icon, the role and the tile tint. Errors use LoadError. */
export type EmptyKind = "no-data" | "no-results" | "first-use" | "permission";

/** sm: inside a chart, list or table cell, no heading. md: a card body. lg: a page. */
export type EmptySize = "sm" | "md" | "lg";

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
  kind?: EmptyKind;
  size?: EmptySize;
  ref?: Ref<HTMLDivElement>;
}
