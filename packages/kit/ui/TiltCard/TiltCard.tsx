"use client";

import type { PointerEvent } from "react";
import { Card } from "../Card";
import type { TiltCardProps } from "./TiltCard.types";
import { cx } from "../shared/cx";
import styles from "./TiltCard.module.css";

export type { TiltCardProps } from "./TiltCard.types";

const MAX_TILT = 6;

function reset(element: HTMLElement) {
  element.style.setProperty("--tilt-rx", "0deg");
  element.style.setProperty("--tilt-ry", "0deg");
  delete element.dataset.tilting;
}

/**
 * A kit Card that tilts a few degrees toward the pointer, with a soft highlight that follows it,
 * for rare showcase spots (a pricing highlight, a docs gallery). Mouse and pen only; keyboard
 * focus inside it gives a static lift, never a tilt. Off under reduced motion.
 */
export function TiltCard({
  tilt = true,
  maxTilt = MAX_TILT,
  disabled = false,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...rest
}: TiltCardProps) {
  const active = tilt && !disabled;
  const limit = Math.max(0, Math.min(maxTilt, MAX_TILT));

  function handleMove(event: PointerEvent<HTMLElement>) {
    onPointerMove?.(event);
    if (!active || event.pointerType === "touch") return;
    const element = event.currentTarget;
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    element.dataset.tilting = "";
    element.style.setProperty("--tilt-rx", `${((0.5 - y) * 2 * limit).toFixed(2)}deg`);
    element.style.setProperty("--tilt-ry", `${((x - 0.5) * 2 * limit).toFixed(2)}deg`);
    element.style.setProperty("--tilt-x", x.toFixed(3));
    element.style.setProperty("--tilt-y", y.toFixed(3));
  }

  function handleLeave(event: PointerEvent<HTMLElement>) {
    onPointerLeave?.(event);
    reset(event.currentTarget);
  }

  return (
    <Card
      {...rest}
      className={cx(styles.root, disabled && styles.disabled, className)}
      aria-disabled={disabled || undefined}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <div className={styles.body}>{children}</div>
      {active ? (
        <span className={styles.sheen} aria-hidden="true">
          <span className={styles.glow} />
        </span>
      ) : null}
    </Card>
  );
}
