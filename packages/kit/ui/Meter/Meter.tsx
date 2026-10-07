import type { CSSProperties } from "react";
import type { MeterIntent, MeterProps } from "./Meter.types";
import styles from "./Meter.module.css";

export type {
  MeterProps,
  MeterShape,
  MeterSize,
  MeterThresholds,
  MeterIntent,
} from "./Meter.types";

type Zone = "danger" | "warning" | "success";

const ZONES: Zone[] = ["danger", "warning", "success"];
const EDGES = [100 / 3, 200 / 3];
const CENTER = 48;
const RADIUS = 44;
const STROKE = 8;

function zoneOf(percent: number): Zone {
  if (percent < EDGES[0]) return "danger";
  if (percent < EDGES[1]) return "warning";
  return "success";
}

export function Meter({
  value,
  label = "Progress",
  shape = "bar",
  size = "md",
  thresholds = "none",
  intent,
  referenceLines = false,
  showValue = false,
  datatip,
}: MeterProps) {
  const indeterminate = value === "indeterminate";
  const percent = indeterminate
    ? 0
    : Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 100);
  const rounded = Math.round(percent);
  const zone = zoneOf(percent);
  const fillIntent: MeterIntent | Zone = intent ?? (thresholds === "bar" ? zone : "info");
  const trackIntent = thresholds === "plotArea" ? zone : "neutral";
  const a11y = indeterminate
    ? ({
        role: "progressbar",
        "aria-label": label,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
      } as const)
    : ({
        role: "progressbar",
        "aria-label": label,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": rounded,
        "aria-valuetext": datatip ? `${rounded}%, ${datatip}` : `${rounded}%`,
      } as const);

  if (indeterminate) {
    return (
      <div className={`${styles.progress} ${styles.bar} ${styles[size]}`} {...a11y}>
        <div className={styles.barRow}>
          <div className={styles.trackWrap}>
            <div className={`${styles.track} ${styles.neutral}`}>
              <span className={`${styles.fill} ${styles.slide} ${styles[intent ?? "info"]}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (shape === "bar") {
    return (
      <div className={`${styles.progress} ${styles.bar} ${styles[size]}`} {...a11y}>
        {datatip ? (
          <div className={styles.tipRow} aria-hidden="true">
            <span className={styles.tip} style={{ left: `${percent}%`, transform: `translateX(-${percent}%)` }}>
              {datatip}
            </span>
          </div>
        ) : null}
        <div className={styles.barRow}>
          <div className={styles.trackWrap}>
            <div className={`${styles.track} ${styles[trackIntent]}`}>
              {thresholds === "all"
                ? ZONES.map((band) => <span key={band} className={`${styles.band} ${styles[band]}`} />)
                : null}
              <span className={`${styles.fill} ${styles[fillIntent]}`} style={{ width: `${percent}%` }} />
            </div>
            {referenceLines
              ? EDGES.map((edge) => (
                  <span key={edge} className={styles.marker} style={{ left: `${edge}%` }} aria-hidden="true" />
                ))
              : null}
          </div>
          {showValue ? (
            <span className={styles.value} aria-hidden="true">
              {rounded}%
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  const semi = shape === "semicircle";
  const total = semi ? 200 : 100;
  const arc = (from: number, to: number, className: string) => (
    <circle
      key={className + from}
      className={className}
      cx={CENTER}
      cy={semi ? 0 : CENTER}
      r={RADIUS}
      pathLength={total}
      strokeDasharray={`${Math.max(to - from, 0)} ${total}`}
      strokeDashoffset={-from}
    />
  );
  const angle = (share: number) =>
    semi ? Math.PI - (share / 100) * Math.PI : -Math.PI / 2 + (share / 100) * 2 * Math.PI;
  const point = (share: number, radius: number) => {
    const a = angle(share);
    return { x: CENTER + radius * Math.cos(a), y: (semi ? 0 : CENTER) + radius * Math.sin(a) };
  };
  const height = semi ? CENTER : CENTER * 2;
  const tipAt = point(percent, RADIUS + STROKE / 2);
  const ringStyle = {
    transform: semi ? "scale(-1, 1)" : "rotate(-90deg)",
    transformOrigin: semi ? `${CENTER}px 0` : `${CENTER}px ${CENTER}px`,
  } as CSSProperties;

  return (
    <div className={`${styles.progress} ${styles.ring}${semi ? ` ${styles.semi}` : ""} ${styles[size]}`} {...a11y}>
      <svg className={styles.svg} viewBox={`0 0 ${CENTER * 2} ${height}`} aria-hidden="true">
        <g style={ringStyle} strokeWidth={STROKE} fill="none">
          {arc(0, total, `${styles.arc} ${styles[trackIntent]}`)}
          {thresholds === "all"
            ? ZONES.map((band, index) =>
                arc(
                  (index * total) / 3 / (semi ? 2 : 1),
                  ((index + 1) * total) / 3 / (semi ? 2 : 1),
                  `${styles.arc} ${styles[band]}`,
                ),
              )
            : null}
          {arc(0, (percent / 100) * (semi ? 100 : total), `${styles.arc} ${styles[fillIntent]}`)}
        </g>
        {referenceLines
          ? EDGES.map((edge) => {
              const start = point(edge, RADIUS - STROKE / 2 - 2);
              const end = point(edge, RADIUS + STROKE / 2 + 2);
              return (
                <line
                  key={edge}
                  className={styles.tick}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                />
              );
            })
          : null}
      </svg>
      {showValue ? (
        <span className={styles.value} aria-hidden="true">
          {rounded}%
        </span>
      ) : null}
      {datatip ? (
        <span
          className={styles.tip}
          aria-hidden="true"
          style={{ left: `${(tipAt.x / (CENTER * 2)) * 100}%`, top: `${(tipAt.y / height) * 100}%` }}
        >
          {datatip}
        </span>
      ) : null}
    </div>
  );
}
