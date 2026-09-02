import type { ReactNode } from "react";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  size?: ModalSize;
  showClose?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  contained?: boolean;
}
