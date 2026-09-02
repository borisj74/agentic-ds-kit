import type { ReactNode } from "react";

export type AppHeaderRadius = "md" | "none";

export interface AppHeaderProps {
  /** Product name next to the mark. Ignored as a heading — this is chrome, not PageHeader. */
  title?: string;
  /** Brand letter. Defaults to the first character of title. Used when logo is omitted. */
  mark?: string;
  /** Custom mark or wordmark. Replaces the default letter mark. Pass the consumer’s logo here. */
  logo?: ReactNode;
  /** Show the centered kit Input. Default true. */
  search?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  defaultSearchValue?: string;
  /** Input onChange. */
  onSearch?: (value: string) => void;
  /** Decorative shortcut in the Input end slot, e.g. ⌘K. */
  searchShortcut?: string;
  searchId?: string;
  /** Trailing kit Buttons (and optional Avatar). At most one primary. */
  actions?: ReactNode;
  className?: string;
  ariaLabel?: string;
  /** Bar corners. none is flush; md is radius-surface-md. */
  radius?: AppHeaderRadius;
}
