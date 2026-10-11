import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

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

/** Root attributes the kit sets itself. `aria-label` is honoured when there is no `caption`. */
type TableOwnedKeys = "children" | "role" | "tabIndex" | "aria-labelledby";

/** `ref`, `className` and other attributes land on the scrollable region `<div>` that wraps the `<table>`. */
export interface TableProps extends Omit<ComponentPropsWithoutRef<"div">, TableOwnedKeys> {
  columns: TableColumn[];
  rows: Record<string, string | number | ReactNode>[];
  caption?: string;
  size?: TableSize;
  emptyLabel?: string;
  footer?: TableFooter;
  ref?: Ref<HTMLDivElement>;
}
