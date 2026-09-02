import type { CSSProperties, ReactNode } from "react";

export type ShimmerTextSize = "sm" | "md" | "lg";
export type ShimmerTextSpeed = number | "slow" | "normal" | "fast";

export interface ShimmerTextProps {
  children: ReactNode;
  size?: ShimmerTextSize;
  speed?: ShimmerTextSpeed;
  className?: string;
  style?: CSSProperties;
}
