import type { CSSProperties } from "react";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

export function placePopover(
  placement: PopoverPlacement,
  trigger: DOMRect,
  panel: { width: number; height: number },
): { top: number; left: number } {
  const gap = 8;
  const margin = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top = trigger.bottom + gap;
  let left = trigger.left;
  if (placement === "top") top = trigger.top - gap - panel.height;
  if (placement === "left") {
    left = trigger.left - gap - panel.width;
    top = trigger.top;
  }
  if (placement === "right") {
    left = trigger.right + gap;
    top = trigger.top;
  }
  const maxLeft = Math.max(margin, vw - panel.width - margin);
  const maxTop = Math.max(margin, vh - panel.height - margin);
  return {
    top: Math.min(Math.max(top, margin), maxTop),
    left: Math.min(Math.max(left, margin), maxLeft),
  };
}

export function popoverStyle(top: number, left: number): CSSProperties {
  return { position: "fixed", top, left };
}
