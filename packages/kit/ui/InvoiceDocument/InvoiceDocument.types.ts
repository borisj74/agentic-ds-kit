import type { ComponentPropsWithoutRef, Ref } from "react";

export type InvoiceKind = "invoice" | "creditNote";
/** `estimate`: the next invoice before the period closes; it can still change and cannot be paid. */
export type InvoiceStatus = "estimate" | "draft" | "issued" | "paid" | "overdue" | "void";

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  /** Pre-formatted, e.g. "$24.00". */
  unitPrice: string;
  /** Pre-formatted line total, e.g. "$72.00". */
  amount: string;
}

/** Native article attributes the kit sets itself (or replaces with its own prop). */
type InvoiceDocumentOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<article>`. */
export interface InvoiceDocumentProps extends Omit<ComponentPropsWithoutRef<"article">, InvoiceDocumentOwnedKeys> {
  kind?: InvoiceKind;
  /** e.g. "INV-2026-0117" or "CN-0042" */
  number: string;
  /** Invoices only; a credit note always reads "Credit note". */
  status?: InvoiceStatus;
  /** Issuer line under the title, e.g. "Northwind Ledger Ltd · example issuer". */
  from?: string;
  /** Bill to, e.g. "Acme Co · 12 Example St". */
  to: string;
  issuedOn: string;
  dueOn?: string;
  /** Billing period, e.g. "1–30 Nov 2026". */
  period?: string;
  /** Credit notes: the invoice this one reduces. */
  relatedInvoiceId?: string;
  lines: InvoiceLine[];
  /** Pre-formatted totals; currency formatting stays with the caller. */
  subtotal: string;
  /** e.g. "Tax 20%". */
  taxLabel?: string;
  tax?: string;
  total: string;
  /** One line under the totals: paid on, overdue reminder, voided, what the credit note reduces. Its icon and colour follow the status. */
  footnote?: string;
  onDownload?: () => void;
  onSend?: () => void;
  /** Draft: Issue invoice, the solid primary. */
  onIssue?: () => void;
  /** Issued or overdue: Record payment, the solid primary (the seller's view). */
  onRecordPayment?: () => void;
  /** Issued or overdue: Pay {total}, the solid primary (the customer's view). Wins over onRecordPayment. */
  onPay?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
