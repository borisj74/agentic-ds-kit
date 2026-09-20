export type ToastStatus = "info" | "success" | "warning" | "danger";

export interface ToastProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  status?: ToastStatus;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number | null;
}
