import type { ReactNode } from "react";

export type SectionSize = "sm" | "md" | "lg";

export interface SectionProps {
  title?: string;
  description?: string;
  size?: SectionSize;
  actions?: ReactNode;
  children: ReactNode;
  /** When true, a chevron before the title toggles the body. Default false. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
