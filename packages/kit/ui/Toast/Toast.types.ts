import type { ComponentPropsWithoutRef, Ref } from "react";

export type ToastStatus = "info" | "success" | "warning" | "danger";

/** Native div attributes the kit sets itself on the toast card (or replaces with its own prop). */
type ToastOwnedKeys =
  | "children"
  | "title"
  | "role"
  | "aria-live"
  | "aria-atomic"
  | "aria-labelledby"
  | "aria-describedby"
  | "onMouseEnter"
  | "onMouseLeave"
  | "onFocus"
  | "onBlur";

/** `ref`, `className` and other native attributes go to the toast card, not the shared live-region stack. */
export interface ToastProps extends Omit<ComponentPropsWithoutRef<"div">, ToastOwnedKeys> {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  status?: ToastStatus;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number | null;
  ref?: Ref<HTMLDivElement>;
}
