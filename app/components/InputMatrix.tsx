import { Fragment } from "react";
import { Input } from "agentic-ds-kit";
import type { InputSize } from "agentic-ds-kit";
import styles from "./VariantMatrix.module.css";

const SIZES: InputSize[] = ["sm", "md", "lg"];

const ROWS = [
  { id: "rest", label: "Rest" },
  { id: "error", label: "Error" },
  { id: "disabled", label: "Disabled" },
] as const;

export function InputMatrix() {
  return (
    <div className={styles.scroll}>
      <div className={`${styles.grid} ${styles.cols3} ${styles.fit}`}>
        <span />
        {SIZES.map((size) => (
          <span key={size} className={styles.colHead}>
            {size}
          </span>
        ))}
        {ROWS.map((row) => (
          <Fragment key={row.id}>
            <span className={styles.rowLabel}>{row.label}</span>
            {SIZES.map((size) => (
              <Input
                key={size}
                id={`input-matrix-${row.id}-${size}`}
                size={size}
                ariaLabel={`${row.label} ${size}`}
                placeholder="Ada Lovelace"
                defaultValue={row.id === "error" ? "ada@" : undefined}
                error={row.id === "error"}
                disabled={row.id === "disabled"}
              />
            ))}
          </Fragment>
        ))}
        <div className={styles.band}>
          <span className={styles.rowLabel}>On grey</span>
          {SIZES.map((size) => (
            <Input
              key={size}
              id={`input-matrix-grey-${size}`}
              size={size}
              ariaLabel={`On grey ${size}`}
              placeholder="Ada Lovelace"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
