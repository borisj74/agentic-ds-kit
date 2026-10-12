"use client";

import { createContext, useContext, type RefObject } from "react";
import type { SideNavSide } from "./SideNav.types";

export interface SideNavContextValue {
  /** Rail is open (full width). */
  open: boolean;
  /** Rail is closed: icons only, labels clipped. Same as `!open`. */
  rail: boolean;
  /**
   * `{ focus: true }` (used by `SideNav.Brand` and `SideNav.Toggle`) keeps keyboard focus in
   * the rail. Open: focus moves to the Toggle if present, else the first nav row. Close: if the
   * focused control is hidden on the closed rail, focus moves to the `SideNav.Brand` mark, else
   * the visible Toggle. Pass it from your own open/close control in the same event; leave it
   * off for programmatic changes. A request a controlled parent ignores is dropped.
   */
  setOpen: (next: boolean, options?: { focus?: boolean }) => void;
  toggle: (options?: { focus?: boolean }) => void;
  side: SideNavSide;
  /** Accessible name of the root; `SideNav.Nav` uses it when it has no `aria-label`. */
  label?: string;
  /** The root `<aside>`; closed-rail tooltips sit just outside its edge. */
  rootRef: RefObject<HTMLElement | null>;
}

export const SideNavContext = createContext<SideNavContextValue | null>(null);

/**
 * Open state of the nearest `SideNav.Root` (or preset `SideNav`). Use it to build your own
 * toggle or to react to the rail closing. Throws outside a SideNav.
 */
export function useSideNav(): SideNavContextValue {
  const value = useContext(SideNavContext);
  if (!value) throw new Error("SideNav blocks must be inside <SideNav.Root> (or SideNavRoot).");
  return value;
}
