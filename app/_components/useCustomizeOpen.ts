"use client";

import { useSyncExternalStore } from "react";
import { PLAYGROUND_CUSTOMIZE_STORAGE_KEY } from "@/lib/playground-theme";

const NARROW_QUERY = "(max-width: 1023px)";
const CHANGE_EVENT = "playground-customize-change";

export type CustomizePref = "open" | "closed" | null;

function subscribeNarrow(onChange: () => void) {
  const media = window.matchMedia(NARROW_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function readNarrow() {
  return window.matchMedia(NARROW_QUERY).matches;
}

function subscribePref(onChange: () => void) {
  const handler = () => onChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function readPref(): CustomizePref {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(PLAYGROUND_CUSTOMIZE_STORAGE_KEY);
    if (value === "open" || value === "closed") return value;
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
  return null;
}

function writePref(value: "open" | "closed") {
  try {
    localStorage.setItem(PLAYGROUND_CUSTOMIZE_STORAGE_KEY, value);
  } catch {
    // Ignore storage failures.
  }
  document.documentElement.setAttribute("data-customize", value);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function routeDefaultOpen(pathname: string) {
  return pathname === "/studio" || pathname.startsWith("/patterns");
}

function isThemePage(pathname: string) {
  return pathname === "/theme";
}

/**
 * One open/closed preference for the Theme panel.
 * The Theme page keeps that panel docked. With no saved choice, it is also open on Studio and Patterns.
 * Below 1024px the column is an overlay and stays closed until opened, except on the Theme page.
 */
export function useCustomizeOpen(pathname: string) {
  const narrow = useSyncExternalStore(subscribeNarrow, readNarrow, () => false);
  const pref = useSyncExternalStore(subscribePref, readPref, (): CustomizePref => null);
  const pinned = isThemePage(pathname);
  const docked = !narrow && (pinned || pref === "open" || (pref === null && routeDefaultOpen(pathname)));
  const sheet = narrow && (pinned || pref === "open");
  const open = docked || sheet;

  return {
    docked,
    sheet,
    open,
    pinned,
    toggle: () => {
      if (pinned) return;
      writePref(open ? "closed" : "open");
    },
    close: () => {
      if (pinned) return;
      writePref("closed");
    },
  };
}
