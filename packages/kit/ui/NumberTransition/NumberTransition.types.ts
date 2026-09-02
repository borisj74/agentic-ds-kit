export type NumberTransitionSize = "sm" | "md" | "lg";

export interface NumberTransitionProps {
  value: number | string;
  format?: (value: number | string) => string;
  size?: NumberTransitionSize;
  label?: string;
  className?: string;
}
