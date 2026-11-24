import type { CSSProperties } from "react";
import type { SkeletonProps } from "./Skeleton.types";
import { cx } from "../shared/cx";
import styles from "./Skeleton.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { SkeletonProps, SkeletonShape, SkeletonSize, SkeletonAnimation, SkeletonLayout } from "./Skeleton.types";

const LAYOUT_ROWS = { table: 5, card: 3, list: 3 } as const;
const TABLE_COLUMNS = 4;

function px(value?: string | number): string | undefined {
  if (value == null) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export function Skeleton({
  shape = "text",
  layout,
  lines,
  size = "md",
  width,
  height,
  animation = "shimmer",
  loading = true,
  children,
  label = "Loading",
  className,
  style,
  ref,
  ...rest
}: SkeletonProps) {
  if (!loading) return <>{children}</>;

  if (layout) {
    const rows = Math.max(Math.floor(lines ?? LAYOUT_ROWS[layout]), 1);
    const bone = (extra?: string, key?: number) => (
      <span key={key} className={cx(styles.bone, extra && styles[extra])} aria-hidden="true" />
    );
    let body;
    if (layout === "table") {
      const cells = (head: boolean) =>
        Array.from({ length: TABLE_COLUMNS }, (_, col) => (
          <span key={col} className={styles.cell}>
            {bone(head ? "boneHead" : col === 0 ? undefined : "boneShort")}
          </span>
        ));
      body = (
        <>
          <span className={cx(styles.row, styles.headRow)}>{cells(true)}</span>
          {Array.from({ length: rows }, (_, row) => (
            <span key={row} className={styles.row}>
              {cells(false)}
            </span>
          ))}
        </>
      );
    } else if (layout === "list") {
      body = Array.from({ length: rows }, (_, row) => (
        <span key={row} className={styles.row}>
          {bone("boneAvatar")}
          <span className={styles.stack}>
            {bone("boneTitle")}
            {bone("boneMeta")}
          </span>
        </span>
      ));
    } else {
      body = (
        <>
          <span className={styles.row}>
            {bone("boneTile")}
            {bone("boneTitle")}
          </span>
          <span className={styles.stack}>
            {Array.from({ length: rows }, (_, line) => bone(rows > 1 && line === rows - 1 ? "last" : undefined, line))}
          </span>
        </>
      );
    }
    return (
      <span
        {...rest} {...nisthaAttr("skeleton", rest)}
        ref={ref}
        className={cx(styles.root, styles.layout, styles[layout], styles[animation], className)}
        style={{ ...style, width: px(width) }}
        aria-busy="true"
      >
        {label ? <span className={styles.srOnly}>{label}</span> : null}
        {body}
      </span>
    );
  }

  const count = shape === "text" ? Math.max(Math.floor(lines ?? 1), 1) : 1;
  const box: CSSProperties =
    shape === "circle" ? { width: px(width), height: px(width) } : { width: px(width), height: px(height) };

  return (
    <span
      {...rest} {...nisthaAttr("skeleton", rest)}
      ref={ref}
      className={cx(styles.root, styles[shape], styles[size], styles[animation], className)}
      style={shape === "text" ? { ...style, width: px(width) } : style}
      aria-busy="true"
    >
      {label ? <span className={styles.srOnly}>{label}</span> : null}
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={`${styles.bone}${count > 1 && index === count - 1 ? ` ${styles.last}` : ""}`}
          style={shape === "text" ? undefined : box}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
