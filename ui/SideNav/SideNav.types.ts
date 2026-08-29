export type SideNavSide = "left" | "right";

export interface SideNavItem {
  id: string;
  label: string;
  href?: string;
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

export interface SideNavProps {
  title: string;
  /** Brand letter; default first char of title. */
  mark?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SideNavSide;
  groups?: SideNavGroup[];
  /** Flat list if no groups. */
  items?: SideNavItem[];
  /** Footer rows. One or many. */
  footer?: SideNavItem | SideNavItem[];
}
