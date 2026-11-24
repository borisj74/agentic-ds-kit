"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { measureFloating, type FloatingPlacement } from "../shared/placeFloating";
import { useIsClient } from "../shared/useIsClient";
import { useThemeScopeMarker } from "../shared/themeScope";
import styles from "./Tooltip.module.css";
import { nisthaAttr } from "../shared/inspect";

export type TooltipPlacement = FloatingPlacement;

/** Native span attributes the kit sets itself on the bubble (or replaces with its own prop). */
type TooltipOwnedKeys = "children" | "content" | "className" | "id" | "role" | "style";

/** Pointer can leave the trigger for this long (onto the bubble, or back) before it hides. */
const HIDE_GRACE_MS = 100;

/**
 * `ref` and other native attributes go to the `role="tooltip"` bubble, which is portaled to
 * document.body and mounted only while open (so `ref` is null while closed).
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
  const scope = useThemeScopeMarker();
  const mounted = useIsClient();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const setBubbleRef = useMemo(() => mergeRefs(bubbleRef, ref), [ref]);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const pinnedRef = useRef(false);
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [coords, setCoords] = useState<CSSProperties | null>(null);
  const [resolvedPlacement, setResolvedPlacement] = useState<TooltipPlacement>(placement);
  const open = !disabled && (isControlled ? controlledOpen : uncontrolledOpen);

  // Closed: forget the last position and go back to the preferred side.
  const [resetFor, setResetFor] = useState({ open, placement });
  if (resetFor.open !== open || resetFor.placement !== placement) {
    setResetFor({ open, placement });
    if (!open) {
      setCoords(null);
      setResolvedPlacement(placement);
    }
  }

  function clearTimers() {
    if (showTimerRef.current != null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }

  function show(immediate = false) {
    if (disabled || isControlled) return;
    clearTimers();
    if (immediate || delay <= 0) {
      setUncontrolledOpen(true);
      return;
    }
    showTimerRef.current = window.setTimeout(() => setUncontrolledOpen(true), delay);
  }

  function hide() {
    if (isControlled) return;
    clearTimers();
    pinnedRef.current = false;
    setUncontrolledOpen(false);
  }

  function scheduleHide(event?: ReactPointerEvent) {
    if (isControlled || pinnedRef.current) return;
    // Touch fires pointerleave right after the tap that pinned it; only a mouse or pen leaves.
    if (event?.pointerType === "touch") return;
    clearTimers();
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      if (!pinnedRef.current) setUncontrolledOpen(false);
    }, HIDE_GRACE_MS);
  }

  useEffect(() => () => clearTimers(), []);

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = wrapperRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;
    const next = measureFloating(placement, trigger, bubble);
    setResolvedPlacement(next.placement);
    setCoords(next.style);
  }, [open, placement, content, mounted]);

  useEffect(() => {
    if (!open || isControlled) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // Mark it handled so a parent Modal/Drawer keeps open while this tooltip closes.
      event.preventDefault();
      hide();
    }
    // A tap pins it on touch; a tap anywhere else closes it.
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || bubbleRef.current?.contains(target)) return;
      hide();
    }
    function onMove() {
      const trigger = wrapperRef.current;
      const bubble = bubbleRef.current;
      if (!trigger || !bubble) return;
      const next = measureFloating(placement, trigger, bubble);
      setResolvedPlacement(next.placement);
      setCoords(next.style);
    }
    // Capture phase: runs before a parent Modal/Drawer listener, which then skips the prevented Escape.
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hide is a render-scope helper; re-registering it every render adds nothing.
  }, [open, isControlled, placement]);

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": open ? tooltipId : undefined,
      })
    : children;

  const bubble =
    open && mounted
      ? createPortal(
          <span
            {...rest}
            ref={setBubbleRef}
            id={tooltipId}
            role="tooltip"
            data-theme-scope={scope.id}
            data-theme={scope.mode === "dark" ? "dark" : undefined}
            data-placement={resolvedPlacement}
            className={cx(styles.bubble, coords && styles.open, scope.fontClassName)}
            style={coords ?? undefined}
            onPointerEnter={clearTimers}
            onPointerLeave={scheduleHide}
          >
            {content}
            <span className={styles.arrow} aria-hidden="true" />
          </span>,
          document.body,
        )
      : null;

  return (
    <span
      {...nisthaAttr("tooltip")}
      ref={wrapperRef}
      className={cx(styles.wrapper, className)}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") show();
      }}
      onPointerLeave={scheduleHide}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch" || disabled || isControlled) return;
        clearTimers();
        pinnedRef.current = true;
        setUncontrolledOpen(true);
      }}
      onFocus={() => show(true)}
      onBlur={() => {
        if (!pinnedRef.current) hide();
      }}
    >
      {trigger}
      {bubble}
    </span>
  );
}
