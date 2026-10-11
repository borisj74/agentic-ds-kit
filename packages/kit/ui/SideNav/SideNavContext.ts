"use client";

import { createContext, useContext, type RefObject } from "react";
import type { SideNavSide } from "./SideNav.types";

export interface SideNavContextValue {
  /** Rail is open (full width). */
  open: boolean;
  /** Rail is closed: icons only, labels clipped. Same as `!open`. */
  rail: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
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
