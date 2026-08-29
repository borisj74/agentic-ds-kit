import type { ReactNode } from "react";

export type SectionSize = "sm" | "md" | "lg";

export interface SectionProps {
  title?: string;
  description?: string;
  size?: SectionSize;
  actions?: ReactNode;
  children: ReactNode;
}
