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

export interface NavigationMenuProps {
  items: NavigationMenuItem[];
  onSelect?: (id: string) => void;
}
