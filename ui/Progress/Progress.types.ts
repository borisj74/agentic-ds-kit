export type ProgressSize = "sm" | "md";

export interface ProgressProps {
  value?: number;
  size?: ProgressSize;
  label?: string;
  showValue?: boolean;
  ariaLabel?: string;
}
