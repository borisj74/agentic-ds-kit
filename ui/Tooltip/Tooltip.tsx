"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import styles from "./Tooltip.module.css";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: string;
  placement?: TooltipPlacement;
  delay?: number;
  open?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function Tooltip({
  content,
  placement = "top",
  delay = 150,
  open: controlledOpen,
  disabled = false,
  children,
  className = "",
}: TooltipProps) {
  const tooltipId = useId();
  const timerRef = useRef<number | null>(null);
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = !disabled && (isControlled ? controlledOpen : uncontrolledOpen);

  function clearTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function show(immediate = false) {
    if (disabled || isControlled) return;
    clearTimer();
    if (immediate || delay <= 0) {
      setUncontrolledOpen(true);
      return;
    }
    timerRef.current = window.setTimeout(() => setUncontrolledOpen(true), delay);
  }

  function hide() {
    if (isControlled) return;
    clearTimer();
    setUncontrolledOpen(false);
  }

  useEffect(() => () => clearTimer(), []);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") hide();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": open ? tooltipId : undefined,
      })
    : children;

  return (
    <span
      className={`${styles.wrapper} ${className}`.trim()}
      onPointerEnter={() => show()}
      onPointerLeave={hide}
      onFocus={() => show(true)}
      onBlur={hide}
    >
      {trigger}
      <span
        id={tooltipId}
        role="tooltip"
        className={`${styles.bubble} ${styles[placement]}${open ? ` ${styles.open}` : ""}`}
      >
        {content}
        <span className={styles.arrow} aria-hidden="true" />
      </span>
    </span>
  );
}
