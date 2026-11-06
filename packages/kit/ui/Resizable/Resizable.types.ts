import type { ReactNode } from "react";

export type ResizableOrientation = "horizontal" | "vertical";

export interface ResizableProps {
  /** horizontal splits left and right. vertical splits top and bottom. */
  orientation?: ResizableOrientation;
  /** Start panel size, 0 to 100. */
  size?: number;
  defaultSize?: number;
  min?: number;
  max?: number;
  onSizeChange?: (size: number) => void;
  start: ReactNode;
  end: ReactNode;
  startLabel?: string;
  endLabel?: string;
  ariaLabel?: string;
  className?: string;
}
