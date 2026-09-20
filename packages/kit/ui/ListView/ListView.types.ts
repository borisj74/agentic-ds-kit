import type { BadgeTone } from "../Badge/Badge.types";

export type ListViewSize = "sm" | "md";
export type ListViewSelection = "none" | "single" | "multiple";
export type ListViewInteraction = "none" | "drill";

export interface ListViewAction {
  id: string;
  label: string;
  icon?: string;
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
  icon?: string;
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
  icon?: string;
  outlined?: boolean;
}

export interface ListViewProps {
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
}
