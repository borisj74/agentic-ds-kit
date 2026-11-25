/** Demo data for IntegrationSettingsPattern. Stripe in Northwind Billing is an example; replace it with the integration's real settings. */
export type ConnectionStatus = "connected" | "syncing" | "error" | "needsReauth" | "disconnected";

/** A problem to show: a short title and one line on what to do. A plain string is the detail line under a default title. */
export type IntegrationMessage = string | { title: string; detail?: string };

/** What the last sync moved, and when the next one runs. Times are preformatted. */
export interface IntegrationLastSync {
  at: string;
  invoices: number;
  payments: number;
  next: string;
}

export const PROVIDER = {
  name: "Stripe",
  icon: "CreditCard",
  account: "Northwind Inc. · Live mode · account ending 4F2K",
  scopes: "Access granted: read and write invoices, read payments and customers",
};

export const LAST_SYNC: IntegrationLastSync = { at: "Today 09:42", invoices: 128, payments: 41, next: "09:57" };

export const SETTINGS = {
  frequency: "15m",
  account: "1010",
  markPaid: true,
  creditNotes: false,
};

export const FREQUENCY_OPTIONS = [
  { value: "15m", label: "Every 15 minutes" },
  { value: "1h", label: "Every hour" },
  { value: "1d", label: "Daily" },
];

export const ACCOUNT_OPTIONS = [
  { value: "1010", label: "1010 · Stripe clearing" },
  { value: "1000", label: "1000 · Operating account" },
];

/** Invoices the last sync rejected. The error Alert's detail and its "View N invoices" action both come from this list. */
export const FAILED_INVOICES = ["INV-1842", "INV-1847", "INV-1851"];

/** "A, B and C" for a short list of ids. */
export function listIds(ids: string[]): string {
  return ids.length < 2 ? (ids[0] ?? "") : `${ids.slice(0, -1).join(", ")} and ${ids[ids.length - 1]}`;
}

/** Status word and tone for the Connection Badge, plus the Alert copy for states that need one. */
export const STATUS_COPY: Record<
  ConnectionStatus,
  { badge: string; tone: "success" | "info" | "danger" | "warning" | "neutral"; icon: "CircleCheck" | "RefreshCw" | "CircleX" | "TriangleAlert" | "Plug"; message?: { title: string; detail: string } }
> = {
  connected: { badge: "Connected", tone: "success", icon: "CircleCheck" },
  syncing: { badge: "Syncing", tone: "info", icon: "RefreshCw", message: { title: "Syncing now", detail: "Settings stay editable while it runs." } },
  error: {
    badge: "Sync failed",
    tone: "danger",
    icon: "CircleX",
    message: {
      title: `${FAILED_INVOICES.length} invoices didn’t sync`,
      detail: `${listIds(FAILED_INVOICES)} have no tax code. Add one, then retry.`,
    },
  },
  needsReauth: {
    badge: "Access expired",
    tone: "warning",
    icon: "TriangleAlert",
    message: { title: "Stripe access expired", detail: "Syncing paused on 18 Nov. Your settings are kept." },
  },
  disconnected: { badge: "Not connected", tone: "neutral", icon: "Plug" },
};

/** Turns a string or { title, detail } into Alert copy, using fallbackTitle for a plain string. */
export function toMessage(message: IntegrationMessage, fallbackTitle: string): { title: string; detail: string } {
  return typeof message === "string" ? { title: fallbackTitle, detail: message } : { title: message.title, detail: message.detail ?? "" };
}
