import type { ComponentPropsWithoutRef, Ref } from "react";

/** Which way the value moved. `flat` is no change. */
export type DeltaDirection = "up" | "down" | "flat";

/** Text colour. Default comes from direction: up success, down danger, flat neutral. */
export type DeltaTone = "success" | "danger" | "warning" | "neutral";

export type DeltaSize = "sm" | "md";

/** Native span attributes the kit sets itself (or replaces with its own prop). */
type DeltaOwnedKeys = "children";

/** `ref`, `className` and other native attributes land on the root `<span>`. */
export interface DeltaProps extends Omit<ComponentPropsWithoutRef<"span">, DeltaOwnedKeys> {
  /** The visible change with its sign, e.g. "+$600", "−$90", "+12.4%" or "No change". */
  value: string;
  direction: DeltaDirection;
  /** Override the colour when up is bad (costs, churn) or down is good. */
  tone?: DeltaTone;
  size?: DeltaSize;
  ref?: Ref<HTMLSpanElement>;
}
