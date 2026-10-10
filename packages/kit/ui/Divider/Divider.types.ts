import type { ReactNode } from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerAlign = "start" | "center" | "end";
export type DividerTone = "faint" | "default";

export interface DividerProps {
  orientation?: DividerOrientation;
  /** Short text on the line. Horizontal only. */
  label?: string;
  /** Where the label and action sit on the line. Horizontal only. */
  align?: DividerAlign;
  /** Inline control on the line, e.g. a kit Button variant="tertiary" size="sm". Horizontal only. */
  action?: ReactNode;
  tone?: DividerTone;
}
