import { useLayoutEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const listeners = new Set<() => void>();

function emit() {
  for (const onChange of listeners) onChange();
}

function onHashChange() {
  // `location.hash = …` (AppNav same-page links, the demos) adds a history entry with no
  // state, and Next ignores a popstate back to it from another page, leaving that page on
  // screen under this URL. Stamping it through Next's replaceState records the router state.
  if (window.history.state === null) {
    window.history.replaceState(null, "", window.location.href);
  }
  emit();
}

function subscribe(onChange: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", emit);
  }
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
    if (listeners.size > 0) return;
    window.removeEventListener("hashchange", onHashChange);
    window.removeEventListener("popstate", emit);
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
