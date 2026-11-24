"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "../shared/cx";
import { useIsClient } from "../shared/useIsClient";
import { useThemeScopeMarker } from "../shared/themeScope";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
import { measureFloating } from "../shared/placeFloating";
import { OverlayFooter, OverlayHeader } from "../ModalCard/ModalCardParts";
import type { PopoverProps } from "./Popover.types";
import styles from "./Popover.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { PopoverPlacement, PopoverProps, PopoverTone } from "./Popover.types";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Popover({
  trigger,
  children,
  label,
  title,
  eyebrow,
  tone = "neutral",
  footer,
  footerStart,
  placement = "bottom",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
}: PopoverProps) {
  const panelId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useIsClient();
  const scope = useThemeScopeMarker();
  const isControlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = isControlled ? openProp : uncontrolled;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(
    (reason: "escape" | "outside") => {
      setOpen(false);
      if (reason === "escape") {
        rootRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
      }
    },
    [setOpen],
  );

  useOverlayDismiss(open, rootRef, close, panelRef);

  const didFocus = useRef(false);
  useLayoutEffect(() => {
    if (!open) {
      didFocus.current = false;
      return;
    }
    const triggerNode = rootRef.current;
    const panel = panelRef.current;
    if (!triggerNode || !panel) return;
    // Start-aligned to the trigger; flips to the other side and stays inside the viewport.
    const { style } = measureFloating(placement, triggerNode, panel, "start");
    panel.style.top = `${style.top}px`;
    panel.style.left = `${style.left}px`;
    if (!didFocus.current) {
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
      didFocus.current = true;
    }
  }, [open, placement, children, label, title, eyebrow, tone, footer, footerStart]);

  // Tab and Shift+Tab stay inside the panel while it is open; Escape or a click outside leaves.
  function trapTab(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        "aria-expanded": open,
        "aria-controls": open ? panelId : undefined,
        "aria-haspopup": "dialog",
      })
    : trigger;

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={label}
            tabIndex={-1}
            data-theme-scope={scope.id}
            data-theme={scope.mode === "dark" ? "dark" : undefined}
            className={cx(styles.panel, className, scope.fontClassName)}
            onKeyDown={trapTab}
          >
            {title ? (
              <OverlayHeader
                title={title}
                titleId={titleId}
                descriptionId={descriptionId}
                eyebrow={eyebrow}
                tone={tone}
                className={styles.header}
              />
            ) : null}
            <div className={styles.body}>{children}</div>
            <OverlayFooter footer={footer} footerStart={footerStart} className={styles.footer} />
          </div>,
          document.body,
        )
      : null;

  return (
    <span {...nisthaAttr("popover")} ref={rootRef} className={styles.root}>
      <span
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "Escape") close("escape");
        }}
      >
        {triggerNode}
      </span>
      {panel}
    </span>
  );
}
