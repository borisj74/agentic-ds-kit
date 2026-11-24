"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

export type OverlayDismissReason = "escape" | "outside";

// Open overlays, oldest first. Escape closes only the newest one, so a Combobox open inside a
// FilterBar Popover closes its own list and leaves the Popover open.
const openOverlays: object[] = [];

/** Adds an open overlay to the stack; the returned function takes it off again. */
export function pushOverlay(token: object): () => void {
  openOverlays.push(token);
  return () => {
    const index = openOverlays.lastIndexOf(token);
    if (index >= 0) openOverlays.splice(index, 1);
  };
}

/** True when `token` is the most recently opened overlay still open. */
export function isTopOverlay(token: object): boolean {
  return openOverlays[openOverlays.length - 1] === token;
}

/** Closes an overlay on Escape and on pointerdown outside `rootRef`. */
export function useOverlayDismiss(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  onClose: (reason: OverlayDismissReason) => void,
  /** A portaled panel that should not count as outside. */
  panelRef?: RefObject<HTMLElement | null>,
) {
  // Its place in the stack is kept from open to close, so a new onClose on a later render does
  // not move this overlay above one opened after it.
  const [token] = useState<object>(() => ({}));
  useEffect(() => {
    if (!open) return undefined;
    return pushOverlay(token);
  }, [open, token]);

  // The latest onClose, read when an event fires. The listeners below stay bound from open to
  // close, so a new onClose (a parent passing an inline callback) never re-registers them after
  // a nested overlay's listeners.
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef?.current?.contains(target)) return;
      onCloseRef.current("outside");
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // Another overlay already took this Escape (same rule as Modal, Drawer and AlertDialog).
      if (event.defaultPrevented) return;
      // A nested overlay opened after this one owns this Escape.
      if (!isTopOverlay(token)) return;
      event.preventDefault();
      // This overlay closes; no later listener may close the next one in the same keypress.
      event.stopImmediatePropagation();
      onCloseRef.current("escape");
    }

    document.addEventListener("pointerdown", onPointerDown);
    // Capture phase: runs before a parent Modal/Drawer listener, which then skips the prevented Escape.
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, rootRef, panelRef, token]);
}
