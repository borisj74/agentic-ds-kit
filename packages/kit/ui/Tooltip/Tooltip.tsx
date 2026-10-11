"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cx } from "../shared/cx";
import styles from "./Tooltip.module.css";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

/** Native span attributes the kit sets itself on the bubble (or replaces with its own prop). */
type TooltipOwnedKeys = "children" | "content" | "className" | "id" | "role";

/**
 * `ref` and other native attributes go to the `role="tooltip"` bubble.
 * `className` stays on the wrapper around the trigger (its meaning before escape hatches).
 */
export interface TooltipProps extends Omit<ComponentPropsWithoutRef<"span">, TooltipOwnedKeys> {
  content: string;
  placement?: TooltipPlacement;
  delay?: number;
  open?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}

export function Tooltip({
  content,
  placement = "top",
  delay = 150,
  open: controlledOpen,
  disabled = false,
  children,
  className,
  ref,
  ...rest
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
      className={cx(styles.wrapper, className)}
      onPointerEnter={() => show()}
      onPointerLeave={hide}
      onFocus={() => show(true)}
      onBlur={hide}
    >
      {trigger}
      <span
        {...rest}
        ref={ref}
        id={tooltipId}
        role="tooltip"
        className={cx(styles.bubble, styles[placement], open && styles.open)}
      >
        {content}
        <span className={styles.arrow} aria-hidden="true" />
      </span>
    </span>
  );
}
