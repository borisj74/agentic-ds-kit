import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function readHash() {
  return window.location.hash.replace(/^#/, "");
}

/** The server has no hash; the first client render must match it. */
function readServerHash() {
  return null;
}

/**
 * The location hash without `#`, or `null` on the server and during hydration.
 * Views keyed by the hash hide their body while it is `null` so a direct link
 * never paints the default view first.
 */
export function useLocationHash(): string | null {
  return useSyncExternalStore<string | null>(subscribe, readHash, readServerHash);
}
