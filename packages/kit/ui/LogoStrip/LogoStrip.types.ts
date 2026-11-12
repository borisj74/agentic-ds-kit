import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/**
 * One logo. `name` is required: it is the image's alt text (or the node's accessible name).
 * Give `src` for an image, or `logo` for a node (an inline SVG mark); `logo` wins when both are set.
 */
export interface LogoStripLogo {
  /** Stable key. Default `name`. */
  id?: string;
  /** Company or product name, read by screen readers. */
  name: string;
  /** Image URL (SVG or raster). Shown at the strip's logo height, width from its aspect ratio. */
  src?: string;
  /** A node instead of an image, e.g. an inline SVG in currentColor. Its insides are hidden from AT. */
  logo?: ReactNode;
  /** Optional link, e.g. a case study. The link's name is the logo's name. */
  href?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type LogoStripOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface LogoStripProps extends Omit<ComponentPropsWithoutRef<"section">, LogoStripOwnedKeys> {
  logos: LogoStripLogo[];
  /** Heading (h2). Default "Trusted by teams at". */
  title?: string;
  /** One line under the heading. */
  description?: string;
  /** Names the logo group; the count is added ("Customer logos, 24"). Default "Customer logos". */
  label?: string;
  /** Rows the logos are dealt into, round-robin. Neighbouring rows run in opposite directions. Default 3. */
  rows?: number;
  /** Controlled pause. Without it the Pause / Play button keeps its own state. */
  paused?: boolean;
  /** Uncontrolled starting state. Default false (moving). */
  defaultPaused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  /** "center" (default) or "start": heading alignment. */
  align?: "center" | "start";
  ref?: Ref<HTMLElement>;
}
