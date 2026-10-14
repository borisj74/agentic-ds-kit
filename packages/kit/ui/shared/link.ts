import type { ElementType, MouseEventHandler, ReactNode } from "react";

/**
 * A router link the kit renders instead of a plain `<a>`, e.g. Next.js `Link`.
 * It receives `href`, `className`, `onClick` and the link text as children.
 */
export type KitLinkComponent = ElementType<{
  href: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children?: ReactNode;
}>;
