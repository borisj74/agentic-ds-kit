import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { BreadcrumbItem, BreadcrumbSeparator } from "../Breadcrumb";
import type { KitIcon } from "../Button/lucideName";

/** A secondary page action: an outline Button when there is room, a ⋯ menu item on narrow screens. */
export interface PageHeaderOverflowAction {
  id: string;
  label: string;
  icon?: KitIcon;
  onSelect: () => void;
  disabled?: boolean;
}

/** Native header attributes the kit sets itself (or replaces with its own prop). */
type PageHeaderOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<header>`. */
export interface PageHeaderProps extends Omit<ComponentPropsWithoutRef<"header">, PageHeaderOwnedKeys> {
  title: string;
  /**
   * One line under the title. A string, or inline nodes such as a lucide icon (default strokeWidth 2)
   * before a short scope line. It renders inside a `<p>`, so no blocks, lists or buttons.
   */
  subtitle?: ReactNode;
  /** Short sentence-case line above the title. Breadcrumbs are the default where-am-I. */
  eyebrow?: string;
  /** Any node in a wrapping row on the right: Buttons, a search Input, a Select. At most one primary Button. It stays in view on narrow screens. */
  actions?: ReactNode;
  /** Secondary actions: outline Buttons before `actions` when there is room, one ⋯ menu on narrow screens. */
  overflowActions?: PageHeaderOverflowAction[];
  /** Kit Tabs (size md, line) for the page's views, rendered under the title inside the header. */
  tabs?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbSeparator?: BreadcrumbSeparator;
  breadcrumbMaxItems?: number;
  ref?: Ref<HTMLElement>;
}
