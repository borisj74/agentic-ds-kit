export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children: string;
  tone?: BadgeTone;
  size?: BadgeSize;
  removable?: boolean;
  disabled?: boolean;
  onRemove?: () => void;
}
