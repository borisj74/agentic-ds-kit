import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { BreadcrumbItem, BreadcrumbSeparator } from "../Breadcrumb";

/** Native header attributes the kit sets itself (or replaces with its own prop). */
type PageHeaderOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<header>`. */
export interface PageHeaderProps extends Omit<ComponentPropsWithoutRef<"header">, PageHeaderOwnedKeys> {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Any node in a wrapping row on the right: Buttons, a search Input, a Select. At most one primary Button. */
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbSeparator?: BreadcrumbSeparator;
  breadcrumbMaxItems?: number;
  ref?: Ref<HTMLElement>;
}
