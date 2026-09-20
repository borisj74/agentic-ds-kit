import type { ReactNode } from "react";

export type ConveyorOrientation = "horizontal" | "vertical";

export interface ConveyorProps {
  children: ReactNode;
  orientation?: ConveyorOrientation;
  step?: number;
  label?: string;
  className?: string;
}
