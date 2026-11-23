import type { ComponentPropsWithoutRef, Ref } from "react";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export type AlertPlacement = "inline" | "page";

/** One kit Button: a label and what it does. Not a ReactNode slot. */
export interface AlertAction {
  label: string;
  onClick: () => void;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type AlertOwnedKeys = "children" | "title" | "role";

/** `ref`, `className` and other native attributes land on the root `<div>`. */
export interface AlertProps extends Omit<ComponentPropsWithoutRef<"div">, AlertOwnedKeys> {
  children: string;
  variant?: AlertVariant;
  title?: string;
  /** page (default): tinted fill. inline: neutral card surface. */
  placement?: AlertPlacement;
  /** Short context word in the header, like Billing. */
  eyebrow?: string;
  /** Preformatted time on the right of the header, like Nov 20. */
  timestamp?: string;
  /** page: solid primary Button. inline: outline neutral. */
  action?: AlertAction;
  /** Outline neutral Button after `action`. */
  secondaryAction?: AlertAction;
  /** Shows a Dismiss Button in the header. */
  onDismiss?: () => void;
  ref?: Ref<HTMLDivElement>;
}
