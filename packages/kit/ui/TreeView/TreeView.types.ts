export type TreeViewSize = "sm" | "md";
export type TreeViewSelection = "none" | "single" | "multiple";

export interface TreeViewItem {
  id: string;
  label: string;
  children?: TreeViewItem[];
  disabled?: boolean;
}

export interface TreeViewProps {
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
}
