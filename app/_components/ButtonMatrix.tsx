import { Button } from "agentic-ds-kit";
import type { ButtonAppearance, ButtonMode, ButtonSize } from "agentic-ds-kit";
import styles from "./ButtonMatrix.module.css";

const APPEARANCES: ButtonAppearance[] = ["solid", "outline", "soft", "ghost"];
const MODES: ButtonMode[] = ["primary", "neutral", "danger"];
const SIZES: ButtonSize[] = ["sm", "md", "lg"];

export function ButtonMatrix() {
  return (
    <div className={styles.stack}>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Appearance × mode</h3>
        <div className={styles.matrix}>
          {MODES.map((mode) => (
            <div key={mode} className={styles.matrixRow}>
              <span className={styles.rowLabel}>{mode}</span>
              <div className={styles.cells}>
                {APPEARANCES.map((appearance) => (
                  <Button key={appearance} appearance={appearance} mode={mode} size="md">
                    {appearance}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Sizes</h3>
        <div className={styles.cells}>
          {SIZES.map((size) => (
            <Button key={size} appearance="outline" mode="neutral" size={size}>
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Disabled</h3>
        <div className={styles.cells}>
          {APPEARANCES.map((appearance) => (
            <Button key={appearance} appearance={appearance} mode="neutral" size="md" disabled>
              {appearance}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
