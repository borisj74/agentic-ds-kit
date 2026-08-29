import type { SelectProps } from "./Select.types";
import controlStyles from "../shared/controls.module.css";
import styles from "./Select.module.css";

export type { SelectProps, SelectOption, SelectSize } from "./Select.types";

export function Select({
  id,
  size = "md",
  options,
  disabled = false,
  error = false,
  defaultValue,
  name,
  ariaLabel,
}: SelectProps) {
  return (
    <select
      id={id}
      name={name}
      disabled={disabled}
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      aria-invalid={error || undefined}
      className={`${controlStyles.control} ${size === "sm" ? controlStyles.controlSm : controlStyles.controlMd} ${error ? controlStyles.controlError : ""} ${styles.select}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
