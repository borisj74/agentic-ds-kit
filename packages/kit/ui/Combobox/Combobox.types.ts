import type { Ref } from "react";

export type ComboboxSize = "sm" | "md";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  id: string;
  size?: ComboboxSize;
  options: ComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  /** Controlled value. Empty string is nothing selected. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /**
   * Fired as the query changes. When set, the list is not filtered locally:
   * the parent replaces `options` (async search).
   */
  onQueryChange?: (query: string) => void;
  loading?: boolean;
  emptyLabel?: string;
  /** Enter commits the typed text when nothing is highlighted. */
  allowCustomValue?: boolean;
  name?: string;
  ariaLabel?: string;
  describedBy?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}
