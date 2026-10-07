export type CountIntent = "info" | "danger" | "neutral";
export type CountSize = "sm" | "md" | "lg";

export interface CountProps {
  count: number;
  intent?: CountIntent;
  size?: CountSize;
  subtle?: boolean;
  disabled?: boolean;
  max?: number;
  label?: string;
}
