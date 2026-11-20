import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { ButtonAppearance, ButtonMode } from "../Button";
import type { KitIcon } from "../Button/lucideName";
import type { KitLinkComponent } from "../shared/link";

export type CardSize = "sm" | "md";

export interface CardAction {
  /** Button text, or the accessible name when `iconOnly` is set. */
  label: string;
  /** headerAction only: leading icon. */
  iconStart?: KitIcon;
  /** headerAction only, with iconStart: icon-only Button named by `label` (shown in a tooltip by the browser title). */
  iconOnly?: boolean;
  appearance?: ButtonAppearance;
  mode?: ButtonMode;
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
  /** Header kit Button or link, or up to two (e.g. an icon-only Ask and a View all link). */
  headerAction?: CardAction | CardAction[];
  /** Body runs edge to edge with no padding, for a DataTable (which drops its own frame) or a list. */
  flush?: boolean;
  imageSrc?: string;
  /** Required when imageSrc is set. */
  imageAlt?: string;
  ref?: Ref<HTMLElement>;
}
