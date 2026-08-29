import type { ReactNode } from "react";

export type DialogSize = "md" | "lg";

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  size?: DialogSize;
  showClose?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}
