import type { CSSProperties } from "react";
import type { SkeletonProps } from "./Skeleton.types";
import styles from "./Skeleton.module.css";

export type { SkeletonProps, SkeletonShape, SkeletonSize, SkeletonAnimation } from "./Skeleton.types";

function px(value?: string | number): string | undefined {
  if (value == null) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export function Skeleton({
  shape = "text",
  lines = 1,
  size = "md",
  width,
  height,
  animation = "shimmer",
  loading = true,
  children,
  label = "Loading",
}: SkeletonProps) {
  if (!loading) return <>{children}</>;

  const count = shape === "text" ? Math.max(Math.floor(lines), 1) : 1;
  const box: CSSProperties =
    shape === "circle" ? { width: px(width), height: px(width) } : { width: px(width), height: px(height) };

  return (
    <span
      className={`${styles.root} ${styles[shape]} ${styles[size]} ${styles[animation]}`}
      style={shape === "text" ? { width: px(width) } : undefined}
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
