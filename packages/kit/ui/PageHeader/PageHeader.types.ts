import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { BreadcrumbItem, BreadcrumbSeparator } from "../Breadcrumb";

/** Native header attributes the kit sets itself (or replaces with its own prop). */
type PageHeaderOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<header>`. */
export interface PageHeaderProps extends Omit<ComponentPropsWithoutRef<"header">, PageHeaderOwnedKeys> {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbSeparator?: BreadcrumbSeparator;
  breadcrumbMaxItems?: number;
  ref?: Ref<HTMLElement>;
}
