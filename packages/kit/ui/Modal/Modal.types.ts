import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { ModalCardTone } from "../ModalCard/ModalCard.types";

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
  /** Short area name above the title, like "Billing · Invoices". */
  eyebrow?: string;
  /** Tone icon and status word before the eyebrow. Default neutral: no icon. */
  tone?: ModalCardTone;
  size?: ModalSize;
  showClose?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Left side of the footer: an Ask Button (outline neutral sm, MessageCircle) or a count. */
  footerStart?: ReactNode;
  contained?: boolean;
  ref?: Ref<HTMLDivElement>;
}
