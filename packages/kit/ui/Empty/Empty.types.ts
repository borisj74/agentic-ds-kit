import type { ReactNode } from "react";

export interface EmptyProps {
  title: string;
  description?: string;
  icon?: string;
  media?: ReactNode;
  actions?: ReactNode;
  outlined?: boolean;
}
