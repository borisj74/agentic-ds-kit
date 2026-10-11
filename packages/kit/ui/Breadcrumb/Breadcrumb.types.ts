import type { ComponentPropsWithoutRef, Ref } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** In-app select. When set, the crumb is a button (or a link that does not navigate). */
  onClick?: () => void;
}

export type BreadcrumbSeparator = "chevron" | "slash";

/** Native nav attributes the kit sets itself (or replaces with its own prop). */
type BreadcrumbOwnedKeys = "children" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<nav>`. */
export interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<"nav">, BreadcrumbOwnedKeys> {
  items: BreadcrumbItem[];
  separator?: BreadcrumbSeparator;
  maxItems?: number;
  ref?: Ref<HTMLElement>;
}
