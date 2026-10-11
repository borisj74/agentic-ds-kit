import type { ComponentPropsWithoutRef, Ref } from "react";

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
  cancelLabel?: string;
  actionLabel: string;
  actionVariant?: AlertDialogActionVariant;
  size?: AlertDialogSize;
  onCancel: () => void;
  onAction: () => void;
  ref?: Ref<HTMLDivElement>;
}
