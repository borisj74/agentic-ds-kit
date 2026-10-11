import type { ComponentPropsWithoutRef, Ref } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

/** Native div attributes the kit sets itself on the root (or replaces with its own prop). */
type AccordionOwnedKeys = "children";

/** `ref`, `className` and other native attributes go to the root `<div>`. */
export interface AccordionProps extends Omit<ComponentPropsWithoutRef<"div">, AccordionOwnedKeys> {
  items: AccordionItem[];
  defaultOpen?: string;
  ref?: Ref<HTMLDivElement>;
}
