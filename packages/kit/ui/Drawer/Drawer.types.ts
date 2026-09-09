import type { ReactNode } from "react";

export type DrawerSide = "right" | "left" | "bottom" | "top";

export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps {
  open: boolean;
  title: string;
  description?: string;
  side?: DrawerSide;
  size?: DrawerSize;
  showClose?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}
