import type { ComponentPropsWithoutRef, Ref } from "react";

export interface UsageListItem {
  id: string;
  label: string;
  used: number;
  limit: number;
  unit?: string;
  note?: string;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type UsageListOwnedKeys = "children" | "role" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<div role="list">`. */
export interface UsageListProps extends Omit<ComponentPropsWithoutRef<"div">, UsageListOwnedKeys> {
  items: UsageListItem[];
  label?: string;
  ref?: Ref<HTMLDivElement>;
}
