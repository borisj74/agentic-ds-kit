import type { CSSProperties } from "react";
import { useId } from "react";
import type { ProgressProps } from "./Progress.types";
import styles from "./Progress.module.css";

export type {
  ProgressProps,
  ProgressShape,
  ProgressSize,
  ProgressValuePosition,
  ProgressTone,
} from "./Progress.types";

const RING = {
  sm: { size: 56, stroke: 5 },
  md: { size: 96, stroke: 8 },
  lg: { size: 196, stroke: 16 },
} as const;

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function Progress({
  value = 0,
  size = "md",
  shape = "bar",
  label,
  showValue = false,
  valuePosition = "end",
  tone = "brand",
  ariaLabel,
}: ProgressProps) {
  const uid = useId();
  const percent = clamp(value);
  const rounded = Math.round(percent);
  const labelId = label ? `${uid}-label` : undefined;
  const isRing = shape === "circle" || shape === "semicircle";
  const isSemi = shape === "semicircle";
  const overlay = !isRing && showValue && valuePosition === "overlay";
  const metaValue = !isRing && showValue && valuePosition === "end" && Boolean(label);
  const endBeside = !isRing && showValue && valuePosition === "end" && !label;
  const holeValue = isRing && showValue;
  const showMeta = Boolean(label) || metaValue;
  const unnamed = ariaLabel || `${rounded}%`;

  const a11y = {
    role: "progressbar" as const,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-valuenow": rounded,
    "aria-valuetext": `${rounded}%`,
    "aria-labelledby": labelId,
    "aria-label": label ? undefined : unnamed,
  };

  const track = (
    <div className={styles.track} {...a11y}>
      <div className={styles.fill} style={{ width: `${percent}%` }} />
      {overlay ? <span className={styles.overlayValue}>{rounded}%</span> : null}
    </div>
  );

  let meter = null;
  if (isRing) {
    const ring = RING[size];
    const ringSize = ring.size;
    const stroke = ring.stroke;
    const radius = (ringSize - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const visible = isSemi ? circumference / 2 : circumference;
    const dashOffset = visible * (1 - percent / 100);
    const cx = ringSize / 2;
    const cy = ringSize / 2;
    const viewBox = isSemi
      ? `0 ${ringSize / 2} ${ringSize} ${ringSize / 2}`
      : `0 0 ${ringSize} ${ringSize}`;
    const svgH = isSemi ? ringSize / 2 : ringSize;
    const semiDash = `${circumference / 2} ${circumference}`;
    const groupTransform = isSemi
      ? `translate(${cx} ${cy}) scale(-1 1) translate(${-cx} ${-cy})`
      : `rotate(-90 ${cx} ${cy})`;
    const arcStyle = {
      "--progress-c": `${visible}`,
      "--progress-offset": `${dashOffset}`,
    } as CSSProperties;

    meter = (
      <div
        className={styles.meter}
        style={{ "--progress-size": `${ringSize}px` } as CSSProperties}
        {...a11y}
      >
        <svg
          className={styles.ring}
          width={ringSize}
          height={svgH}
          viewBox={viewBox}
          overflow="hidden"
          aria-hidden="true"
          focusable="false"
        >
          <g transform={groupTransform}>
            <circle
              className={styles.trackArc}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={isSemi ? semiDash : undefined}
            />
            <circle
              className={styles.valueArc}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={isSemi ? semiDash : circumference}
              style={arcStyle}
            />
          </g>
        </svg>
        {holeValue ? <span className={styles.holeValue}>{rounded}%</span> : null}
      </div>
    );
  }

  const rootClass = [
    styles.root,
    styles[size],
    styles[tone],
    styles[shape],
    overlay ? styles.overlay : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      {showMeta ? (
        <div className={styles.meta}>
          {label ? (
            <span id={labelId} className={styles.label}>
              {label}
            </span>
          ) : (
            <span />
          )}
          {metaValue ? <span className={styles.value}>{rounded}%</span> : null}
        </div>
      ) : null}
      {isRing ? (
        meter
      ) : endBeside ? (
        <div className={styles.row}>
          {track}
          <span className={styles.value}>{rounded}%</span>
        </div>
      ) : (
        track
      )}
    </div>
  );
}
