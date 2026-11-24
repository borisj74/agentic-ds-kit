import type { CSSProperties } from "react";

/*
 * The one placement helper for floating panels anchored to a trigger: Tooltip, HelpPopover and
 * Popover. It keeps the preferred side when the panel fits, flips to the opposite side when it
 * does not, and clamps the panel inside the viewport. Internal: not exported from the package.
 */

export type FloatingPlacement = "top" | "bottom" | "left" | "right";

/** center: the panel centres on the trigger. start: it lines up with the trigger's left or top edge. */
export type FloatingAlign = "center" | "start";

export interface FloatingBox {
  top: number;
  left: number;
  /** The side actually used after flipping. */
  placement: FloatingPlacement;
  /** Arrow offset from the panel's left (top/bottom) or top (left/right) edge, in px. */
  arrow: number;
}

interface Size {
  width: number;
  height: number;
}

interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface FloatingOptions {
  align?: FloatingAlign;
  gap?: number;
  margin?: number;
  /** Smallest arrow offset from a panel edge, so the arrow never sits on a corner. */
  arrowInset?: number;
  viewport?: Size;
}

function opposite(placement: FloatingPlacement): FloatingPlacement {
  if (placement === "top") return "bottom";
  if (placement === "bottom") return "top";
  if (placement === "left") return "right";
  return "left";
}

function fits(placement: FloatingPlacement, trigger: Rect, panel: Size, gap: number, vw: number, vh: number): boolean {
  if (placement === "bottom") return trigger.bottom + gap + panel.height <= vh;
  if (placement === "top") return trigger.top - gap - panel.height >= 0;
  if (placement === "right") return trigger.right + gap + panel.width <= vw;
  return trigger.left - gap - panel.width >= 0;
}

function choosePlacement(
  preferred: FloatingPlacement,
  trigger: Rect,
  panel: Size,
  gap: number,
  vw: number,
  vh: number,
): FloatingPlacement {
  if (fits(preferred, trigger, panel, gap, vw, vh)) return preferred;
  const alt = opposite(preferred);
  if (fits(alt, trigger, panel, gap, vw, vh)) return alt;
  // Neither side fits: take the side with more room.
  if (preferred === "top" || preferred === "bottom") {
    return trigger.top >= vh - trigger.bottom ? "top" : "bottom";
  }
  return trigger.left >= vw - trigger.right ? "left" : "right";
}

/** Where a panel of `panel` size goes next to `trigger`. Pure: pass the viewport in tests. */
export function placeFloating(
  preferred: FloatingPlacement,
  trigger: Rect,
  panel: Size,
  options: FloatingOptions = {},
): FloatingBox {
  const align = options.align ?? "center";
  const gap = options.gap ?? 8;
  const margin = options.margin ?? 8;
  const arrowInset = options.arrowInset ?? 8;
  const vw = options.viewport?.width ?? window.innerWidth;
  const vh = options.viewport?.height ?? window.innerHeight;

  const placement = choosePlacement(preferred, trigger, panel, gap, vw, vh);
  const vertical = placement === "top" || placement === "bottom";
  let top: number;
  let left: number;
  if (vertical) {
    top = placement === "bottom" ? trigger.bottom + gap : trigger.top - gap - panel.height;
    left = align === "start" ? trigger.left : trigger.left + trigger.width / 2 - panel.width / 2;
  } else {
    left = placement === "right" ? trigger.right + gap : trigger.left - gap - panel.width;
    top = align === "start" ? trigger.top : trigger.top + trigger.height / 2 - panel.height / 2;
  }

  const maxLeft = Math.max(margin, vw - panel.width - margin);
  const maxTop = Math.max(margin, vh - panel.height - margin);
  left = Math.min(Math.max(left, margin), maxLeft);
  top = Math.min(Math.max(top, margin), maxTop);

  const edge = vertical ? panel.width : panel.height;
  const centre = vertical ? trigger.left + trigger.width / 2 - left : trigger.top + trigger.height / 2 - top;
  const arrow = Math.min(Math.max(centre, arrowInset), Math.max(arrowInset, edge - arrowInset));

  return { top, left, placement, arrow };
}

/** A token's px value from :root, or the fallback during SSR or when it is unset. */
export function tokenPx(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Measures `trigger` and `panel` and places the panel. Gap and margin come from --space-2. */
export function measureFloating(
  preferred: FloatingPlacement,
  trigger: HTMLElement,
  panel: HTMLElement,
  align: FloatingAlign = "center",
): { placement: FloatingPlacement; style: CSSProperties } {
  const space = tokenPx("--space-2", 8);
  const box = placeFloating(
    preferred,
    trigger.getBoundingClientRect(),
    { width: panel.offsetWidth, height: panel.offsetHeight },
    { align, gap: space, margin: space },
  );
  return {
    placement: box.placement,
    style: { top: box.top, left: box.left, ["--floating-arrow" as string]: `${box.arrow}px` },
  };
}
