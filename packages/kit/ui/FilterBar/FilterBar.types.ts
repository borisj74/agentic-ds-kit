import type { ReactNode } from "react";

export type FilterBarSize = "sm" | "md";

export interface FilterBarFilter {
  id: string;
  /** Filter name, like Status. */
  label: string;
  /** Chosen value, shown after the name. */
  value?: string;
  /** How many values are applied. */
  count?: number;
}

export interface FilterBarProps {
  filters: FilterBarFilter[];
  /** Id of the filter whose options are open. */
  openId?: string;
  onFilterClick?: (id: string) => void;
  /** Options for one filter. When set, each chip opens them in a kit Popover anchored to the chip;
   *  openId and onFilterClick still say which one is open. */
  renderOptions?: (id: string) => ReactNode;
  onClear?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  clearLabel?: string;
  /** Extra filters collapse into a +N menu. */
  maxVisible?: number;
  size?: FilterBarSize;
  ariaLabel?: string;
  className?: string;
}
