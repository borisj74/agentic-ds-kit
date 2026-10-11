import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ScorecardProps } from "../Scorecard/Scorecard.types";

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type ScoreboardOwnedKeys = "children" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<section>` (inside the Conveyor when the strip scrolls). */
export interface ScoreboardProps extends Omit<ComponentPropsWithoutRef<"section">, ScoreboardOwnedKeys> {
  items: ScorecardProps[];
  scroll?: boolean;
  "aria-label"?: string;
  className?: string;
  ref?: Ref<HTMLElement>;
}
