import type { ComponentPropsWithoutRef, Ref } from "react";

export interface PickerModel {
  id: string;
  name: string;
  /** Group heading, e.g. "Anthropic". */
  vendor?: string;
  description?: string;
  /** e.g. "200K" */
  contextWindow?: string;
  /** e.g. "$$" */
  costTier?: string;
  /** Short word on the trigger, e.g. "balanced". */
  tagline?: string;
  disabled?: boolean;
  /** Kept visible next to a disabled model, e.g. "Needs the Pro plan". */
  disabledReason?: string;
  recommended?: boolean;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type ModelPickerOwnedKeys = "children" | "onChange";

/** `ref`, `className` and other native attributes land on the root `<div>`. */
export interface ModelPickerProps extends Omit<ComponentPropsWithoutRef<"div">, ModelPickerOwnedKeys> {
  models: PickerModel[];
  value?: string;
  onValueChange?: (id: string) => void;
  /** Field label. Default "Model". */
  label?: string;
  hideLabel?: boolean;
  size?: "sm" | "md";
  loading?: boolean;
  /** Load error; the last choice stays selected. */
  error?: string;
  onRetry?: () => void;
  /** No models enabled. */
  emptyText?: string;
  ref?: Ref<HTMLDivElement>;
}
