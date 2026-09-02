import type { CSSProperties } from "react";
import type { ShimmerTextProps, ShimmerTextSpeed } from "./ShimmerText.types";
import styles from "./ShimmerText.module.css";

export type { ShimmerTextProps, ShimmerTextSize, ShimmerTextSpeed } from "./ShimmerText.types";

const NAMED_SPEED_FACTORS: Record<Exclude<ShimmerTextSpeed, number>, number> = {
  slow: 6,
  normal: 4,
  fast: 3,
};

function getDurationFactor(speed: ShimmerTextSpeed): number {
  if (typeof speed === "number") return speed;
  return NAMED_SPEED_FACTORS[speed];
}

export function ShimmerText({
  children,
  size = "md",
  speed = "normal",
  className = "",
  style,
}: ShimmerTextProps) {
  const text = String(children);
  const characters = Array.from(text);
  const phaseSpan = Math.max(characters.length - 1, 1);
  const cssVars = {
    "--shimmer-duration-factor": getDurationFactor(speed),
    ...style,
  } as CSSProperties;

  return (
    <span className={`${styles.root} ${styles[size]} ${className}`.trim()} style={cssVars} aria-label={text}>
      <span className={styles.content} aria-hidden="true">
        {characters.map((character, index) => (
          <span
            className={styles.character}
            style={{ "--shimmer-phase": 1 - index / phaseSpan } as CSSProperties}
            key={`${character}-${index}`}
          >
            {character}
          </span>
        ))}
      </span>
    </span>
  );
}
