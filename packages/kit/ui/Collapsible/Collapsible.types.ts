import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/** Native div attributes the kit sets itself on the root (or replaces with its own prop). */
type CollapsibleOwnedKeys = "children";

/** `ref`, `className` and other native attributes go to the root `<div>`. */
export interface CollapsibleProps extends Omit<ComponentPropsWithoutRef<"div">, CollapsibleOwnedKeys> {
  trigger: string;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  ref?: Ref<HTMLDivElement>;
}
