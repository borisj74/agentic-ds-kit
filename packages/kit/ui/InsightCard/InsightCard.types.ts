import type { ComponentPropsWithoutRef, Ref } from "react";

export type InsightCardTone = "opportunity" | "success" | "warning" | "danger" | "info" | "neutral";
export type InsightCardSize = "sm" | "md" | "lg";
/** How the actions render: kit Buttons (default) or text links with a trailing arrow. */
export type InsightCardActionStyle = "button" | "link";

export interface InsightCardAction {
  label: string;
  /** Navigates: the action is a real link (`<a>`), always shown as a text link, never a Button. */
  href?: string;
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
  /** `link`: actions render as text links ("View invoice →"), so the view's one primary Button stays free. Default button. */
  actionStyle?: InsightCardActionStyle;
  onDismiss?: () => void;
  ref?: Ref<HTMLElement>;
}
