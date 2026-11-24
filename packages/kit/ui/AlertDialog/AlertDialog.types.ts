import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { ModalCardTone } from "../ModalCard/ModalCard.types";

export type AlertDialogSize = "sm" | "md";
export type AlertDialogActionVariant = "primary" | "danger";

/** Native div attributes the kit sets itself on the dialog panel (or replaces with its own prop). */
type AlertDialogOwnedKeys =
  | "children"
  | "title"
  | "role"
  | "tabIndex"
  | "aria-modal"
  | "aria-labelledby"
  | "aria-describedby";

/** `ref`, `className` and other native attributes go to the `role="alertdialog"` panel, not the portal or overlay. */
export interface AlertDialogProps extends Omit<ComponentPropsWithoutRef<"div">, AlertDialogOwnedKeys> {
  open: boolean;
  title: string;
  description: string;
  /** Short area name above the title, like "Integrations". */
  eyebrow?: string;
  /** Tone icon and status word before the eyebrow (Warning · Integrations). Default neutral: no icon. */
  tone?: ModalCardTone;
  /** Outcome lines under the description, like "Invoices already in the ledger stay." */
  consequences?: string[];
  /** The person types this (a name) to turn on the action. Focus starts in that field. */
  confirmText?: string;
  cancelLabel?: string;
  actionLabel: string;
  actionVariant?: AlertDialogActionVariant;
  size?: AlertDialogSize;
  /** Left side of the footer: an Ask Button (outline neutral sm, MessageCircle). */
  footerStart?: ReactNode;
  onCancel: () => void;
  onAction: () => void;
  ref?: Ref<HTMLDivElement>;
}
