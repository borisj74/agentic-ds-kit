import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  /** Panel body. A string, or kit pieces such as a Field or Table. */
  content: ReactNode;
  /** Short secondary text at the end of the header, e.g. "Updated 2 days ago". */
  meta?: string;
  /** Neutral Count after the title, e.g. how many rows the panel holds. */
  count?: number;
  /** Header is shown but cannot open or close, and Tab and arrow keys skip it. */
  disabled?: boolean;
}

export type AccordionType = "single" | "multiple";

/** Native div attributes the kit sets itself on the root (or replaces with its own prop). */
type AccordionOwnedKeys = "children";

/** `ref`, `className` and other native attributes go to the root `<div>`. */
export interface AccordionProps extends Omit<ComponentPropsWithoutRef<"div">, AccordionOwnedKeys> {
  items: AccordionItem[];
  /** single keeps one item open at a time; multiple lets any number stay open. */
  type?: AccordionType;
  /** Item id (or ids, with type multiple) that start open. Omit to start all closed. */
  defaultOpen?: string | string[];
  ref?: Ref<HTMLDivElement>;
}
