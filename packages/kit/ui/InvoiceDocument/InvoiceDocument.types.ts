import type { ComponentPropsWithoutRef, Ref } from "react";

export type InvoiceKind = "invoice" | "creditNote";
export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue" | "void";

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
  /** Issued or overdue: Record payment, the solid primary. */
  onRecordPayment?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
