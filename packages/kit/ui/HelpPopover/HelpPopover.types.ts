import type { ReactNode } from "react";

export type HelpPopoverPlacement = "top" | "bottom" | "left" | "right";

export interface HelpPopoverProps {
  title?: string;
  content: string;
  placement?: HelpPopoverPlacement;
  delay?: number;
  open?: boolean;
  disabled?: boolean;
  children: ReactNode;
}
