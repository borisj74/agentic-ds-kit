import type { ReactNode } from "react";

export type TableSize = "sm" | "md" | "lg";
export type TableAlign = "start" | "end";

export interface TableColumn {
  key: string;
  header: string;
  align?: TableAlign;
  numeric?: boolean;
  emphasis?: boolean;
}

export interface TableFooter {
  label: string;
  value: string | number;
}

export interface TableProps {
  columns: TableColumn[];
  rows: Record<string, string | number | ReactNode>[];
  caption?: string;
  size?: TableSize;
  emptyLabel?: string;
  footer?: TableFooter;
}
