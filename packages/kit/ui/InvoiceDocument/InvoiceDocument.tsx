"use client";

import { useId } from "react";
import { CircleCheck, CircleX, Clock, FileText, ReceiptText, TriangleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import type { BadgeTone } from "../Badge/Badge.types";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { Table } from "../Table";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import type { InvoiceDocumentProps, InvoiceStatus } from "./InvoiceDocument.types";
import styles from "./InvoiceDocument.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { InvoiceDocumentProps, InvoiceLine, InvoiceKind, InvoiceStatus } from "./InvoiceDocument.types";

const STATUS: Record<InvoiceStatus, { tone: BadgeTone; label: string }> = {
  estimate: { tone: "neutral", label: "Estimate" },
  draft: { tone: "neutral", label: "Draft" },
  issued: { tone: "info", label: "Issued" },
  paid: { tone: "success", label: "Paid" },
  overdue: { tone: "danger", label: "Overdue" },
  void: { tone: "neutral", label: "Void" },
};

const COLUMNS = [
  { key: "description", header: "Description" },
  { key: "quantity", header: "Qty", align: "end" as const, numeric: true },
  { key: "unit", header: "Unit", align: "end" as const, numeric: true },
  { key: "amount", header: "Amount", align: "end" as const, numeric: true },
];

/**
 * A document view for an invoice or a credit note, not a PDF engine: header with status, bill-to and dates,
 * line items, totals and one line about payment. A credit note always names the invoice it reduces.
 * Built on kit Table, Badge, Button and Empty.
 */
export function InvoiceDocument({
  kind = "invoice",
  number,
  status = "draft",
  from,
  to,
  issuedOn,
  dueOn,
  period,
  relatedInvoiceId,
  lines,
  subtotal,
  taxLabel = "Tax",
  tax,
  total,
  footnote,
  onDownload,
  onSend,
  onIssue,
  onRecordPayment,
  onPay,
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: InvoiceDocumentProps) {
  const titleId = useId();
  const credit = kind === "creditNote";
  const name = credit ? "Credit note" : "Invoice";
  const voided = !credit && status === "void";
  const empty = lines.length === 0;
  const badge = credit ? { tone: "info" as BadgeTone, label: "Credit note" } : STATUS[status];

  if (loading) {
    return (
      <article {...rest} {...nisthaAttr("invoicedocument", rest)} ref={ref} className={cx(styles.card, className)} aria-busy="true" aria-label={`${name} ${number}`}>
        <div className={styles.loadingHead}>
          <Skeleton width="30%" />
          <Skeleton width="25%" height="var(--space-8)" />
        </div>
        <Skeleton shape="rect" width="100%" height="var(--space-16)" />
        <Skeleton lines={3} size="sm" />
      </article>
    );
  }

  if (error) {
    return (
      <article {...rest} {...nisthaAttr("invoicedocument", rest)} ref={ref} className={cx(styles.card, className)} aria-labelledby={titleId}>
        <header className={styles.errorHead}>
          <FileText size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <h3 id={titleId} className={styles.errorTitle}>
            {name} {number}
          </h3>
        </header>
        <LoadError message={error} onRetry={onRetry} />
      </article>
    );
  }

  const payable = !credit && (status === "issued" || status === "overdue");
  const estimate = !credit && status === "estimate";
  const primary =
    !credit && status === "draft" && onIssue
      ? { label: "Issue invoice", onClick: onIssue }
      : payable && onPay
        ? { label: `Pay ${total}`, onClick: onPay }
        : payable && onRecordPayment
          ? { label: "Record payment", onClick: onRecordPayment }
          : null;

  // The footnote icon follows the status: paid done, issued waiting, overdue late, void cancelled, draft not sent.
  const FootIcon = credit
    ? ReceiptText
    : status === "paid"
      ? CircleCheck
      : status === "overdue"
        ? TriangleAlert
        : status === "issued" || status === "estimate"
          ? Clock
          : status === "void"
            ? CircleX
            : FileText;

  return (
    <article {...rest} {...nisthaAttr("invoicedocument", rest)} ref={ref} className={cx(styles.card, voided && styles.voided, className)} aria-labelledby={titleId}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h3 id={titleId} className={styles.title}>
            {name} <span className={styles.number}>{number}</span>
          </h3>
          <Badge tone={badge.tone} size="sm">
            {badge.label}
          </Badge>
        </div>
        <div className={styles.actions}>
          {onDownload ? (
            <Button size="sm" appearance="ghost" mode="neutral" iconStart="Download" disabled={voided} onClick={onDownload}>
              Download
            </Button>
          ) : null}
          {onSend ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="Send" disabled={voided} onClick={onSend}>
              Send
            </Button>
          ) : null}
          {primary ? (
            <Button size="sm" disabled={empty} onClick={primary.onClick}>
              {primary.label}
            </Button>
          ) : null}
        </div>
        {from ? <p className={styles.from}>{from}</p> : null}
      </header>

      <dl className={styles.meta}>
        <div className={styles.metaItem}>
          <dt>Bill to</dt>
          <dd>{to}</dd>
        </div>
        <div className={styles.metaItem}>
          <dt>{estimate ? "Issues on" : "Issued"}</dt>
          <dd>{issuedOn}</dd>
        </div>
        {credit && relatedInvoiceId ? (
          <div className={styles.metaItem}>
            <dt>Reduces</dt>
            <dd className={styles.mono}>{relatedInvoiceId}</dd>
          </div>
        ) : dueOn ? (
          <div className={styles.metaItem}>
            <dt>Due</dt>
            <dd>{dueOn}</dd>
          </div>
        ) : null}
        {period ? (
          <div className={styles.metaItem}>
            <dt>Period</dt>
            <dd>{period}</dd>
          </div>
        ) : null}
      </dl>

      {empty ? (
        <Empty title="No line items" description="Add a line to calculate the total." icon="FileText" />
      ) : (
        <>
          <Table
            className={styles.table}
            aria-label={`${name} lines`}
            size="sm"
            columns={COLUMNS}
            rows={lines.map((line) => ({
              // Below 30rem the Qty and Unit cells leave the visual grid (they stay in the table for screen
              // readers) and this second line shows them under the description instead.
              description: (
                <span className={styles.lineText}>
                  {line.description}
                  <span className={cx(styles.mono, styles.muted, styles.lineQty)} aria-hidden="true">
                    {line.quantity} × {line.unitPrice}
                  </span>
                </span>
              ),
              quantity: <span className={styles.mono}>{line.quantity}</span>,
              unit: <span className={cx(styles.mono, styles.muted)}>{line.unitPrice}</span>,
              amount: <span className={cx(styles.mono, styles.strong)}>{line.amount}</span>,
            }))}
          />
          <dl className={styles.totals}>
            <div className={styles.totalRow}>
              <dt>Subtotal</dt>
              <dd>{subtotal}</dd>
            </div>
            {tax ? (
              <div className={styles.totalRow}>
                <dt>{taxLabel}</dt>
                <dd>{tax}</dd>
              </div>
            ) : null}
            <div className={cx(styles.totalRow, styles.grand)}>
              <dt>{estimate ? "Estimated total" : "Total"}</dt>
              <dd>{total}</dd>
            </div>
          </dl>
        </>
      )}

      {footnote ? (
        <p
          className={cx(
            styles.footnote,
            credit ? styles.footInfo : status === "paid" ? styles.footSuccess : status === "overdue" ? styles.footDanger : styles.footMuted,
          )}
        >
          <FootIcon size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          {footnote}
        </p>
      ) : null}
    </article>
  );
}
