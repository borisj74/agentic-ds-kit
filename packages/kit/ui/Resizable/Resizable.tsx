"use client";

import { useCallback, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { cx } from "../shared/cx";
import type { ResizableProps } from "./Resizable.types";
import styles from "./Resizable.module.css";

export type { ResizableOrientation, ResizableProps } from "./Resizable.types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function Resizable({
  orientation = "horizontal",
  size: sizeProp,
  defaultSize = 50,
  min = 20,
  max = 80,
  onSizeChange,
  start,
  end,
  startLabel = "Start panel",
  endLabel = "End panel",
  ariaLabel = "Resize panels",
  className,
}: ResizableProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isControlled = sizeProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultSize);
  const size = clamp(isControlled ? sizeProp : uncontrolled, min, max);
  const vertical = orientation === "vertical";

  const emit = useCallback(
    (next: number) => {
      const clamped = clamp(next, min, max);
      if (!isControlled) setUncontrolled(clamped);
      onSizeChange?.(clamped);
    },
    [isControlled, max, min, onSizeChange],
  );

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const root = rootRef.current;
    if (!root) return;
    event.preventDefault();
    const separator = event.currentTarget;
    separator.setPointerCapture(event.pointerId);
    const origin = vertical ? event.clientY : event.clientX;
    const startSize = size;
    const span = vertical ? root.getBoundingClientRect().height : root.getBoundingClientRect().width;

    function onMove(move: PointerEvent) {
      const delta = (vertical ? move.clientY : move.clientX) - origin;
      emit(startSize + (delta / span) * 100);
    }
    function onUp(up: PointerEvent) {
      separator.releasePointerCapture(up.pointerId);
      separator.removeEventListener("pointermove", onMove);
      separator.removeEventListener("pointerup", onUp);
    }
    separator.addEventListener("pointermove", onMove);
    separator.addEventListener("pointerup", onUp);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 10 : 5;
    const grow = vertical ? event.key === "ArrowDown" : event.key === "ArrowRight";
    const shrink = vertical ? event.key === "ArrowUp" : event.key === "ArrowLeft";
    if (grow) {
      event.preventDefault();
      emit(size + step);
    } else if (shrink) {
      event.preventDefault();
      emit(size - step);
    } else if (event.key === "Home") {
      event.preventDefault();
      emit(min);
    } else if (event.key === "End") {
      event.preventDefault();
      emit(max);
    }
  }

  const startStyle = vertical ? { flexBasis: `${size}%` } : { flexBasis: `${size}%` };

  return (
    <div
      ref={rootRef}
      className={cx(styles.root, className)}
      data-orientation={orientation}
    >
      <div className={styles.pane} aria-label={startLabel} style={startStyle}>
        {start}
      </div>
      <div
        className={styles.separator}
        role="separator"
        aria-orientation={vertical ? "horizontal" : "vertical"}
        aria-label={ariaLabel}
        aria-valuenow={Math.round(size)}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={`${Math.round(size)} percent`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
      />
      <div className={cx(styles.pane, styles.paneEnd)} aria-label={endLabel}>
        {end}
      </div>
    </div>
  );
}
