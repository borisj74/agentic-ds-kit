import type { ComponentPropsWithoutRef, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export type SegmentedControlSize = "sm" | "md";

export interface SegmentedControlItem {
  value: string;
  label: string;
  /** Optional leading icon. Omit it for a text-only segment. */
  icon?: KitIcon;
  disabled?: boolean;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type SegmentedControlOwnedKeys = "children" | "onChange" | "defaultValue" | "role" | "aria-label" | "aria-disabled";

/**
 * `ref`, `className` and other native attributes land on the root `role="radiogroup"`.
 * Each segment is a `role="radio"` button. One segment is tabbable; arrows move the rest.
 */
export interface SegmentedControlProps
  extends Omit<ComponentPropsWithoutRef<"div">, SegmentedControlOwnedKeys> {
  items: SegmentedControlItem[];
  /** Names the group for assistive tech. The segments have no separate field legend. */
  ariaLabel: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: SegmentedControlSize;
  /** Locks every segment. */
  disabled?: boolean;
  ref?: Ref<HTMLDivElement>;
}
