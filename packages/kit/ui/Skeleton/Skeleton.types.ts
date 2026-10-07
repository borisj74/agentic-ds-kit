import type { ReactNode } from "react";

export type SkeletonShape = "text" | "circle" | "rect";
export type SkeletonSize = "sm" | "md" | "lg";
export type SkeletonAnimation = "shimmer" | "pulse" | "none";

export interface SkeletonProps {
  shape?: SkeletonShape;
  lines?: number;
  size?: SkeletonSize;
  width?: string | number;
  height?: string | number;
  animation?: SkeletonAnimation;
  loading?: boolean;
  children?: ReactNode;
  label?: string;
}
