import { useId } from "react";
import type { FieldSetProps } from "./FieldSet.types";
import { cx } from "../shared/cx";
import styles from "./FieldSet.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { FieldSetLayout, FieldSetProps } from "./FieldSet.types";

export function FieldSet({
  legend,
  description,
  layout = "stack",
  children,
  className,
  ref,
  "aria-describedby": describedBy,
  ...rest
}: FieldSetProps) {
  const descriptionId = useId();
  // The description is read with the group name on first focus, so "Postcode, Billing address, Shown under…".
  const describedByIds = [describedBy, description ? descriptionId : undefined].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset
      {...rest}
      {...nisthaAttr("fieldset", rest)}
      ref={ref}
      aria-describedby={describedByIds}
      data-layout={layout}
      className={cx(styles.fieldset, layout === "side" && styles.side, className)}
    >
      <legend className={styles.legend}>{legend}</legend>
      {description ? (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      ) : null}
      <div className={styles.body}>{children}</div>
    </fieldset>
  );
}
