import type { ReactNode } from "react";

export type DrawerSide = "right" | "left" | "bottom" | "top";

export interface DrawerProps {
  open: boolean;
  title: string;
  description?: string;
  side?: DrawerSide;
  showClose?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}
