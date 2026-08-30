import type { ReactNode } from "react";
import type { BreadcrumbItem, BreadcrumbSeparator } from "@/ui/Breadcrumb";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbSeparator?: BreadcrumbSeparator;
  breadcrumbMaxItems?: number;
}
