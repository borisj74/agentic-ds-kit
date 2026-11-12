import type { BadgeTone } from "../Badge/Badge.types";
import type { AppDirectoryApp } from "./AppDirectory.types";

/** Pure helpers behind AppDirectory. No React here. */

/** Apps the catalogue shows: all, or only connected ones under the Connected chip. */
export function visibleApps(apps: AppDirectoryApp[], connectedOnly: boolean): AppDirectoryApp[] {
  return connectedOnly ? apps.filter((app) => app.status === "connected") : apps;
}

export function connectedCount(apps: AppDirectoryApp[]): number {
  return apps.filter((app) => app.status === "connected").length;
}

/** "3 of 12 connected", "None connected yet". */
export function connectedSummary(apps: AppDirectoryApp[]): string {
  const connected = connectedCount(apps);
  if (!apps.length) return "No apps in the directory";
  if (!connected) return `None of ${apps.length} connected yet`;
  return `${connected} of ${apps.length} connected`;
}

export type AppDirectoryAction = "connect" | "connecting" | "disconnect" | "none";

/** The drawer's status Badge and its one action, from the app's status. */
export function drawerState(
  app: AppDirectoryApp,
  connectingId?: string,
): { label: string; tone: BadgeTone; action: AppDirectoryAction } {
  if (app.status === "connected") return { label: "Connected", tone: "success", action: "disconnect" };
  if (app.status === "comingSoon") return { label: "Coming soon", tone: "neutral", action: "none" };
  if (connectingId === app.id) return { label: "Connecting", tone: "info", action: "connecting" };
  return { label: "Not connected", tone: "neutral", action: "connect" };
}

/**
 * The catalogue's tile actions both open the drawer (Connect on an available tile, Manage on a
 * connected one); the drawer's own buttons call onConnect / onDisconnect.
 */
export function directoryHandlers(handlers: {
  select: (id: string | null) => void;
  onConnect?: (id: string) => void;
  onDisconnect?: (id: string) => void;
}) {
  return {
    onTileConnect: (id: string) => handlers.select(id),
    onTileManage: (id: string) => handlers.select(id),
    onDrawerConnect: (id: string) => handlers.onConnect?.(id),
    onDrawerDisconnect: (id: string) => handlers.onDisconnect?.(id),
    onDrawerClose: () => handlers.select(null),
  };
}
