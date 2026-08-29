import type { InputProps } from "./Input.types";
import controlStyles from "../shared/controls.module.css";
import styles from "./Input.module.css";

export type { InputProps, InputSize, InputType } from "./Input.types";

export function Input({
  id,
  type = "text",
  size = "md",
  placeholder,
  disabled = false,
  error = false,
  defaultValue,
  name,
}: InputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      defaultValue={defaultValue}
      aria-invalid={error || undefined}
      className={`${controlStyles.control} ${size === "sm" ? controlStyles.controlSm : controlStyles.controlMd} ${error ? controlStyles.controlError : ""} ${styles.input}`}
    />
  );
}
