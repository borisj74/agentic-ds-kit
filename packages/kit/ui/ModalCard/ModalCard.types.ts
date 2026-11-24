import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type ModalCardSize = "sm" | "md" | "lg";

/** Tone of the header icon. neutral shows the eyebrow only; the others add their icon and status word. */
export type ModalCardTone = "neutral" | "info" | "success" | "warning" | "danger";

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
  /** Short area name above the title, like "Billing · Invoices". */
  eyebrow?: string;
  /** Tone icon and status word before the eyebrow (Warning · Integrations). Default neutral: no icon. */
  tone?: ModalCardTone;
  size?: ModalCardSize;
  onClose?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  /** Left side of the footer: an Ask Button (outline neutral sm, MessageCircle) or a count like "6 of 6 selected". */
  footerStart?: ReactNode;
  role?: string;
  tabIndex?: number;
  "aria-modal"?: boolean | "true" | "false";
  ref?: Ref<HTMLDivElement>;
}
