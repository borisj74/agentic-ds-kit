import type { ReactNode } from "react";

export type ToastStatus = "default" | "success" | "warning" | "danger" | "info";
export type ToastSize = "sm" | "md" | "lg";

export interface ToastProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  status?: ToastStatus;
  size?: ToastSize;
  duration?: number | null;
  onClose?: () => void;
  action?: ReactNode;
  className?: string;
}
