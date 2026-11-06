import type { Ref } from "react";
import type { OptionItem } from "../shared/options";

export type MultiSelectSize = "sm" | "md";

export interface MultiSelectOption extends OptionItem {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  id: string;
  size?: MultiSelectSize;
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  /** After this many tags, the rest collapse into a Badge. */
  maxVisible?: number;
  name?: string;
  ariaLabel?: string;
  describedBy?: string;
  emptyLabel?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}
