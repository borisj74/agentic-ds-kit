import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export type TabsSize = "sm" | "md" | "lg";
export type TabsVariant = "line" | "segmented";
export type TabsOverflow = "scroll" | "more";
export type TabsActivation = "automatic" | "manual";

export interface TabItem {
  id: string;
  label: string;
  /** Lucide name, Lucide component, or element, before the label. */
  icon?: KitIcon;
  /** A number after the label, shown as a neutral kit Count. Part of the tab's name. */
  count?: number;
  content?: ReactNode;
  disabled?: boolean;
}

/** Native div attributes the kit sets itself on the root (or replaces with its own prop). */
type TabsOwnedKeys = "children" | "onChange" | "defaultValue";

/** `ref`, `className` and other native attributes go to the root `<div>`; the tablist, tabs and panel stay kit-owned. */
export interface TabsProps extends Omit<ComponentPropsWithoutRef<"div">, TabsOwnedKeys> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  size?: TabsSize;
  variant?: TabsVariant;
  /** scroll: tabs stay on one line and scroll sideways when they don't fit. more: tabs that don't fit move into a More menu. */
  overflow?: TabsOverflow;
  /** automatic: arrow keys select the tab they land on. manual: arrow keys move focus; Enter or Space selects. */
  activation?: TabsActivation;
  /** The panel takes the height left under the tab list, so a full-height child (like Chat embedded) fills it. Give Tabs a height or a flex/grid slot. */
  fill?: boolean;
  ariaLabel?: string;
  ref?: Ref<HTMLDivElement>;
}
