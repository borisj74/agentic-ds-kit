"use client";

import { useEffect, type RefObject } from "react";

export type OverlayDismissReason = "escape" | "outside";

/** Closes an overlay on Escape and on pointerdown outside `rootRef`. */
export function useOverlayDismiss(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  onClose: (reason: OverlayDismissReason) => void,
  /** A portaled panel that should not count as outside. */
  panelRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef?.current?.contains(target)) return;
      onClose("outside");
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
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
  }, [open, onClose, rootRef, panelRef]);
}
