import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { ModalCardTone } from "../ModalCard/ModalCard.types";

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
  /** Short area name above the title, like "Billing · Invoices". */
  eyebrow?: string;
  /** Tone icon and status word before the eyebrow. Default neutral: no icon. */
  tone?: ModalCardTone;
  side?: DrawerSide;
  size?: DrawerSize;
  showClose?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Left side of the footer row: an Ask Button (outline neutral sm, MessageCircle) or a count. */
  footerStart?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}
