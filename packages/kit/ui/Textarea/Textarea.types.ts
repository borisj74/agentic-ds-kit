import type { ComponentPropsWithoutRef, Ref } from "react";

export type TextareaSize = "sm" | "md" | "lg";

/** Native textarea attributes the kit sets itself (or replaces with its own prop). */
type TextareaOwnedKeys = "children" | "onChange" | "aria-invalid" | "aria-describedby";

/** The `<textarea>` is both the root and the native control: `ref`, `className` and other attributes all land on it. */
export interface TextareaProps extends Omit<ComponentPropsWithoutRef<"textarea">, TextareaOwnedKeys> {
  id: string;
  size?: TextareaSize;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  demo?: "hover" | "focus";
  describedBy?: string;
  ref?: Ref<HTMLTextAreaElement>;
}
