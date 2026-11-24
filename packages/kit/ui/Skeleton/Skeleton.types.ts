import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type SkeletonShape = "text" | "circle" | "rect";
export type SkeletonSize = "sm" | "md" | "lg";
export type SkeletonAnimation = "shimmer" | "pulse" | "none";
export type SkeletonLayout = "table" | "card" | "list";

/** Native span attributes the kit sets itself (or replaces with its own prop). */
type SkeletonOwnedKeys = "children" | "aria-busy";

/** `ref`, `className` and other native attributes land on the root `<span>` while loading. `style` is merged; the kit's text width wins. Not loading: children render as they are, with no root. */
export interface SkeletonProps extends Omit<ComponentPropsWithoutRef<"span">, SkeletonOwnedKeys> {
  shape?: SkeletonShape;
  /** A whole loading layout in one piece: table rows, a card body, or list rows. Replaces shape. `lines` sets the rows (table 5, list 3, card 3 text lines by default). */
  layout?: SkeletonLayout;
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
