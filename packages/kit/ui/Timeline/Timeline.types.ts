import type { ComponentPropsWithoutRef, Ref } from "react";

export type TimelineStatus = "now" | "next" | "later";

export interface TimelineItem {
  id?: string;
  title?: string;
  body?: string;
  phase?: string;
  status?: TimelineStatus;
}

/** Native ol attributes the kit sets itself (or replaces with its own prop). */
type TimelineOwnedKeys = "children" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<ol>`. No items: renders nothing. */
export interface TimelineProps extends Omit<ComponentPropsWithoutRef<"ol">, TimelineOwnedKeys> {
  items?: TimelineItem[];
  label?: string;
  headingLevel?: 2 | 3 | 4;
  className?: string;
  ref?: Ref<HTMLOListElement>;
}
