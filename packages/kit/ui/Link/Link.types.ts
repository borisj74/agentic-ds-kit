import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { KitLinkComponent } from "../shared/link";

export type LinkVariant = "inline" | "standalone";

/** Native anchor attributes the kit sets itself (or replaces with its own prop). */
type LinkOwnedKeys = "children" | "href" | "target";

/** `ref`, `className` and other native attributes land on the root `<a>` (or the `linkAs` element). */
export interface LinkProps extends Omit<ComponentPropsWithoutRef<"a">, LinkOwnedKeys> {
  href: string;
  children: ReactNode;
  /** inline: underlined, inherits the surrounding type. standalone: a link on its own line or in a list, underlined on hover. */
  variant?: LinkVariant;
  /** Opens in a new tab with rel="noopener noreferrer", adds the external icon and "(opens in a new tab)" for screen readers. */
  external?: boolean;
  /** Router link to render instead of `<a>`, e.g. Next.js `Link`. Ignored when `external`. */
  linkAs?: KitLinkComponent;
  ref?: Ref<HTMLAnchorElement>;
}
