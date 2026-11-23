import type { Ref } from "react";

export type TagInputSize = "sm" | "md" | "lg";

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
  /** Most tags allowed. Shows a count (3/8) and blocks adds past it with a message. */
  maxTags?: number;
  name?: string;
  ariaLabel?: string;
  describedBy?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}
