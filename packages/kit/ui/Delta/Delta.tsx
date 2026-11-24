import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import type { DeltaDirection, DeltaProps, DeltaTone } from "./Delta.types";
import { cx } from "../shared/cx";
import styles from "./Delta.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { DeltaProps, DeltaDirection, DeltaTone, DeltaSize } from "./Delta.types";

const ICON_PX = { sm: 12, md: 14 } as const;

const ARROW = { up: ArrowUp, down: ArrowDown, flat: ArrowRight } as const;

const DEFAULT_TONE: Record<DeltaDirection, DeltaTone> = {
  up: "success",
  down: "danger",
  flat: "neutral",
};

export function Delta({ value, direction, tone, size = "md", className, ref, ...rest }: DeltaProps) {
  const Arrow = ARROW[direction];
  const resolvedTone = tone ?? DEFAULT_TONE[direction];
  return (
    <span
      {...rest} {...nisthaAttr("delta", rest)}
      ref={ref}
      className={cx(styles.delta, styles[size], styles[resolvedTone], className)}
    >
      <Arrow size={ICON_PX[size]} strokeWidth={ICON_STROKE} aria-hidden className={styles.icon} />
      <span className={styles.value}>{value}</span>
    </span>
  );
}
