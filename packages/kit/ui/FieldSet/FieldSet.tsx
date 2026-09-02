import type { FieldSetProps } from "./FieldSet.types";
import styles from "./FieldSet.module.css";

export type { FieldSetProps } from "./FieldSet.types";

export function FieldSet({ legend, description, children }: FieldSetProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      {description ? <p className={styles.description}>{description}</p> : null}
      <div className={styles.body}>{children}</div>
    </fieldset>
  );
}
