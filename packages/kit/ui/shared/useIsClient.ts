import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

/** False during SSR and hydration, true once the client has taken over — portals need `document`. */
export function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}
