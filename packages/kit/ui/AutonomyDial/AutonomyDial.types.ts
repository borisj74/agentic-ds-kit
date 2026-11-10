import type { ComponentPropsWithoutRef, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export interface AutonomyStop {
  id: string;
  label: string;
  description: string;
  icon?: KitIcon;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type AutonomyDialOwnedKeys = "children" | "onChange" | "defaultValue";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AutonomyDialProps extends Omit<ComponentPropsWithoutRef<"section">, AutonomyDialOwnedKeys> {
  /** Default "Autonomy". */
  label?: string;
  /** Selected stop id. Default "risk". */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Ordered from more oversight to more autonomy. Default: ask · risk · tell · run. */
  options?: AutonomyStop[];
  /** The stop marked "default". Default "risk". */
  defaultValue?: string;
  /** e.g. "Research agent · acme/ledger". */
  appliesTo?: string;
  disabled?: boolean;
  /** Shown when disabled, e.g. "Set by workspace policy". */
  disabledReason?: string;
  /** Saving a new stop: the description shows "Saving…". */
  saving?: boolean;
  size?: "sm" | "md";
  ref?: Ref<HTMLElement>;
}
