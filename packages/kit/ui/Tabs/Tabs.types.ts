import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type TabsSize = "sm" | "md" | "lg";
export type TabsVariant = "line" | "segmented";

export interface TabItem {
  id: string;
  label: string;
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
  ariaLabel?: string;
  ref?: Ref<HTMLDivElement>;
}
