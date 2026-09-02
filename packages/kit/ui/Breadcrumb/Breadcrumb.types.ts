export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** In-app select. When set, the crumb is a button (or a link that does not navigate). */
  onClick?: () => void;
}

export type BreadcrumbSeparator = "chevron" | "slash";

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: BreadcrumbSeparator;
  maxItems?: number;
}
