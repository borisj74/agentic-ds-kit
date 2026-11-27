import { Alert } from "../Alert";
import { Badge } from "../Badge";
import type { BadgeTone } from "../Badge/Badge.types";
import { Button } from "../Button";
import { Card } from "../Card";
import type { CardAction } from "../Card/Card.types";
import { Divider } from "../Divider";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { Table } from "../Table";
import type { TableColumn, TableRowAction } from "../Table/Table.types";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import type { BillingScheduleProps, BillingScheduleView, Charge, ChargeStatus, NextCharge } from "./BillingSchedule.types";
import styles from "./BillingSchedule.module.css";

export type {
  BillingScheduleProps,
  BillingScheduleView,
  Charge,
  ChargeStatus,
  NextCharge,
} from "./BillingSchedule.types";

/** Status is a word in a small Badge, never colour alone. Upcoming is the only primary one. */
const STATUS: Record<ChargeStatus, { tone: BadgeTone; label: string }> = {
  scheduled: { tone: "primary", label: "Upcoming" },
  retrying: { tone: "warning", label: "Retrying" },
  invoiced: { tone: "neutral", label: "Invoiced" },
  paid: { tone: "success", label: "Paid" },
  failed: { tone: "danger", label: "Failed" },
  waived: { tone: "neutral", label: "Waived" },
};

const UPCOMING: ChargeStatus[] = ["scheduled", "retrying"];
/** Billed but not settled: shown under the failed charge in the failed view. */
const OUTSTANDING: ChargeStatus[] = ["invoiced", "retrying"];

const COLUMNS: TableColumn[] = [
  { key: "date", header: "Date" },
  { key: "charge", header: "Description" },
  { key: "status", header: "Status" },
  { key: "amount", header: "Amount", align: "end", numeric: true },
];

/** Each view's own empty and error copy. */
const COPY: Record<BillingScheduleView, { emptyTitle: string; emptyDescription: string; errorTitle: string }> = {
  full: {
    emptyTitle: "No charges yet",
    emptyDescription: "Charges show here once the first one is scheduled",
    errorTitle: "Couldn’t load the billing schedule",
  },
  nextOnly: {
    emptyTitle: "No upcoming charge",
    emptyDescription: "Nothing is scheduled to be charged",
    errorTitle: "Couldn’t load the next charge",
  },
  failed: {
    emptyTitle: "No failed payments",
    emptyDescription: "Every charge has gone through",
    errorTitle: "Couldn’t load failed payments",
  },
};

/** Three-letter months, so September reads Sep (en-GB Intl writes Sept). */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "01 Dec 2026", the one date format. Falls back to the raw string when it is not YYYY-MM-DD. */
function longDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return `${String(parsed.getUTCDate()).padStart(2, "0")} ${MONTHS[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`;
}

/** The pencil's name: "Edit Pro plan monthly, 01 Dec 2026". */
function billingEditLabel(charge: Charge): string {
  return `Edit ${charge.label.replaceAll(" · ", " ")}, ${longDate(charge.date)}`;
}

/** A later charge with one of these statuses settles an earlier failure. */
const SETTLED: ChargeStatus[] = ["paid", "waived"];

/** The newest failed charge that no paid or waived charge came after: the one the failure Alert is about. */
function openFailure(billed: Charge[]): Charge | undefined {
  const failed = billed.find((charge) => charge.status === "failed");
  if (!failed) return undefined;
  return billed.some((charge) => SETTLED.includes(charge.status) && charge.date > failed.date) ? undefined : failed;
}

/**
 * Billing schedule for one customer in a kit Card with its own header. `view` picks full (one Table of
 * upcoming and billed charges, the next charge marked in words), nextOnly (the next-charge panel) or failed
 * (the open failed payment as a danger Alert over the charges still owed). Each view has its own empty,
 * loading and error states.
 */
export function BillingSchedule({
  view = "full",
  charges = [],
  next,
  description,
  failureDetail,
  emptyDescription,
  loading = false,
  error,
  onRetry,
  onAsk,
  onDownloadAll,
  onEditCharge,
  onDownloadInvoice,
  onChangeCard,
  onUpdateCard,
  className,
  ref,
  ...rest
}: BillingScheduleProps) {
  const copy = COPY[view];

  // Upcoming first (oldest first), then billed (newest first).
  const upcoming = charges
    .filter((charge) => UPCOMING.includes(charge.status))
    .sort((a, b) => a.date.localeCompare(b.date));
  const billed = charges
    .filter((charge) => !UPCOMING.includes(charge.status))
    .sort((a, b) => b.date.localeCompare(a.date));
  const failure = openFailure(billed);
  // The earliest charge still due (scheduled or retrying) carries the Next charge marker.
  const nextId = upcoming[0]?.id;

  const rows: Charge[] =
    view === "failed"
      ? failure
        ? [failure, ...[...upcoming, ...billed].filter((c) => OUTSTANDING.includes(c.status)).sort((a, b) => b.date.localeCompare(a.date))]
        : []
      : [...upcoming, ...billed];

  const isEmpty = view === "nextOnly" ? !next : rows.length === 0;
  const ready = !loading && !error && !isEmpty;
  const showFailure = ready && view !== "nextOnly" && failure !== undefined;

  const headerActions: CardAction[] = [];
  if (onAsk) headerActions.push({ label: "Ask", onClick: onAsk, iconStart: "MessageCircle", appearance: "outline" });
  if (ready && view === "full" && !showFailure && onDownloadAll)
    headerActions.push({ label: "Download all", onClick: onDownloadAll, iconStart: "Download", appearance: "ghost" });

  function rowActions(charge: Charge): TableRowAction[] {
    if (view === "full" && charge.status === "scheduled" && onEditCharge) {
      return [{ icon: "Pencil", ariaLabel: billingEditLabel(charge), onClick: () => onEditCharge(charge) }];
    }
    if (!UPCOMING.includes(charge.status) && onDownloadInvoice) {
      return [
        {
          icon: "Download",
          ariaLabel: `Download ${charge.invoice ?? `${charge.label}, ${longDate(charge.date)}`}`,
          onClick: () => onDownloadInvoice(charge),
        },
      ];
    }
    return [];
  }

  const hasRowActions = Boolean((view === "full" && onEditCharge) || onDownloadInvoice);

  let body;
  if (loading) {
    body =
      view === "nextOnly" ? (
        <NextChargeSkeleton />
      ) : (
        <Table aria-label="Charges" size="lg" stack columns={COLUMNS} rows={[]} state="loading" />
      );
  } else if (error) {
    body = (
      <Alert
        variant="danger"
        title={copy.errorTitle}
        action={onRetry ? { label: "Retry", onClick: onRetry, appearance: "outline", icon: "RotateCcw" } : undefined}
      >
        {error}
      </Alert>
    );
  } else if (isEmpty) {
    body = (
      <Empty
        title={copy.emptyTitle}
        description={emptyDescription ?? copy.emptyDescription}
        icon={view === "failed" ? "CircleCheck" : "CalendarDays"}
      />
    );
  } else if (view === "nextOnly" && next) {
    body = <NextChargePanel next={next} onChangeCard={onChangeCard} />;
  } else {
    body = (
      <>
        {showFailure && failure ? (
          <Alert
            variant="danger"
            placement="page"
            title={`${failure.amount} failed on ${longDate(failure.date)}`}
            action={onUpdateCard ? { label: "Update card", onClick: onUpdateCard } : undefined}
          >
            {failureDetail}
          </Alert>
        ) : null}
        <Table
          aria-label={view === "failed" ? "Failed and unpaid charges" : "Charges"}
          data-charge-table={view === "failed" ? "failed" : "schedule"}
          size="lg"
          stack
          columns={COLUMNS}
          rows={rows.map((charge) => {
            const isNext = view === "full" && charge.id === nextId;
            return {
              date: <span className={cx(styles.date, isNext && styles.dateNext)}>{longDate(charge.date)}</span>,
              charge: <ChargeText charge={charge} next={isNext} />,
              status: (
                <Badge tone={STATUS[charge.status].tone} size="sm">
                  {STATUS[charge.status].label}
                </Badge>
              ),
              amount: (
                <span className={cx(styles.amount, charge.status === "waived" && styles.amountWaived)}>{charge.amount}</span>
              ),
            };
          })}
          rowActions={hasRowActions ? (_row, index) => rowActions(rows[index]) : undefined}
          rowActionsAs="icons"
          rowTone={(_row, index) => (view === "full" && rows[index].id === nextId ? "highlight" : "default")}
        />
      </>
    );
  }

  return (
    <Card
      {...rest}
      {...nisthaAttr("billingschedule", rest)}
      ref={ref}
      className={className}
      size="sm"
      title="Billing schedule"
      description={description || undefined}
      headerAction={headerActions.length > 0 ? headerActions : undefined}
      aria-busy={loading || undefined}
    >
      <div className={styles.body}>{body}</div>
    </Card>
  );
}

/** nextOnly: the date and figure, a rule, what it pays with, then Change card. */
function NextChargePanel({ next, onChangeCard }: { next: NextCharge; onChangeCard?: () => void }) {
  return (
    <section className={styles.panel} aria-label="Next charge">
      <div className={styles.panelFigure}>
        <span className={styles.caption}>Next charge on {next.date}</span>
        <span className={styles.figure}>{next.amount}</span>
      </div>
      <span className={styles.panelRule}>
        <Divider orientation="vertical" />
      </span>
      <div className={styles.panelMethod}>
        <span className={styles.caption}>Pays with</span>
        <span className={styles.method}>{next.paysWith}</span>
      </div>
      {onChangeCard ? (
        <span className={styles.panelAction}>
          <Button size="sm" appearance="outline" mode="neutral" onClick={onChangeCard}>
            Change card
          </Button>
        </span>
      ) : null}
    </section>
  );
}

/** nextOnly loading: the panel's shape with Skeleton lines where the figure and method go. */
function NextChargeSkeleton() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelFigure}>
        <Skeleton width="9rem" size="sm" label="Loading the next charge" />
        <Skeleton width="7rem" size="lg" label="" />
      </div>
      <span className={styles.panelRule}>
        <Divider orientation="vertical" />
      </span>
      <div className={styles.panelMethod}>
        <Skeleton width="4rem" size="sm" label="" />
        <Skeleton width="8rem" size="md" label="" />
      </div>
    </div>
  );
}

function ChargeText({ charge, next = false }: { charge: Charge; next?: boolean }) {
  return (
    <span className={styles.description}>
      <span className={cx(styles.line, next && styles.lineNext)}>
        {charge.label}
        {next ? (
          <>
            {" "}
            <span className={styles.nextMarker}>Next charge</span>
          </>
        ) : null}
      </span>
      {charge.note ? (
        <span className={cx(styles.note, charge.status === "failed" && styles.noteDanger)}>{charge.note}</span>
      ) : null}
    </span>
  );
}
