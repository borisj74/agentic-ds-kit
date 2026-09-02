import type { ReactNode } from "react";

export type ModalCardSize = "sm" | "md" | "lg";

export interface ModalCardProps {
  title: string;
  description?: string;
  size?: ModalCardSize;
  onClose?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  role?: string;
  tabIndex?: number;
  "aria-modal"?: boolean | "true" | "false";
}
