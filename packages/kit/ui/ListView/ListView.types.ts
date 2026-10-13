import type { KitIcon } from "../Button/lucideName";
import type { ComponentPropsWithoutRef, Ref } from "react";
import type { BadgeTone } from "../Badge/Badge.types";

export type ListViewSize = "sm" | "md";
export type ListViewSelection = "none" | "single" | "multiple";
export type ListViewInteraction = "none" | "drill";
/** Which lines clip to one line with an ellipsis instead of wrapping. */
export type ListViewTruncate = "none" | "secondary" | "both";

export interface ListViewAction {
  id: string;
  label: string;
  icon?: KitIcon;
  danger?: boolean;
  disabled?: boolean;
}

export interface ListViewItem {
  id: string;
  primary: string;
  secondary?: string;
  name?: string;
  src?: string;
  initials?: string;
  icon?: KitIcon;
  badge?: string;
  badgeTone?: BadgeTone;
  disabled?: boolean;
  group?: string;
  actions?: ListViewAction[];
}

export interface ListViewGroup {
  id: string;
  label: string;
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
  ref?: Ref<HTMLDivElement>;
}
