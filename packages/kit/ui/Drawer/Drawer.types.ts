import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type DrawerSide = "right" | "left" | "bottom" | "top";

export type DrawerSize = "sm" | "md" | "lg";

/** Native div attributes the kit sets itself on the dialog panel (or replaces with its own prop). */
type DrawerOwnedKeys =
  | "children"
  | "title"
  | "role"
  | "tabIndex"
  | "aria-modal"
  | "aria-labelledby"
  | "aria-describedby";

/** `ref`, `className` and other native attributes go to the `role="dialog"` panel, not the portal or overlay. */
export interface DrawerProps extends Omit<ComponentPropsWithoutRef<"div">, DrawerOwnedKeys> {
  open: boolean;
  title: string;
  description?: string;
  side?: DrawerSide;
  size?: DrawerSize;
  showClose?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}
