import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type HelpPopoverPlacement = "top" | "bottom" | "left" | "right";

/** Native div attributes the kit sets itself on the floating panel (or replaces with its own prop). */
type HelpPopoverOwnedKeys =
  | "children"
  | "title"
  | "content"
  | "style"
  | "aria-hidden"
  | "onPointerEnter"
  | "onPointerLeave";

/** `ref`, `className` and other native attributes go to the floating panel (rendered only while open), not the trigger wrapper. */
export interface HelpPopoverProps extends Omit<ComponentPropsWithoutRef<"div">, HelpPopoverOwnedKeys> {
  title?: string;
  content: string;
  placement?: HelpPopoverPlacement;
  delay?: number;
  open?: boolean;
  disabled?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}
