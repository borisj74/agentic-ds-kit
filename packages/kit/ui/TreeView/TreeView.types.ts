import type { ComponentPropsWithoutRef, Ref } from "react";
export type TreeViewSize = "sm" | "md";
export type TreeViewSelection = "none" | "single" | "multiple";

export interface TreeViewItem {
  id: string;
  label: string;
  children?: TreeViewItem[];
  disabled?: boolean;
  icon?: string;
}

/** Root attributes the kit sets itself. */
type TreeViewOwnedKeys = 
  | "children"
  | "role"
  | "tabIndex"
  | "aria-label"
  | "aria-multiselectable";

/** `ref`, `className` and other attributes land on the root `role="tree"` `<div>` (`aria-label` from `label`). */
export interface TreeViewProps extends Omit<ComponentPropsWithoutRef<"div">, TreeViewOwnedKeys> {
  items: TreeViewItem[];
  label: string;
  size?: TreeViewSize;
  selection?: TreeViewSelection;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (selected: string[]) => void;
  showLines?: boolean;
  showIcons?: boolean;
  reorderable?: boolean;
  onItemsChange?: (items: TreeViewItem[]) => void;
  ref?: Ref<HTMLDivElement>;
}
