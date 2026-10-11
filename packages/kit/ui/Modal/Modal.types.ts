import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type ModalSize = "sm" | "md" | "lg";

/** Native div attributes the kit sets itself on the dialog panel (or replaces with its own prop). */
type ModalOwnedKeys =
  | "children"
  | "title"
  | "role"
  | "tabIndex"
  | "aria-modal"
  | "aria-labelledby"
  | "aria-describedby";

/** `ref`, `className` and other native attributes go to the dialog panel (the card), not the portal or scrim. */
export interface ModalProps extends Omit<ComponentPropsWithoutRef<"div">, ModalOwnedKeys> {
  open: boolean;
  title: string;
  description?: string;
  size?: ModalSize;
  showClose?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  contained?: boolean;
  ref?: Ref<HTMLDivElement>;
}
