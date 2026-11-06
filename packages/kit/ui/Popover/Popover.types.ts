import type { ReactElement, ReactNode } from "react";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

export interface PopoverProps {
  /** One focusable control. Click toggles the panel. */
  trigger: ReactElement;
  children: ReactNode;
  /** Names the dialog. */
  label: string;
  placement?: PopoverPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
