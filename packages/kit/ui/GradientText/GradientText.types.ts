import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/**
 * `ink`: text.fg → brand. `brand`: brand → primary.fg. Paper's `overlay` (brand → violet) waits
 * for the violet role decision.
 */
export type GradientTextTone = "ink" | "brand";
export type GradientTextElement = "h1" | "h2" | "h3" | "span";

/** `ref`, `className` and other attributes land on the root element (`as`). */
export interface GradientTextProps extends ComponentPropsWithoutRef<"h2"> {
  children: ReactNode;
  as?: GradientTextElement;
  tone?: GradientTextTone;
  /** On surface.inverse: bg.canvas → info line instead of the tone's stops. */
  inverse?: boolean;
  className?: string;
  ref?: Ref<HTMLHeadingElement>;
}
