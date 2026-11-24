"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
} from "react";
import { createPortal } from "react-dom";
import type { HelpPopoverProps } from "./HelpPopover.types";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import styles from "./HelpPopover.module.css";
import { useIsClient } from "../shared/useIsClient";
import { useThemeScopeMarker } from "../shared/themeScope";
import { nisthaAttr } from "../shared/inspect";
import { measureFloating } from "../shared/placeFloating";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";

export type { HelpPopoverProps, HelpPopoverPlacement } from "./HelpPopover.types";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const HIDE_GRACE_MS = 100;

export function HelpPopover({
  title,
  content,
  placement = "bottom",
  delay = 150,
  open: controlledOpen,
  disabled = false,
  children,
  className,
  ref,
  ...rest
}: HelpPopoverProps) {
  const descriptionId = useId();
  const scope = useThemeScopeMarker();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const setPanelRef = useMemo(() => mergeRefs(panelRef, ref), [ref]);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const pinnedRef = useRef(false);
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const mounted = useIsClient();
  const [coords, setCoords] = useState<CSSProperties | null>(null);
  const [resolvedPlacement, setResolvedPlacement] = useState(placement);
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

  useLayoutEffect(() => {
    pinnedRef.current = pinned;
  });

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
    setPinned(false);
    setUncontrolledOpen(false);
  }

  function pin() {
    if (disabled || isControlled) return;
    clearTimers();
    setPinned(true);
    setUncontrolledOpen(true);
  }

  function scheduleHide() {
    if (disabled || isControlled || pinnedRef.current) return;
    clearTimers();
    hideTimerRef.current = window.setTimeout(() => {
      if (pinnedRef.current) return;
      setUncontrolledOpen(false);
    }, HIDE_GRACE_MS);
  }

  function updatePosition() {
    const trigger = wrapperRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const next = measureFloating(placement, trigger, panel);
    setResolvedPlacement(next.placement);
    setCoords(next.style);
  }

  useEffect(() => () => clearTimers(), []);

  useLayoutEffect(() => {
    if (disabled) return undefined;
    const trigger = wrapperRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    const target = trigger ?? (wrapperRef.current?.firstElementChild as HTMLElement | null);
    if (!target) return undefined;
    target.setAttribute("aria-describedby", descriptionId);
    return () => {
      if (target.getAttribute("aria-describedby") === descriptionId) {
        target.removeAttribute("aria-describedby");
      }
    };
  }, [disabled, descriptionId, children]);

  // Same as updatePosition, but reads the refs inline so the hooks linter sees a layout measurement.
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = wrapperRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const next = measureFloating(placement, trigger, panel);
    setResolvedPlacement(next.placement);
    setCoords(next.style);
  }, [open, placement, title, content]);

  // Escape and a click outside close it. On the shared overlay stack, so Escape closes only the
  // newest overlay and never a parent Modal or Drawer. A controlled panel is left to its owner.
  useOverlayDismiss(open && !isControlled, wrapperRef, () => hide(), panelRef);

  useEffect(() => {
    if (!open || disabled) return undefined;
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updatePosition is a render-scope helper; its inputs are listed.
  }, [open, disabled, placement, title, content]);

  function onBlur(event: ReactFocusEvent<HTMLSpanElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && wrapperRef.current?.contains(next)) return;
    if (next instanceof Node && panelRef.current?.contains(next)) return;
    window.setTimeout(() => {
      if (panelRef.current?.matches(":hover")) return;
      const active = document.activeElement;
      if (active instanceof Node && wrapperRef.current?.contains(active)) return;
      if (active instanceof Node && panelRef.current?.contains(active)) return;
      hide();
    }, 0);
  }

  const description = title ? `${title}. ${content}` : content;
  const panel = open && mounted
    ? createPortal(
        <div
          {...rest}
          ref={setPanelRef}
          data-theme-scope={scope.id}
          data-theme={scope.mode === "dark" ? "dark" : undefined}
          className={cx(styles.panel, styles[resolvedPlacement], coords && styles.open, className, scope.fontClassName)}
          style={coords ?? undefined}
          aria-hidden="true"
          onPointerEnter={() => {
            clearTimers();
          }}
          onPointerLeave={scheduleHide}
        >
          <span className={styles.arrow} aria-hidden="true" />
          {title ? <p className={styles.title}>{title}</p> : null}
          <p className={styles.body}>{content}</p>
        </div>,
        document.body,
      )
    : null;

  return (
    <span {...nisthaAttr("helppopover")}
      ref={wrapperRef}
      className={styles.wrapper}
      onPointerEnter={() => show()}
      onPointerLeave={scheduleHide}
      onFocus={() => show(true)}
      onBlur={onBlur}
      onClick={pin}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") pin();
      }}
    >
      {children}
      {disabled ? null : (
        <span id={descriptionId} className={styles.srOnly}>
          {description}
        </span>
      )}
      {disabled ? null : panel}
    </span>
  );
}
