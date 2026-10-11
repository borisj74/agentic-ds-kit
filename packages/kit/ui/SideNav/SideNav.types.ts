import type { ComponentPropsWithoutRef, Ref } from "react";

export type SideNavSide = "left" | "right";

export type SideNavRadius = "md" | "none";

export interface SideNavItem {
  id: string;
  label: string;
  href?: string;
  /** In-app select. When set, the leaf is a button and href is not used. */
  onClick?: () => void;
  /** Lucide name, via LucideByName from @/ui/Button/lucideName */
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
  /** One nested submenu level. */
  items?: SideNavItem[];
}

export interface SideNavGroup {
  label: string;
  items: SideNavItem[];
}

/** Native aside attributes the kit sets itself (or replaces with its own prop). */
type SideNavOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes go to the root `<aside>`. `aria-label` defaults to `title`. */
export interface SideNavProps extends Omit<ComponentPropsWithoutRef<"aside">, SideNavOwnedKeys> {
  title: string;
  /** Brand letter; default first char of title. */
  mark?: string;
  /** Brand header and close. Default true. Set false when AppHeader already provides brand. */
  showHeader?: boolean;
  /** Rail corners. Default md. Use none when SideNav is flush in an app shell. */
  radius?: SideNavRadius;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SideNavSide;
  groups?: SideNavGroup[];
  /** Flat list if no groups. */
  items?: SideNavItem[];
  /** Footer rows. One or many. */
  footer?: SideNavItem | SideNavItem[];
  ref?: Ref<HTMLElement>;
}
