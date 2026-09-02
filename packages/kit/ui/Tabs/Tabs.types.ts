import type { ReactNode } from "react";

export type TabsSize = "sm" | "md" | "lg";
export type TabsVariant = "segmented" | "line";

export interface TabItem {
  id: string;
  label: string;
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  size?: TabsSize;
  variant?: TabsVariant;
  ariaLabel?: string;
}
