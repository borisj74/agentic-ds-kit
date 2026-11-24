import type { BadgeTone } from "../Badge/Badge.types";
import type { IntegrationItem } from "./IntegrationPicker.types";

/** Pure helpers behind IntegrationPicker and its tile. No React here. */

/** The reserved category value of the Connected segment. */
export const CONNECTED_CATEGORY = "connected";

export type IntegrationTileState = "available" | "connecting" | "connected" | "comingSoon";

export function tileState(item: IntegrationItem, connectingId?: string): IntegrationTileState {
  if (item.status === "connected") return "connected";
  if (item.status === "comingSoon") return "comingSoon";
  return connectingId === item.id ? "connecting" : "available";
}

/** The status word every tile ends in. */
export function statusWord(state: IntegrationTileState): string {
  return state === "connected" ? "Connected" : state === "connecting" ? "Connecting…" : state === "comingSoon" ? "Coming soon" : "Not connected";
}

export function connectedCount(items: IntegrationItem[]): number {
  return items.filter((item) => item.status === "connected").length;
}

/** Items shown for a category ("all", "connected" or a name) and a search needle. */
export function filterItems(items: IntegrationItem[], category: string, query: string): IntegrationItem[] {
  const needle = query.trim().toLowerCase();
  return items.filter(
    (item) =>
      (category === "all" ||
        (category === CONNECTED_CATEGORY ? item.status === "connected" : item.category === category)) &&
      (!needle || `${item.name} ${item.description} ${item.category ?? ""}`.toLowerCase().includes(needle)),
  );
}

export type IntegrationDrawerAction = "connect" | "connecting" | "disconnect" | "none";

/** The detail drawer's status Badge and its one action, from the item's status. */
export function drawerState(
  item: IntegrationItem,
  connectingId?: string,
): { label: string; tone: BadgeTone; action: IntegrationDrawerAction } {
  if (item.status === "connected") return { label: "Connected", tone: "success", action: "disconnect" };
  if (item.status === "comingSoon") return { label: "Coming soon", tone: "neutral", action: "none" };
  if (connectingId === item.id) return { label: "Connecting", tone: "info", action: "connecting" };
  return { label: "Not connected", tone: "neutral", action: "connect" };
}
