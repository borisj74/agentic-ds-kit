import type { CardProps } from "../Card/Card.types";

/** Every Card prop, plus the tilt. `ref`, `className` and native attributes land on the Card `<article>`. */
export interface TiltCardProps extends CardProps {
  /** Tilt toward the pointer. Default true; false keeps only the hover lift. */
  tilt?: boolean;
  /** Largest rotation in degrees at the card's edge. Default 6, capped at 6. */
  maxTilt?: number;
  /** Mutes the content, sets aria-disabled and turns the tilt and lift off. */
  disabled?: boolean;
}
