export type MeterShape = "bar" | "circle" | "semicircle";
export type MeterSize = "sm" | "md" | "lg";
export type MeterThresholds = "none" | "bar" | "plotArea" | "all";
export type MeterIntent = "info" | "success" | "warning" | "danger";

export interface MeterProps {
  value: number | "indeterminate";
  label?: string;
  shape?: MeterShape;
  size?: MeterSize;
  thresholds?: MeterThresholds;
  intent?: MeterIntent;
  referenceLines?: boolean;
  showValue?: boolean;
  datatip?: string;
}
