"use client";

import { useSyncExternalStore } from "react";
import { PLAYGROUND_SIDEBAR_STORAGE_KEY } from "@/lib/playground-theme";

const CHANGE_EVENT = "playground-sidebar-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readOpen(): boolean {
  try {
    return localStorage.getItem(PLAYGROUND_SIDEBAR_STORAGE_KEY) !== "closed";
  } catch {
    return true;
  }
}

/**
 * Whether the docs sidebar shows on wide screens. The choice is saved; the head script sets
 * html[data-sidebar="closed"] before paint, and CSS hides the sidebar from that attribute.
 */
export function useSidebarOpen(): { open: boolean; setOpen: (open: boolean) => void } {
  const open = useSyncExternalStore(subscribe, readOpen, () => true);

  function setOpen(next: boolean) {
    try {
      localStorage.setItem(PLAYGROUND_SIDEBAR_STORAGE_KEY, next ? "open" : "closed");
    } catch {
      // Ignore storage failures (private mode, quota, etc.); the attribute still applies.
    }
    if (next) document.documentElement.removeAttribute("data-sidebar");
    else document.documentElement.setAttribute("data-sidebar", "closed");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return { open, setOpen };
}
