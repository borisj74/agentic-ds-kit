import { useLayoutEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const listeners = new Set<() => void>();

function emit() {
  for (const onChange of listeners) onChange();
}

function subscribe(onChange: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("hashchange", emit);
    window.addEventListener("popstate", emit);
  }
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
    if (listeners.size > 0) return;
    window.removeEventListener("hashchange", emit);
    window.removeEventListener("popstate", emit);
  };
}

/**
 * Same-page hash navigation, as AppNav does it. Assigning `location.hash` adds an entry
 * with no router state, which Next ignores on Back; its patched pushState records one.
 */
export function pushHash(fragment: string) {
  if (window.location.hash !== `#${fragment}`) window.history.pushState(null, "", `#${fragment}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(fragment)?.scrollIntoView({ behavior: reduce ? "instant" : "auto" });
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
  const pathname = usePathname();
  const hash = useSyncExternalStore<string | null>(subscribe, readHash, readServerHash);

  // A Next <Link> renders the new route first, then writes the URL with history.pushState
  // in the same commit, which fires neither hashchange nor popstate. Re-read once the
  // commit has written it (layout effect: before paint) so no consumer keeps the old hash.
  useLayoutEffect(() => {
    if (hash === null || readHash() === hash) return;
    emit();
  }, [pathname, hash]);

  return hash;
}
