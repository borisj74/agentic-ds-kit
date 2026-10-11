import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type ModalCardSize = "sm" | "md" | "lg";

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type ModalCardOwnedKeys =
  | "children"
  | "title"
  | "role"
  | "tabIndex"
  | "aria-modal"
  | "aria-labelledby"
  | "aria-describedby";

/** `ref`, `className` and other native attributes go to the card `<div>`. */
export interface ModalCardProps extends Omit<ComponentPropsWithoutRef<"div">, ModalCardOwnedKeys> {
  title: string;
  description?: string;
  size?: ModalCardSize;
  onClose?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  role?: string;
  tabIndex?: number;
  "aria-modal"?: boolean | "true" | "false";
  ref?: Ref<HTMLDivElement>;
}
