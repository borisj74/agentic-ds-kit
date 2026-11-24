"use client";

import { useEffect, useState, type RefObject } from "react";

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

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef?.current?.contains(target)) return;
      onClose("outside");
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // A nested overlay opened after this one owns this Escape.
      if (!isTopOverlay(token)) return;
      event.preventDefault();
      onClose("escape");
    }

    document.addEventListener("pointerdown", onPointerDown);
    // Capture phase: runs before a parent Modal/Drawer listener, which then skips the prevented Escape.
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onClose, rootRef, panelRef, token]);
}
