import type { ColorRamp, RampStep } from "agentic-ds-kit/color-ramp";
import { RAMP_STEPS } from "@/lib/theme-playground";
import styles from "./theme.module.css";

export function ThemeRamp({
  label,
  ramp,
  marked,
}: {
  label: string;
  ramp: ColorRamp;
  marked?: RampStep;
}) {
  return (
    <ul className={styles.ramp} aria-label={label}>
      {RAMP_STEPS.map((step) => (
        <li key={step} className={styles.step}>
          <span
            className={step === marked ? `${styles.swatch} ${styles.swatchCurrent}` : styles.swatch}
            style={{ backgroundColor: ramp[step] }}
            title={`${step} ${ramp[step]}`}
          />
          <span className={styles.stepLabel}>{step}</span>
        </li>
      ))}
    </ul>
  );
}
