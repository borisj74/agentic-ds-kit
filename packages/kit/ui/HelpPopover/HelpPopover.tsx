"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
} from "react";
import { createPortal } from "react-dom";
import type { HelpPopoverPlacement, HelpPopoverProps } from "./HelpPopover.types";
import styles from "./HelpPopover.module.css";

export type { HelpPopoverProps, HelpPopoverPlacement } from "./HelpPopover.types";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const HIDE_GRACE_MS = 100;
const ARROW_PX = 8;

function opposite(placement: HelpPopoverPlacement): HelpPopoverPlacement {
  if (placement === "top") return "bottom";
  if (placement === "bottom") return "top";
  if (placement === "left") return "right";
  return "left";
}

function tokenPx(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

function fits(
  placement: HelpPopoverPlacement,
  trigger: DOMRect,
  panel: { width: number; height: number },
  gap: number,
  vw: number,
  vh: number,
): boolean {
  if (placement === "bottom") return trigger.bottom + gap + panel.height <= vh;
  if (placement === "top") return trigger.top - gap - panel.height >= 0;
  if (placement === "right") return trigger.right + gap + panel.width <= vw;
  return trigger.left - gap - panel.width >= 0;
}

function choosePlacement(
  preferred: HelpPopoverPlacement,
  trigger: DOMRect,
  panel: { width: number; height: number },
  gap: number,
  vw: number,
  vh: number,
): HelpPopoverPlacement {
  if (fits(preferred, trigger, panel, gap, vw, vh)) return preferred;
  const alt = opposite(preferred);
  if (fits(alt, trigger, panel, gap, vw, vh)) return alt;
  const verticalRoom = { top: trigger.top, bottom: vh - trigger.bottom };
  const horizontalRoom = { left: trigger.left, right: vw - trigger.right };
  if (preferred === "top" || preferred === "bottom") {
    return verticalRoom.top >= verticalRoom.bottom ? "top" : "bottom";
  }
  return horizontalRoom.left >= horizontalRoom.right ? "left" : "right";
}

function placePanel(
  preferred: HelpPopoverPlacement,
  trigger: DOMRect,
  panel: { width: number; height: number },
  gap: number,
  margin: number,
  vw: number,
  vh: number,
): { top: number; left: number; placement: HelpPopoverPlacement; arrow: number } {
  const placement = choosePlacement(preferred, trigger, panel, gap, vw, vh);
  let top = 0;
  let left = 0;
  if (placement === "bottom") {
    top = trigger.bottom + gap;
    left = trigger.left + trigger.width / 2 - panel.width / 2;
  } else if (placement === "top") {
    top = trigger.top - gap - panel.height;
    left = trigger.left + trigger.width / 2 - panel.width / 2;
  } else if (placement === "right") {
    left = trigger.right + gap;
    top = trigger.top + trigger.height / 2 - panel.height / 2;
  } else {
    left = trigger.left - gap - panel.width;
    top = trigger.top + trigger.height / 2 - panel.height / 2;
  }

  const maxLeft = Math.max(margin, vw - panel.width - margin);
  const maxTop = Math.max(margin, vh - panel.height - margin);
  left = Math.min(Math.max(left, margin), maxLeft);
  top = Math.min(Math.max(top, margin), maxTop);

  let arrow =
    placement === "top" || placement === "bottom"
      ? trigger.left + trigger.width / 2 - left
      : trigger.top + trigger.height / 2 - top;
  const edge =
    placement === "top" || placement === "bottom" ? panel.width : panel.height;
  arrow = Math.min(Math.max(arrow, ARROW_PX), Math.max(ARROW_PX, edge - ARROW_PX));

  return { top, left, placement, arrow };
}

export function HelpPopover({
  title,
  content,
  placement = "bottom",
  delay = 150,
  open: controlledOpen,
  disabled = false,
  children,
}: HelpPopoverProps) {
  const descriptionId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const pinnedRef = useRef(false);
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<CSSProperties | null>(null);
  const [resolvedPlacement, setResolvedPlacement] = useState(placement);
  const open = !disabled && (isControlled ? controlledOpen : uncontrolledOpen);
  pinnedRef.current = pinned;

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
    const gap = tokenPx("--space-2", 8);
    const margin = tokenPx("--space-2", 8);
    const next = placePanel(
      placement,
      trigger.getBoundingClientRect(),
      { width: panel.offsetWidth, height: panel.offsetHeight },
      gap,
      margin,
      window.innerWidth,
      window.innerHeight,
    );
    setResolvedPlacement(next.placement);
    setCoords({
      top: next.top,
      left: next.left,
      ["--help-arrow" as string]: `${next.arrow}px`,
    });
  }

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      setResolvedPlacement(placement);
      return;
    }
    updatePosition();
  }, [open, placement, title, content]);

  useEffect(() => {
    if (!open || disabled) return undefined;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      hide();
    }

    function onDocumentKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (isControlled) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      hide();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onDocumentKey, true);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onDocumentKey, true);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, disabled, isControlled, placement, title, content]);

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
          ref={panelRef}
          className={`${styles.panel} ${styles[resolvedPlacement]}${coords ? ` ${styles.open}` : ""}`}
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
    <span
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
