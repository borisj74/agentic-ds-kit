import type { Ref } from "react";

export type TagInputSize = "sm" | "md";

export interface TagInputProps {
  id: string;
  size?: TagInputSize;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  /** Optional suggestions while typing. Not a fixed option list — use MultiSelect for that. */
  suggestions?: string[];
  /** Keys that commit a tag, besides Enter. Default is a comma. */
  delimiters?: string[];
  name?: string;
  ariaLabel?: string;
  describedBy?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}
