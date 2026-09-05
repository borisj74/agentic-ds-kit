import type { TextareaProps } from "./Textarea.types";
import styles from "./Textarea.module.css";

export type { TextareaProps, TextareaSize } from "./Textarea.types";

const SIZE_CLASS = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const;

export function Textarea({
  id,
  size = "md",
  rows,
  placeholder,
  disabled = false,
  error = false,
  defaultValue,
  value,
  onChange,
  name,
  demo,
  describedBy,
}: TextareaProps) {
  return (
    <textarea
      id={id}
      name={name}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={(event) => onChange?.(event.target.value)}
      aria-invalid={error || undefined}
      aria-describedby={describedBy}
      data-demo={disabled ? undefined : demo}
      className={`${styles.textarea} ${SIZE_CLASS[size]}${error ? ` ${styles.error}` : ""}`}
    />
  );
}
