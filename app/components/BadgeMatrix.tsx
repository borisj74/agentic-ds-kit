import { Fragment } from "react";
import { Badge } from "agentic-ds-kit";
import type { BadgeAppearance, BadgeSize, BadgeTone } from "agentic-ds-kit";
import styles from "./VariantMatrix.module.css";

const APPEARANCES: BadgeAppearance[] = ["soft", "tint", "solid", "outline"];
const TONES: BadgeTone[] = ["neutral", "primary", "success", "warning", "danger", "info", "highlight"];
const SIZES: BadgeSize[] = ["sm", "md", "lg"];

const STATUS = [
  { tone: "success", label: "Active" },
  { tone: "warning", label: "Pending" },
  { tone: "danger", label: "Failed" },
  { tone: "neutral", label: "Draft" },
] as const;

function Cluster({ tone, disabled = false }: { tone: BadgeTone; disabled?: boolean }) {
  return APPEARANCES.map((appearance) => (
    <div key={appearance} className={styles.cluster}>
      {SIZES.map((size) => (
        <Badge key={size} appearance={appearance} tone={tone} size={size} disabled={disabled}>
          {size}
        </Badge>
      ))}
    </div>
  ));
}

export function BadgeMatrix() {
  return (
    <div className={styles.scroll}>
      <div className={`${styles.grid} ${styles.cols4}`}>
        <div className={styles.band}>
          <span className={styles.rowLabel}>Status</span>
          <div className={styles.presets}>
            {STATUS.map((item) => (
              <Badge key={item.label} appearance="soft" tone={item.tone} size="md">
                {item.label}
              </Badge>
            ))}
          </div>
        </div>
        <span />
        {APPEARANCES.map((appearance) => (
          <span key={appearance} className={styles.colHead}>
            {appearance}
          </span>
        ))}
        {TONES.map((tone) => (
          <Fragment key={tone}>
            <span className={styles.rowLabel}>{tone}</span>
            <Cluster tone={tone} />
          </Fragment>
        ))}
        <div className={styles.band}>
          <span className={styles.rowLabel}>Disabled</span>
          <Cluster tone="neutral" disabled />
        </div>
        <div className={styles.band}>
          <span className={styles.rowLabel}>On grey</span>
          <Cluster tone="primary" />
        </div>
      </div>
    </div>
  );
}
