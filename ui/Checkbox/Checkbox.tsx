import type { CheckboxProps } from "./Checkbox.types";
import styles from "./Checkbox.module.css";

export type { CheckboxProps } from "./Checkbox.types";

export function Checkbox({
  id,
  label,
  disabled = false,
  defaultChecked = false,
  name,
}: CheckboxProps) {
  return (
    <label className={styles.label} htmlFor={id}>
      <input
        id={id}
        name={name}
        type="checkbox"
        disabled={disabled}
        defaultChecked={defaultChecked}
        className={styles.input}
      />
      <span className={styles.text}>{label}</span>
    </label>
  );
}
