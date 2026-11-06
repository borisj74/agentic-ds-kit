import type { Ref } from "react";

export type NumberInputSize = "sm" | "md" | "lg";

export interface NumberInputProps {
  id: string;
  size?: NumberInputSize;
  /** Controlled numeric value. `null` is empty. */
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Arrow keys and steppers move by this amount. Default 1. */
  step?: number;
  /** BCP 47 locale for grouping and the decimal mark. Default is the runtime locale. */
  locale?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  name?: string;
  describedBy?: string;
  ariaLabel?: string;
  /** Show decrease and increase buttons. Default true. */
  steppers?: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}
