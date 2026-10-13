import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export type AppHeaderRadius = "md" | "none";

/** Native header attributes the kit sets itself (or replaces with its own prop). */
type AppHeaderOwnedKeys = "children" | "title" | "aria-label";

/** `ref`, `className` and other native attributes go to the `<header>`. */
export interface AppHeaderProps extends Omit<ComponentPropsWithoutRef<"header">, AppHeaderOwnedKeys> {
  /** Product name next to the mark. Ignored as a heading — this is chrome, not PageHeader. */
  title?: string;
  /** Brand letter. Defaults to the first character of title. Used when logo is omitted. */
  mark?: string;
  /** Icon mark instead of the letter, on the same brand fill: a Lucide name (e.g. "Receipt"), component, or element. Used when logo is omitted. */
  markIcon?: KitIcon;
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

/* ---------- Building blocks (AppHeader.Root, .Brand, .Title, .Search, .Center, .Actions, .Spacer, .Mark) ---------- */

/** `ref`, `className` and other native attributes go to the `<header>`. */
export interface AppHeaderRootProps extends Omit<ComponentPropsWithoutRef<"header">, "aria-label"> {
  /** Blocks in bar order: Brand (start), Search / Center / Spacer (center, optional), Actions (end). */
  children?: ReactNode;
  /** Names the header landmark. Default "Application". */
  ariaLabel?: string;
  /** Bar corners. none is flush; md is radius-surface-md. */
  radius?: AppHeaderRadius;
  ref?: Ref<HTMLElement>;
}

/** Start column: the brand cell (mark or logo, on the SideNav rail axis), then children (usually AppHeader.Title). */
export interface AppHeaderBrandProps extends ComponentPropsWithoutRef<"div"> {
  /** Brand letter in the rail-width cell. Ignored when logo or markIcon is set. */
  mark?: string;
  /** Icon mark (Lucide name, component, or element) on the brand fill. Ignored when logo is set. */
  markIcon?: KitIcon;
  /** Custom mark or wordmark in the rail-width cell. Replaces the letter mark. */
  logo?: ReactNode;
  /** After the brand cell: AppHeader.Title, a workspace switcher, a Badge. */
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/** Letter mark: brand fill, aria-hidden. Use inside logo slots (e.g. as the wide-screen children of a narrow-screen menu trigger). */
export interface AppHeaderMarkProps extends ComponentPropsWithoutRef<"span"> {
  children?: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}

/** Product name. A `<p>`, not a heading: page titles belong on PageHeader. */
export interface AppHeaderTitleProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
  ref?: Ref<HTMLParagraphElement>;
}

/** Center column for any content (a view switcher, tabs). Stacks under the bar in narrow containers. */
export interface AppHeaderCenterProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/** Native input attributes the kit sets itself (or replaces with its own prop). */
type AppHeaderSearchOwnedKeys =
  | "children"
  | "size"
  | "type"
  | "onChange"
  | "value"
  | "defaultValue"
  | "id"
  | "placeholder"
  | "aria-label"
  | "aria-invalid"
  | "aria-describedby";

/**
 * Center column with the kit search Input. Form-control passthrough: `ref` and native
 * attributes go to the `<input>`; `className` goes to the center column.
 */
export interface AppHeaderSearchProps extends Omit<ComponentPropsWithoutRef<"input">, AppHeaderSearchOwnedKeys> {
  /** Placeholder and accessible name. Default "Search". */
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  /** Input onChange. */
  onSearch?: (value: string) => void;
  /** Decorative shortcut hint in the Input end slot, e.g. ⌘K. Not a keybinding. */
  shortcut?: string;
  /** Input id. Generated when omitted. */
  id?: string;
  /** Accessible name when it should differ from placeholder. */
  ariaLabel?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

/** End column: kit Buttons, Avatar. A group labelled "Actions" when it has children. */
export interface AppHeaderActionsProps extends Omit<ComponentPropsWithoutRef<"div">, "aria-label" | "role"> {
  children?: ReactNode;
  /** Group label. Default "Actions". */
  ariaLabel?: string;
  ref?: Ref<HTMLDivElement>;
}

/** Empty center column: keeps the three-column rhythm without search. Hidden in narrow containers. */
export interface AppHeaderSpacerProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  ref?: Ref<HTMLDivElement>;
}
