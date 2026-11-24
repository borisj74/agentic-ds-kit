import type { KitIcon } from "../Button/lucideName";
import type { ComponentPropsWithoutRef, Ref } from "react";
import type { BadgeTone } from "../Badge/Badge.types";

/** xs: compact 40px rows for dense cards (e.g. a dashboard "Needs attention" list). */
export type ListViewSize = "xs" | "sm" | "md";
/** Row priority. Drives the leading bar marker and starts the secondary line with its word. */
export type ListViewPriority = "high" | "medium" | "low";
/** none keeps the items order; priority orders rows high, medium, low, then unset, keeping input order within each. */
export type ListViewSort = "none" | "priority";
export type ListViewSelection = "none" | "single" | "multiple";
export type ListViewInteraction = "none" | "drill";
/** Which lines clip to one line with an ellipsis instead of wrapping. */
export type ListViewTruncate = "none" | "secondary" | "both";

export interface ListViewAction {
  id: string;
  label: string;
  /**
   * The button's accessible name when the visible label is not enough on its own, e.g. visible
   * "Review", accessible name "Review Tax checker". Start it with the visible label. Default: label.
   */
  actionLabel?: string;
  icon?: KitIcon;
  danger?: boolean;
  disabled?: boolean;
}

/** A small status dot as the leading mark, when there is no avatar or icon. Colour only; the text carries the meaning. */
export type ListViewDotTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface ListViewItem {
  id: string;
  primary: string;
  secondary?: string;
  name?: string;
  src?: string;
  initials?: string;
  icon?: KitIcon;
  /** Leading status dot when there is no avatar or icon. */
  dot?: ListViewDotTone;
  /**
   * high | medium | low. Shows a three-bar marker in the leading slot (when there is no avatar or icon)
   * and starts the secondary line with the word (High, Medium, Low), so the marker is never the only signal.
   */
  priority?: ListViewPriority;
  /**
   * The row's value, like an amount ("$2,418.00"), on the right of the primary line in tabular figures.
   * When set, meta and badge sit under it. Read after the secondary line.
   */
  value?: string;
  /** Short muted text at the row's end, like a relative time ("2h ago"). Read after the secondary line. */
  meta?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  disabled?: boolean;
  group?: string;
  actions?: ListViewAction[];
  /**
   * The row's one verb, shown as an outline kit Button in a fixed-width slot so verbs line up across rows.
   * When set, every entry in actions goes in the kit DropdownMenu after it.
   */
  primaryAction?: ListViewAction;
}

export interface ListViewGroup {
  id: string;
  label: string;
  /** A total for the group, like a month's amount ("$3,738.00"), on the right of the header in tabular figures. */
  total?: string;
}

export interface ListViewEmpty {
  title: string;
  description?: string;
  icon?: KitIcon;
  outlined?: boolean;
}

/** Root attributes the kit sets itself. */
type ListViewOwnedKeys = 
  | "children"
  | "role"
  | "tabIndex"
  | "aria-label"
  | "aria-multiselectable";

/** `ref`, `className` and other attributes land on the root list `<div>` (`role="listbox"`/`"list"`, `aria-label` from `label`). */
export interface ListViewProps extends Omit<ComponentPropsWithoutRef<"div">, ListViewOwnedKeys> {
  items: ListViewItem[];
  label: string;
  size?: ListViewSize;
  selection?: ListViewSelection;
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (selected: string[]) => void;
  interaction?: ListViewInteraction;
  onOpen?: (id: string) => void;
  onAction?: (itemId: string, actionId: string) => void;
  groups?: ListViewGroup[];
  collapsibleGroups?: boolean;
  empty?: ListViewEmpty;
  /**
   * Clip long lines to one line with an ellipsis (e.g. emails in a narrow rail) instead of
   * wrapping mid-word. The full text stays in the row's accessible name and the hover title. Default none.
   */
  truncate?: ListViewTruncate;
  /** Row order. priority sorts by item.priority within each group. Default none. */
  sort?: ListViewSort;
  ref?: Ref<HTMLDivElement>;
}
