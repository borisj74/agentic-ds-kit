export type PaginationSize = "sm" | "md";

export interface PaginationProps {
  page?: number;
  defaultPage?: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  showPages?: boolean;
  showLabels?: boolean;
  showPreviousNext?: boolean;
  size?: PaginationSize;
}
