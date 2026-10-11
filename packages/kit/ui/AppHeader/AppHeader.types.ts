import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type AppHeaderRadius = "md" | "none";

/** Native header attributes the kit sets itself (or replaces with its own prop). */
type AppHeaderOwnedKeys = "children" | "title" | "aria-label";

/** `ref`, `className` and other native attributes go to the `<header>`. */
export interface AppHeaderProps extends Omit<ComponentPropsWithoutRef<"header">, AppHeaderOwnedKeys> {
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
  /**
   * Slot: replaces the start region (default brand: mark or logo, then title).
   * `title` still names the header landmark.
   */
  start?: ReactNode;
  /**
   * Slot: replaces the center region (default: the search Input when `search` is true).
   * Pass `null` for an empty center. Stacks under start/end in narrow containers like search does.
   */
  center?: ReactNode;
  /** Slot: replaces the end region (default: `actions`). Kept in a group labelled "Actions". */
  end?: ReactNode;
  className?: string;
  ariaLabel?: string;
  /** Bar corners. none is flush; md is radius-surface-md. */
  radius?: AppHeaderRadius;
  ref?: Ref<HTMLElement>;
}
