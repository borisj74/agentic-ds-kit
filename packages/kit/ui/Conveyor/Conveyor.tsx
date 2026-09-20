"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../Button";
import type { ConveyorProps } from "./Conveyor.types";
import styles from "./Conveyor.module.css";

export type { ConveyorProps, ConveyorOrientation } from "./Conveyor.types";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Conveyor({
  children,
  orientation = "horizontal",
  step,
  label = "Content",
  className = "",
}: ConveyorProps) {
  const across = orientation === "horizontal";
  const trackRef = useRef<HTMLDivElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  const read = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const size = across ? el.clientWidth : el.clientHeight;
    const total = across ? el.scrollWidth : el.scrollHeight;
    const at = Math.max(across ? el.scrollLeft : el.scrollTop, 0);
    setCanBack(at > 1);
    setCanForward(at + size < total - 1);
  }, [across]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    read();
    el.addEventListener("scroll", read, { passive: true });
    const watch = new ResizeObserver(read);
    watch.observe(el);
    for (const child of Array.from(el.children)) watch.observe(child);
    return () => {
      el.removeEventListener("scroll", read);
      watch.disconnect();
    };
  }, [read, children]);

  function go(way: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const size = across ? el.clientWidth : el.clientHeight;
    const by = (step ?? size * 0.8) * way;
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    el.scrollBy(across ? { left: by, behavior } : { top: by, behavior });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const prevKey = across ? "ArrowLeft" : "ArrowUp";
    const nextKey = across ? "ArrowRight" : "ArrowDown";
    if (event.key === prevKey) {
      event.preventDefault();
      go(-1);
    } else if (event.key === nextKey) {
      event.preventDefault();
      go(1);
    }
  }

  const shown = canBack || canForward;
  const spoken = label.toLowerCase();
  const backIcon = across ? "ChevronLeft" : "ChevronUp";
  const forwardIcon = across ? "ChevronRight" : "ChevronDown";
  const backSaid = across ? "left" : "up";
  const forwardSaid = across ? "right" : "down";
  const trackFade =
    canBack && canForward
      ? styles.trackFadeBoth
      : canBack
        ? styles.trackFadeStart
        : canForward
          ? styles.trackFadeEnd
          : "";

  return (
    <div className={`${styles.root} ${styles[orientation]} ${className}`.trim()}>
      {shown ? (
        <div className={styles.end}>
          <Button
            variant="tertiary"
            size="sm"
            iconStart={backIcon}
            ariaLabel={`Scroll ${spoken} ${backSaid}`}
            disabled={!canBack}
            onClick={() => go(-1)}
          />
        </div>
      ) : null}
      <div
        ref={trackRef}
        className={`${styles.track} ${trackFade}`.trim()}
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
      {shown ? (
        <div className={`${styles.end} ${styles.last}`}>
          <Button
            variant="tertiary"
            size="sm"
            iconStart={forwardIcon}
            ariaLabel={`Scroll ${spoken} ${forwardSaid}`}
            disabled={!canForward}
            onClick={() => go(1)}
          />
        </div>
      ) : null}
      {shown ? (
        <div className={`${styles.fade} ${canBack ? "" : styles.fadeClear}`.trim()} aria-hidden />
      ) : null}
      {shown ? (
        <div className={`${styles.fade} ${styles.fadeLast} ${canForward ? "" : styles.fadeClear}`.trim()} aria-hidden />
      ) : null}
    </div>
  );
}
