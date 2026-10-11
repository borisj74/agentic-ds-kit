import type { ComponentPropsWithoutRef, Ref } from "react";

export interface AppNavLeaf {
  href: string;
  label: string;
  active?: boolean;
}

/** A nav link, optionally with one nested subgroup of leaves. */
export interface AppNavItem extends AppNavLeaf {
  items?: AppNavLeaf[];
}

export interface AppNavGroup {
  label: string;
  defaultOpen?: boolean;
  items: AppNavItem[];
}

/** Native nav attributes the kit sets itself (or replaces with its own prop). */
type AppNavOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes go to the `<nav>`. `aria-label` defaults to "Application". */
export interface AppNavProps extends Omit<ComponentPropsWithoutRef<"nav">, AppNavOwnedKeys> {
  title?: string;
  /** Flat list for simple shells (e.g. list-detail). Ignored when `groups` is provided. */
  items?: AppNavItem[];
  /** Grouped catalog nav for docs/playground shells. Takes precedence over `items`. */
  groups?: AppNavGroup[];
  ref?: Ref<HTMLElement>;
}
