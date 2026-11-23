import type { ComponentPropsWithoutRef, Ref } from "react";
import type { UsageListItem } from "../UsageList/UsageList.types";
import type { UsageMeterProps } from "../UsageMeter/UsageMeter.types";
import type { InvoiceDocumentProps } from "../InvoiceDocument/InvoiceDocument.types";

/** The plan the account is on. Prices are pre-formatted: currency stays with the caller. */
export interface UsageBillingPlan {
  /** e.g. "Pro". */
  name: string;
  /** e.g. "$49". */
  price: string;
  /** e.g. "per month · 5 seats". */
  priceNote?: string;
  /** e.g. "$49.00 on 1 Dec". */
  nextCharge?: string;
  /** e.g. "Visa ending 4242". */
  paymentMethod?: string;
  /** The plan Upgrade moves to, e.g. "Team": the button reads "Upgrade to Team". */
  upgradeTo?: string;
  /** Whether the upgrade plan covers this period, e.g. "Scale covers this month with 13,760 credits spare, for $360.00 more a month". */
  fit?: string;
}

/** The main allowance, drawn by a kit UsageMeter (its own Upgrade stays off: the plan card has it). */
export type UsageBillingAllowance = Pick<
  UsageMeterProps,
  "title" | "used" | "limit" | "unit" | "categories" | "periodStart" | "resetLabel" | "daily" | "dailyLabels" | "dailyCap" | "warnAt" | "paceNote" | "overage"
>;

/** The next invoice, drawn by a kit InvoiceDocument with status "estimate" (no actions: it cannot be paid yet). */
export type UsageBillingUpcoming = Pick<
  InvoiceDocumentProps,
  "number" | "to" | "from" | "issuedOn" | "period" | "lines" | "subtotal" | "taxLabel" | "tax" | "total" | "footnote"
>;

/** The same words as InvoiceDocument. `open` is kept as an alias of `issued` and also reads Issued. */
export type UsageBillingInvoiceStatus = "paid" | "issued" | "open" | "overdue" | "void";

/** A recent invoice: one ListView row with a Download action. */
export interface UsageBillingInvoice {
  id: string;
  /** e.g. "INV-2026-0117". */
  number: string;
  /** e.g. "1 Nov 2026". */
  date: string;
  /** Pre-formatted, e.g. "$49.00". */
  amount: string;
  status: UsageBillingInvoiceStatus;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type UsageBillingOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface UsageBillingProps extends Omit<ComponentPropsWithoutRef<"section">, UsageBillingOwnedKeys> {
  plan: UsageBillingPlan;
  allowance: UsageBillingAllowance;
  /** The next invoice as an estimate, beside the other limits. */
  upcoming?: UsageBillingUpcoming;
  /** The plan's other limits (seats, projects, storage …), as kit UsageList rows. */
  limits?: UsageListItem[];
  /** Newest first. The block shows up to `invoiceLimit`. */
  invoices?: UsageBillingInvoice[];
  /** How many invoices to list. Default 4. */
  invoiceLimit?: number;
  /** The one solid primary: Upgrade on the plan card. Without it the button is not shown. */
  onUpgrade?: () => void;
  onManagePayment?: () => void;
  onDownloadInvoice?: (invoiceId: string) => void;
  /** All invoices (a header link on the invoices card). */
  onViewInvoices?: () => void;
  /** The UsageMeter's View usage. */
  onViewUsage?: () => void;
  /** Block heading. Default "Usage & billing". */
  title?: string;
  /** Line under the heading. Default "Your plan, what you have used this period and what it costs." */
  description?: string;
  ref?: Ref<HTMLElement>;
}
