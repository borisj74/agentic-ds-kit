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
