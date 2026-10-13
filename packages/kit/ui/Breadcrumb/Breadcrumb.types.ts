import type { ComponentPropsWithoutRef, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export interface BreadcrumbItem {
  /** Visible text, and the accessible name when `iconOnly` hides it. */
  label: string;
  /** Lucide name (e.g. "House"), a Lucide component, or an element. Shown before the label. */
  icon?: KitIcon;
  /** Show only `icon` (e.g. a Home house). The label stays as the link's accessible name and hover title. */
  iconOnly?: boolean;
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
