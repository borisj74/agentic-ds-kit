import type { ComponentPropsWithoutRef, Ref } from "react";

export type PaginationSize = "sm" | "md";

/** Native nav attributes the kit sets itself (or replaces with its own prop). */
type PaginationOwnedKeys = "children";

/** `ref`, `className` and other native attributes go to the `<nav>`. `aria-label` defaults to "Pagination". */
export interface PaginationProps extends Omit<ComponentPropsWithoutRef<"nav">, PaginationOwnedKeys> {
  page?: number;
  defaultPage?: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  showPages?: boolean;
  showLabels?: boolean;
  showPreviousNext?: boolean;
  size?: PaginationSize;
  /**
   * Narrow layout for small screens: icon-only Previous and Next around a "2 of 10" status.
   * Ignores showPages and showLabels.
   */
  compact?: boolean;
  ref?: Ref<HTMLElement>;
}
