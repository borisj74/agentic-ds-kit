export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type BreadcrumbSeparator = "chevron" | "slash";

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: BreadcrumbSeparator;
  maxItems?: number;
}
