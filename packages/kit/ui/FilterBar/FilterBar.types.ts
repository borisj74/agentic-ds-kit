import type { ReactNode } from "react";

export type FilterBarSize = "sm" | "md" | "lg";

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
  /** First in the row, before the chips: a kit Combobox or search Input. */
  leading?: ReactNode;
  /** The same fields stacked for a narrow screen. When set, a bar narrower than
   *  --grid-breakpoint-sm shows one Filters chip with the applied count, which opens these
   *  in a bottom kit Drawer with Clear all and Apply. */
  renderSheet?: () => ReactNode;
  /** Apply in the sheet. The sheet closes after it. */
  onApply?: () => void;
  applyLabel?: string;
  ariaLabel?: string;
  className?: string;
}
