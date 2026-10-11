import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerAlign = "start" | "center" | "end";
export type DividerTone = "faint" | "default";

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type DividerOwnedKeys = "children" | "role" | "aria-orientation";

/** `ref`, `className` and other native attributes land on the root: `<hr>` for a plain rule, `<div>` otherwise. */
export interface DividerProps extends Omit<ComponentPropsWithoutRef<"div">, DividerOwnedKeys> {
  orientation?: DividerOrientation;
  /** Short text on the line. Horizontal only. */
  label?: string;
  /** Where the label and action sit on the line. Horizontal only. */
  align?: DividerAlign;
  /** Inline control on the line, e.g. a kit Button variant="tertiary" size="sm". Horizontal only. */
  action?: ReactNode;
  tone?: DividerTone;
  ref?: Ref<HTMLElement>;
}
