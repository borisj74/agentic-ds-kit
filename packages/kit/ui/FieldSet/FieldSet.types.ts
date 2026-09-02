import type { ReactNode } from "react";

export interface FieldSetProps {
  legend: string;
  description?: string;
  children: ReactNode;
}
