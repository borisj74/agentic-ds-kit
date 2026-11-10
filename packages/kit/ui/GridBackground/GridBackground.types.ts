import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type GridBackgroundVariant = "lines" | "dots" | "none";

/** `ref`, `className` and other attributes land on the root `<div>`. */
export interface GridBackgroundProps extends ComponentPropsWithoutRef<"div"> {
  /** Lines every space.6 (24px), dots every space.4 (16px), or no grid. Default lines. */
  variant?: GridBackgroundVariant;
  /** On an inverse surface: the surface becomes surface.inverse and the grid a faint line.inverse, with no edge fade. */
  inverse?: boolean;
  /** The demo or hero in front of the grid. It keeps its full contrast. */
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}
