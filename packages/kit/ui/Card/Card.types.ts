import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { ButtonVariant } from "../Button";

export type CardSize = "sm" | "md";
export type CardActionVariant = ButtonVariant;

export interface CardAction {
  label: string;
  variant?: CardActionVariant;
  onClick?: () => void;
}

/** Native article attributes the kit sets itself (or replaces with its own prop). */
type CardOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<article>`. */
export interface CardProps extends Omit<ComponentPropsWithoutRef<"article">, CardOwnedKeys> {
  title?: string;
  description?: string;
  children: ReactNode;
  size?: CardSize;
  actions?: CardAction[];
  headerAction?: CardAction;
  imageSrc?: string;
  /** Required when imageSrc is set. */
  imageAlt?: string;
  ref?: Ref<HTMLElement>;
}
