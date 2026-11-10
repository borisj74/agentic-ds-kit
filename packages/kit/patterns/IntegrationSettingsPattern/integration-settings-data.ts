/** Demo data for IntegrationSettingsPattern. The provider is an example; replace it with the integration's real settings. */
export type ConnectionStatus = "connected" | "syncing" | "error" | "needsReauth" | "disconnected";

export const PROVIDER = {
  name: "Northwind Ledger",
  lastSync: "Last sync 4 min ago · example provider",
};

export const SETTINGS = {
  frequency: "15m",
  account: "4000",
  syncPayments: true,
  syncCreditNotes: false,
};

export const FREQUENCY_OPTIONS = [
  { value: "15m", label: "Every 15 minutes" },
  { value: "1h", label: "Every hour" },
  { value: "1d", label: "Daily" },
];

export const ACCOUNT_OPTIONS = [
  { value: "4000", label: "4000 · Sales income" },
  { value: "4100", label: "4100 · Services" },
];

export const SCOPES = ["invoices:read", "invoices:write", "payments:read", "contacts:read"];

export const STATUS_COPY: Record<ConnectionStatus, { badge: string; tone: "success" | "info" | "danger" | "warning" | "neutral"; message?: string }> = {
  connected: { badge: "Connected", tone: "success" },
  syncing: { badge: "Syncing", tone: "info", message: "Syncing now. Settings stay editable." },
  error: { badge: "Error", tone: "danger", message: "Sync failed: the ledger rejected 3 invoices with missing tax codes." },
  needsReauth: { badge: "Needs reauth", tone: "warning", message: "Access expired. Reconnect to resume syncing; your settings are kept." },
  disconnected: { badge: "Not connected", tone: "neutral" },
};
