"use client";

import { useState, type ReactNode } from "react";
import type { BlurCrossfadeProps } from "./BlurCrossfade.types";
import { cx } from "../shared/cx";
import styles from "./BlurCrossfade.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { BlurCrossfadeProps, BlurCrossfadeDuration } from "./BlurCrossfade.types";

interface Frame {
  key: string | number;
  /** The children as they were when this key arrived; becomes the outgoing layer on the next swap. */
  snapshot: ReactNode;
  previous: ReactNode | null;
  id: number;
}

/**
 * Crossfades one child to the next when `contentKey` changes: the old value fades out while the
 * new one fades in on top of it, for value and state swaps (Running → Done, a thumbnail, a chart).
 * Opacity plus a short blur (≤ 6px): the kit's one approved filter exception; no blur under
 * reduced motion.
 */
export function BlurCrossfade({
  children,
  contentKey,
  duration = "fast",
  label,
  className,
  ref,
  ...rest
}: BlurCrossfadeProps) {
  const [frame, setFrame] = useState<Frame>(() => ({
    key: contentKey,
    snapshot: children,
    previous: null,
    id: 0,
  }));

  if (frame.key !== contentKey) {
    setFrame({ key: contentKey, snapshot: children, previous: frame.snapshot, id: frame.id + 1 });
  }

  const swapping = frame.previous !== null;

  return (
    <span
      {...rest} {...nisthaAttr("blurcrossfade", rest)}
      ref={ref}
      className={cx(styles.root, styles[duration], className)}
      data-swapping={swapping ? "" : undefined}
    >
      {swapping ? (
        <span
          key={`out-${frame.id}`}
          className={cx(styles.layer, styles.leaving)}
          aria-hidden="true"
          inert
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            const id = frame.id;
            setFrame((current) => (current.id === id ? { ...current, previous: null } : current));
          }}
        >
          {frame.previous}
        </span>
      ) : null}
      <span key={`in-${frame.id}`} className={cx(styles.layer, frame.id > 0 && styles.entering)}>
        {children}
      </span>
      {label ? (
        <span className={styles.srOnly} aria-live="polite">
          {label}
        </span>
      ) : null}
    </span>
  );
}
