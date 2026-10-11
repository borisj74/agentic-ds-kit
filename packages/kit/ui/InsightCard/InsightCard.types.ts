import type { ComponentPropsWithoutRef, Ref } from "react";

export type InsightCardTone = "opportunity" | "warning" | "danger" | "info" | "neutral";
export type InsightCardSize = "sm" | "md" | "lg";

export interface InsightCardAction {
  label: string;
  onClick?: () => void;
}

/** Native article attributes the kit sets itself (or replaces with its own prop). */
type InsightCardOwnedKeys = "children" | "title" | "aria-labelledby" | "aria-describedby";

/** `ref`, `className` and other native attributes land on the root `<article>`. */
export interface InsightCardProps extends Omit<ComponentPropsWithoutRef<"article">, InsightCardOwnedKeys> {
  title: string;
  description?: string;
  eyebrow?: string;
  tone?: InsightCardTone;
  size?: InsightCardSize;
  confidence?: string;
  source?: string;
  primaryAction?: InsightCardAction;
  secondaryAction?: InsightCardAction;
  onDismiss?: () => void;
  ref?: Ref<HTMLElement>;
}
