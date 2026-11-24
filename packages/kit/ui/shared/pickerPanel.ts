"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { FOCUSABLE, firstBodyFocusable } from "./overlayLock";

/**
 * DatePicker, DateRangePicker and DateTimePicker panels: on open, focus the first control in the
 * body (the chosen day when the panel marks one with data-autofocus, never Close in the header),
 * then keep Tab inside the panel. Internal: not exported from the package.
 */
export function usePickerFocus(open: boolean, panelRef: RefObject<HTMLElement | null>) {
  // The panel grows from the trigger's end toward the start. When that would cross the start edge
  // of the window or of a clipping container, it anchors to the trigger's start instead.
  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    delete panel.dataset.align;
    if (panel.getBoundingClientRect().left < clipStart(panel)) panel.dataset.align = "start";
  }, [open, panelRef]);

  useEffect(() => {
    if (!open) return undefined;
    const root = panelRef.current;
    if (!root) return undefined;

    const getFocusable = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    const preferred = root.querySelector<HTMLElement>("[data-autofocus] [tabindex='0']");
    (preferred ?? firstBodyFocusable(root) ?? getFocusable()[0] ?? root).focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !root) return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && root.contains(active);
      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, panelRef]);
}

/** The left edge the panel must stay right of: the window, or the nearest container that clips. */
function clipStart(panel: HTMLElement): number {
  let edge = 0;
  for (let node = panel.parentElement; node && node !== document.body; node = node.parentElement) {
    if (getComputedStyle(node).overflowX !== "visible") edge = Math.max(edge, node.getBoundingClientRect().left);
  }
  return edge;
}

/** YYYY-MM-DD that is a real calendar day. */
export function isISODate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]);
}
