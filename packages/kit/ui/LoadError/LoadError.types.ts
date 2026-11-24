import type { ComponentPropsWithoutRef, Ref } from "react";

/** sm: inside a chart, list or table cell. md: a card body. lg: a page. Same scale as Empty. */
export type LoadErrorSize = "sm" | "md" | "lg";

type LoadErrorOwnedKeys = "children" | "role";

/** `ref`, `className` and other native attributes land on the root `<div>`. */
export interface LoadErrorProps extends Omit<ComponentPropsWithoutRef<"div">, LoadErrorOwnedKeys> {
  /** What failed, named: "Couldn't load invoices." */
  message: string;
  /** Text people can copy for support, shown as given in mono, like "Ref 7F3A-91C2". */
  reference?: string;
  /** Shows the "Try again" Button (KitLabels tryAgain). */
  onRetry?: () => void;
  size?: LoadErrorSize;
  ref?: Ref<HTMLDivElement>;
}
