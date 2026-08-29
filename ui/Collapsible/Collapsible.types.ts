import type { ReactNode } from "react";

export interface CollapsibleProps {
  trigger: string;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
