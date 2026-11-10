"use client";

import { useId } from "react";
import { CalendarDays, TriangleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import type { BadgeTone } from "../Badge/Badge.types";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { Table } from "../Table";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import type { BillingCharge, BillingChargeStatus, BillingScheduleProps } from "./BillingSchedule.types";
import styles from "./BillingSchedule.module.css";

export type { BillingScheduleProps, BillingCharge, BillingChargeStatus } from "./BillingSchedule.types";

const STATUS: Record<BillingChargeStatus, { tone: BadgeTone; label: string }> = {
  upcoming: { tone: "info", label: "Upcoming" },
  invoiced: { tone: "neutral", label: "Invoiced" },
  paid: { tone: "success", label: "Paid" },
  failed: { tone: "danger", label: "Failed" },
  waived: { tone: "neutral", label: "Waived" },
};

const COLUMNS = [
  { key: "date", header: "Date" },
  { key: "description", header: "Description" },
  { key: "status", header: "Status" },
  { key: "amount", header: "Amount", align: "end" as const, numeric: true },
];

/**
 * Upcoming and past charges on a subscription, in order, with the status as a word. A next-charge summary,
 * and a banner when a payment failed. Built on kit Table, Badge, Button and Empty.
 */
export function BillingSchedule({
  items,
  title = "Billing schedule",
  label,
  nextId,
  nextOnly = false,
  paymentMethod,
  onChangeCard,
  onUpdateCard,
  retryOn,
  onDownloadAll,
  onItemClick,
  emptyTitle = "No charges yet",
  emptyDescription,
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: BillingScheduleProps) {
  const titleId = useId();
  const next = nextId ? items.find((item) => item.id === nextId) : undefined;
  const failed = items.find((item) => item.status === "failed");

  const describe = (item: BillingCharge) => (
    <span className={styles.description}>
      <span className={styles.descLine}>
        {onItemClick ? (
          <button type="button" className={styles.itemButton} onClick={() => onItemClick(item.id)}>
            {item.label}
          </button>
        ) : (
          item.label
        )}
        {item.id === nextId ? (
          <Badge tone="info" size="sm">
            Next charge
          </Badge>
        ) : null}
      </span>
      {item.note ? <span className={cx(styles.note, item.status === "failed" && styles.noteDanger)}>{item.note}</span> : null}
    </span>
  );

  return (
    <section {...rest} ref={ref} className={cx(styles.card, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <CalendarDays size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.headerIcon} />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {label ? <span className={styles.label}>· {label}</span> : null}
        <span className={styles.spacer} />
        {onDownloadAll && !nextOnly && !loading && !error && items.length ? (
          <Button size="sm" appearance="ghost" mode="neutral" iconStart="Download" onClick={onDownloadAll}>
            Download all
          </Button>
        ) : null}
      </header>

      {loading ? (
        <div className={styles.loading}>
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className={styles.loadingRow}>
              <Skeleton width="15%" size="sm" />
              <Skeleton width="45%" size="sm" />
              <span className={styles.spacer} />
              <Skeleton width="12%" size="sm" />
            </div>
          ))}
        </div>
      ) : error ? (
        <LoadError message={error} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <Empty title={emptyTitle} description={emptyDescription} icon="CalendarDays" />
      ) : (
        <>
          {nextOnly && next ? (
            <div className={styles.next}>
              <div className={styles.nextAmount}>
                <span className={styles.nextLabel}>Next charge</span>
                <span className={styles.nextValue}>{next.amount}</span>
              </div>
              <div className={styles.nextMeta}>
                <span className={styles.nextDate}>on {next.date}</span>
                {paymentMethod ? <span className={styles.note}>{paymentMethod}</span> : null}
              </div>
              {onChangeCard ? (
                <Button size="sm" appearance="outline" mode="neutral" onClick={onChangeCard}>
                  Change card
                </Button>
              ) : null}
            </div>
          ) : null}

          {failed && !nextOnly ? (
            <div className={styles.failed} role="alert">
              <TriangleAlert size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.failedIcon} />
              <div className={styles.failedText}>
                <p className={styles.failedTitle}>
                  Payment failed on {failed.date} · {failed.amount}
                </p>
                <p className={styles.failedBody}>
                  {failed.note ? `${failed.note[0].toUpperCase()}${failed.note.slice(1)}.` : "The charge didn't go through."}
                  {retryOn ? ` We'll retry on ${retryOn}; update the card to avoid a pause.` : " Update the card to avoid a pause."}
                </p>
              </div>
              {onUpdateCard ? (
                <Button size="sm" onClick={onUpdateCard}>
                  Update card
                </Button>
              ) : null}
            </div>
          ) : null}

          {!nextOnly ? (
            <Table
              className={styles.table}
              aria-label={title}
              size="sm"
              columns={COLUMNS}
              rows={items.map((item) => ({
                date: <span className={styles.date}>{item.date}</span>,
                description: describe(item),
                status: (
                  <Badge tone={STATUS[item.status].tone} size="sm">
                    {STATUS[item.status].label}
                  </Badge>
                ),
                amount: <span className={styles.amount}>{item.amount}</span>,
              }))}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
