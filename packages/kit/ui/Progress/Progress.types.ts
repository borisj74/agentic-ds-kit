export type ProgressSize = "sm" | "md" | "lg";
export type ProgressValuePosition = "overlay" | "end";
export type ProgressTone = "brand" | "warning" | "danger" | "muted";
export type ProgressShape = "bar" | "circle" | "semicircle";

export interface ProgressProps {
  value?: number;
  size?: ProgressSize;
  shape?: ProgressShape;
  label?: string;
  showValue?: boolean;
  valuePosition?: ProgressValuePosition;
  tone?: ProgressTone;
  ariaLabel?: string;
}
