import type { ReactNode } from "react";

export type FieldLabelPosition = "top" | "start";

export interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  help?: string;
  error?: string;
  labelPosition?: FieldLabelPosition;
  children: ReactNode;
}
