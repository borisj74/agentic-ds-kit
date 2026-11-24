import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { ButtonAppearance, ButtonMode } from "../Button";
import type { KitIcon } from "../Button/lucideName";
import type { KitLinkComponent } from "../shared/link";

export type CardSize = "sm" | "md";

/** Heading element for the title. Visual size never changes. */
export type CardHeadingLevel = 1 | 2 | 3 | 4;

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
  /**
   * headerAction only, deprecated: a real link with the sm Button look. Still works; prefer a
   * footer action or a header Button with onClick.
   */
  href?: string;
  /** headerAction only, with href: router link to render instead of `<a>`, e.g. Next.js `Link`. */
  linkAs?: KitLinkComponent;
}

/** Native article attributes the kit sets itself (or replaces with its own prop). */
type CardOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<article>`. */
export interface CardProps extends Omit<ComponentPropsWithoutRef<"article">, CardOwnedKeys> {
  title?: string;
  /**
   * Heading level of the title: h2 by default. Use 1 when the card title is the page heading
   * (e.g. Sign in), 3 or 4 under a page or Section heading. The 16/24 look stays the same.
   */
  headingLevel?: CardHeadingLevel;
  description?: string;
  children: ReactNode;
  size?: CardSize;
  actions?: CardAction[];
  /** Header kit Button or link, or up to two (e.g. an icon-only Ask and a View all link). */
  headerAction?: CardAction | CardAction[];
  /** Body runs edge to edge with no padding, for a DataTable (which drops its own frame) or a list. */
  flush?: boolean;
  /** Header row: a small icon tile before the eyebrow. Decorative (aria-hidden). */
  icon?: KitIcon;
  /** Header row: short grey label, e.g. "Analytics". Your copy, not a heading. */
  eyebrow?: string;
  /** Header row: timestamp on the right, e.g. "12:04". Tabular numbers. */
  meta?: string;
  /** Header row: shows an X IconButton sm, named by KitLabels `dismiss`. */
  onDismiss?: () => void;
  /** Grey line under the body naming where the data comes from, e.g. "Stripe · last 30 days". Describes the card. */
  source?: string;
  /** Footer: neutral ghost Button sm with MessageCircle on the left. Needs askLabel. */
  onAsk?: () => void;
  /** Caller label for the Ask button, e.g. "Ask" or "Ask in Chat". */
  askLabel?: string;
  imageSrc?: string;
  /** Required when imageSrc is set. */
  imageAlt?: string;
  ref?: Ref<HTMLElement>;
}
