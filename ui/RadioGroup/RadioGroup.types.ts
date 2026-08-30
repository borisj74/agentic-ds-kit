import type { BadgeTone } from "../Badge/Badge.types";

export type RadioGroupSize = "sm" | "md" | "lg";
export type RadioGroupOrientation = "vertical" | "horizontal";
export type RadioGroupLayout = "list" | "card";

export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  legend: string;
  hideLegend?: boolean;
  size?: RadioGroupSize;
  orientation?: RadioGroupOrientation;
  layout?: RadioGroupLayout;
  options: RadioGroupOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  hint?: string;
}
