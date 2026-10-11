import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type SkeletonShape = "text" | "circle" | "rect";
export type SkeletonSize = "sm" | "md" | "lg";
export type SkeletonAnimation = "shimmer" | "pulse" | "none";

/** Native span attributes the kit sets itself (or replaces with its own prop). */
type SkeletonOwnedKeys = "children" | "aria-busy";

/** `ref`, `className` and other native attributes land on the root `<span>` while loading. `style` is merged; the kit's text width wins. Not loading: children render as they are, with no root. */
export interface SkeletonProps extends Omit<ComponentPropsWithoutRef<"span">, SkeletonOwnedKeys> {
  shape?: SkeletonShape;
  lines?: number;
  size?: SkeletonSize;
  width?: string | number;
  height?: string | number;
  animation?: SkeletonAnimation;
  loading?: boolean;
  children?: ReactNode;
  label?: string;
  ref?: Ref<HTMLSpanElement>;
}
