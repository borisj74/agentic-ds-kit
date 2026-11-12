import type { BadgeTone } from "../Badge/Badge.types";
import type { ListViewItem } from "../ListView/ListView.types";
import type { UsageListItem } from "../UsageList/UsageList.types";
import type { UsageBillingInvoice, UsageBillingInvoiceStatus } from "./UsageBilling.types";

/** Same share UsageList warns at. */
export const NEAR_LIMIT = 0.8;

export const INVOICE_STATUS: Record<UsageBillingInvoiceStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "Paid", tone: "success" },
  open: { label: "Open", tone: "info" },
  overdue: { label: "Overdue", tone: "danger" },
  void: { label: "Void", tone: "neutral" },
};

/** Limits at or past `NEAR_LIMIT` of their allowance. */
export function nearLimitCount(limits: UsageListItem[]): number {
  return limits.filter((item) => item.limit > 0 ? item.used / item.limit >= NEAR_LIMIT : item.used > 0).length;
}

/** The limits card's line: how many limits, and how many are close. */
export function limitsSummary(limits: UsageListItem[]): string {
  const near = nearLimitCount(limits);
  const total = `${limits.length} ${limits.length === 1 ? "limit" : "limits"}`;
  return near ? `${total} · ${near} near ${near === 1 ? "its" : "their"} limit` : `${total} · all within plan`;
}

/** Recent invoices as ListView rows: number, date and amount, status Badge, Download action. */
export function invoiceItems(invoices: UsageBillingInvoice[], limit: number): ListViewItem[] {
  return invoices.slice(0, Math.max(0, limit)).map((invoice) => ({
    id: invoice.id,
    primary: invoice.number,
    secondary: `${invoice.date} · ${invoice.amount}`,
    icon: "FileText",
    badge: INVOICE_STATUS[invoice.status].label,
    badgeTone: INVOICE_STATUS[invoice.status].tone,
    actions: [{ id: "download", label: `Download ${invoice.number}`, icon: "Download" }],
  }));
}

/** The plan card's Upgrade label. */
export function upgradeLabel(upgradeTo: string | undefined): string {
  return upgradeTo ? `Upgrade to ${upgradeTo}` : "Upgrade plan";
}
