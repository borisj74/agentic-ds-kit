import type { ComponentPropsWithoutRef, Ref } from "react";
import type { DropdownMenuGroup } from "../DropdownMenu/DropdownMenu.types";

export interface NavigationMenuLinkItem {
  id: string;
  label: string;
  href: string;
  active?: boolean;
}

export interface NavigationMenuDropdownItem {
  id: string;
  label: string;
  groups: DropdownMenuGroup[];
  columns?: 1 | 2;
}

export type NavigationMenuItem = NavigationMenuLinkItem | NavigationMenuDropdownItem;

/** Native nav attributes the kit sets itself (or replaces with its own prop). */
type NavigationMenuOwnedKeys = "children" | "onSelect";

/** `ref`, `className` and other native attributes go to the `<nav>`. `aria-label` defaults to "Site". */
export interface NavigationMenuProps extends Omit<ComponentPropsWithoutRef<"nav">, NavigationMenuOwnedKeys> {
  items: NavigationMenuItem[];
  onSelect?: (id: string) => void;
  ref?: Ref<HTMLElement>;
}
