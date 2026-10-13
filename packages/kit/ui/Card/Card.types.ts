import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { ButtonVariant } from "../Button";
import type { KitLinkComponent } from "../shared/link";

export type CardSize = "sm" | "md";
export type CardActionVariant = ButtonVariant;

export interface CardAction {
  label: string;
  variant?: CardActionVariant;
  onClick?: () => void;
  /** headerAction only: render a text link (e.g. "View all") instead of a Button. */
  href?: string;
  /** headerAction only, with href: router link to render instead of `<a>`, e.g. Next.js `Link`. */
  linkAs?: KitLinkComponent;
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
  /** Body runs edge to edge with no padding, for a DataTable (which drops its own frame) or a list. */
  flush?: boolean;
  imageSrc?: string;
  /** Required when imageSrc is set. */
  imageAlt?: string;
  ref?: Ref<HTMLElement>;
}
