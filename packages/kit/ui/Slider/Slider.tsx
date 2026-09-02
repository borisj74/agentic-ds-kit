"use client";

import { useCallback, useRef, type KeyboardEvent, type PointerEvent } from "react";
import type { SliderProps } from "./Slider.types";
import styles from "./Slider.module.css";

export type { SliderProps, SliderOrientation } from "./Slider.types";

function clampValue(value: number, min: number, max: number, step: number): number {
  if (!Number.isFinite(value)) return min;
  const span = max - min;
  if (span <= 0) return min;
  const steps = Math.round((value - min) / step);
  const snapped = min + steps * step;
  return Math.min(max, Math.max(min, snapped));
}

function toPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}

function nearestThumbIndex(values: number[], target: number): number {
  if (values.length <= 1) return 0;
  let best = 0;
  let bestDist = Math.abs(values[0] - target);
  for (let i = 1; i < values.length; i += 1) {
    const dist = Math.abs(values[i] - target);
    if (dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  }
  return best;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  disabled = false,
  onValueChange,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const values = Array.isArray(value) ? value : [value];
  const isVertical = orientation === "vertical";
  const isRange = Array.isArray(value);

  const commit = useCallback(
    (index: number, next: number) => {
      if (disabled || !onValueChange) return;
      const clamped = clampValue(next, min, max, step);
      if (isRange) {
        const copy = [...(value as number[])];
        copy[index] = clamped;
        if (copy.length === 2) {
          if (index === 0 && copy[0] > copy[1]) copy[0] = copy[1];
          if (index === 1 && copy[1] < copy[0]) copy[1] = copy[0];
        }
        onValueChange(copy);
      } else {
        onValueChange(clamped);
      }
    },
    [disabled, isRange, max, min, onValueChange, step, value],
  );

  const pointerToValue = useCallback(
    (clientX: number, clientY: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const ratio = isVertical
        ? 1 - (clientY - rect.top) / rect.height
        : (clientX - rect.left) / rect.width;
      const raw = min + Math.min(1, Math.max(0, ratio)) * (max - min);
      return clampValue(raw, min, max, step);
    },
    [isVertical, min, max, step],
  );

  const onTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = pointerToValue(event.clientX, event.clientY);
    const index = nearestThumbIndex(values, target);
    commit(index, target);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onTrackPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || disabled) return;
    const target = pointerToValue(event.clientX, event.clientY);
    const index = nearestThumbIndex(values, target);
    commit(index, target);
  };

  const onThumbKeyDown = (index: number, event: KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    const current = values[index];
    let next = current;
    const big = step * 10;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = current + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = current - step;
        break;
      case "PageUp":
        next = current + big;
        break;
      case "PageDown":
        next = current - big;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }

    event.preventDefault();
    commit(index, next);
  };

  const sorted = [...values].sort((a, b) => a - b);
  const fillStart = toPercent(sorted[0], min, max);
  const fillEnd = toPercent(sorted[sorted.length - 1], min, max);

  const fillStyle = isVertical
    ? { bottom: `${fillStart}%`, height: `${fillEnd - fillStart}%` }
    : { left: `${fillStart}%`, width: `${fillEnd - fillStart}%` };

  return (
    <div
      className={`${styles.root} ${styles[orientation]}${disabled ? ` ${styles.disabled}` : ""}`}
    >
      <div
        ref={trackRef}
        className={styles.track}
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
      >
        <div className={styles.fill} style={fillStyle} aria-hidden />
        {values.map((thumbValue, index) => {
          const percent = toPercent(thumbValue, min, max);
          const thumbStyle = isVertical
            ? { bottom: `${percent}%` }
            : { left: `${percent}%` };

          return (
            <span
              key={index}
              role="slider"
              className={styles.thumb}
              tabIndex={disabled ? -1 : 0}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={thumbValue}
              aria-orientation={orientation}
              aria-disabled={disabled || undefined}
              style={thumbStyle}
              onKeyDown={(event) => onThumbKeyDown(index, event)}
              onPointerDown={(event) => {
                event.stopPropagation();
                if (disabled) return;
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId) || disabled) return;
                commit(index, pointerToValue(event.clientX, event.clientY));
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
