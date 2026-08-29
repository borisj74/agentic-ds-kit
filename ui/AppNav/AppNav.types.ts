export interface AppNavItem {
  href: string;
  label: string;
  active?: boolean;
}

export interface AppNavProps {
  title: string;
  items: AppNavItem[];
}
