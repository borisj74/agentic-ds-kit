import type { ComponentPropsWithoutRef, Ref } from "react";

export type ToastStatus = "info" | "success" | "warning" | "danger";

export type ToastSize = "sm" | "md" | "lg";

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
  | "onBlur"
  | "hidden";

/** `ref`, `className` and other native attributes go to the toast card, not the shared live-region stack. */
export interface ToastProps extends Omit<ComponentPropsWithoutRef<"div">, ToastOwnedKeys> {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  status?: ToastStatus;
  actionLabel?: string;
  onAction?: () => void;
  /** ms. Default 5000; danger defaults to null (stays until closed). */
  duration?: number | null;
  /** Padding and title size. Default md. */
  size?: ToastSize;
  /** 0 to 100. Shows a progress bar instead of the countdown and keeps the toast open. */
  progress?: number;
  /** Preformatted time next to Dismiss, like Now. */
  timestamp?: string;
  ref?: Ref<HTMLDivElement>;
}
