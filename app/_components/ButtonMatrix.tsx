import { Fragment } from "react";
import { Button } from "agentic-ds-kit";
import type { ButtonAppearance, ButtonMode, ButtonSize } from "agentic-ds-kit";
import styles from "../components/VariantMatrix.module.css";

const APPEARANCES: ButtonAppearance[] = ["solid", "outline", "soft", "ghost"];
const MODES: ButtonMode[] = ["primary", "neutral", "danger"];
const SIZES: ButtonSize[] = ["sm", "md", "lg"];

function Cluster({
  mode,
  disabled = false,
}: {
  mode: ButtonMode;
  disabled?: boolean;
}) {
  return APPEARANCES.map((appearance) => (
    <div key={appearance} className={styles.cluster}>
      {SIZES.map((size) => (
        <Button
          key={size}
          appearance={appearance}
          mode={mode}
          size={size}
          disabled={disabled}
        >
          {size}
        </Button>
      ))}
    </div>
  ));
}

export function ButtonMatrix() {
  return (
    <div className={styles.scroll}>
      <div className={`${styles.grid} ${styles.cols4}`}>
        <span />
        {APPEARANCES.map((appearance) => (
          <span key={appearance} className={styles.colHead}>
            {appearance}
          </span>
        ))}
        {MODES.map((mode) => (
          <Fragment key={mode}>
            <span className={styles.rowLabel}>{mode}</span>
            <Cluster mode={mode} />
          </Fragment>
        ))}
        <div className={styles.band}>
          <span className={styles.rowLabel}>Disabled</span>
          <Cluster mode="neutral" disabled />
        </div>
        <div className={styles.band}>
          <span className={styles.rowLabel}>On grey</span>
          <Cluster mode="neutral" />
        </div>
      </div>
    </div>
  );
}
