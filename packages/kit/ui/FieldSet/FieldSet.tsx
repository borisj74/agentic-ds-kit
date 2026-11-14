import type { FieldSetProps } from "./FieldSet.types";
import { cx } from "../shared/cx";
import styles from "./FieldSet.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { FieldSetProps } from "./FieldSet.types";

export function FieldSet({ legend, description, children, className, ref, ...rest }: FieldSetProps) {
  return (
    <fieldset {...rest} {...nisthaAttr("fieldset", rest)} ref={ref} className={cx(styles.fieldset, className)}>
      <legend className={styles.legend}>{legend}</legend>
      {description ? <p className={styles.description}>{description}</p> : null}
      <div className={styles.body}>{children}</div>
    </fieldset>
  );
}
