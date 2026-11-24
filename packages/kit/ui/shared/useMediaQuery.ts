import { useCallback, useSyncExternalStore } from "react";

/** True while the media query matches. False during SSR and hydration, so the server markup stays the wide one. */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Media queries cannot read var(): 40rem is --grid-breakpoint-sm. */
export const NARROW_QUERY = "(max-width: 40rem)";

/** 80rem is --grid-breakpoint-lg: wide enough to dock a 24rem side panel beside the page. */
export const WIDE_QUERY = "(min-width: 80rem)";
