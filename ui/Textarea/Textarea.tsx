import type { TextareaProps } from "./Textarea.types";
import controlStyles from "../shared/controls.module.css";
import styles from "./Textarea.module.css";

export type { TextareaProps, TextareaSize } from "./Textarea.types";

export function Textarea({
  id,
  size = "md",
  rows = 4,
  placeholder,
  disabled = false,
  error = false,
  defaultValue,
  name,
}: TextareaProps) {
  return (
    <textarea
      id={id}
      name={name}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      defaultValue={defaultValue}
      aria-invalid={error || undefined}
      className={`${controlStyles.control} ${size === "sm" ? controlStyles.controlSm : controlStyles.controlMd} ${error ? controlStyles.controlError : ""} ${styles.textarea}`}
    />
  );
}
