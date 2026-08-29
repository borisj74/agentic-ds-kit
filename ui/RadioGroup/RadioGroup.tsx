import type { RadioGroupProps } from "./RadioGroup.types";
import styles from "./RadioGroup.module.css";

export type { RadioGroupProps, RadioGroupOption, RadioGroupOrientation } from "./RadioGroup.types";

export function RadioGroup({
  name,
  legend,
  orientation = "vertical",
  options,
  defaultValue,
  disabled = false,
}: RadioGroupProps) {
  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={orientation === "horizontal" ? styles.horizontal : styles.vertical}>
        {options.map((option) => (
          <label key={option.value} className={styles.label}>
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={defaultValue === option.value}
              className={styles.input}
            />
            <span className={styles.text}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
