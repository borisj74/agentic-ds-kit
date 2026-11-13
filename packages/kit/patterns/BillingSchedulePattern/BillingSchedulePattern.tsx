"use client";

import { Alert } from "../../ui/Alert";
import { Badge } from "../../ui/Badge";
import type { BadgeTone } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Divider } from "../../ui/Divider";
import { Empty } from "../../ui/Empty";
import { Section } from "../../ui/Section";
import { Skeleton } from "../../ui/Skeleton";
import { Table } from "../../ui/Table";
import { CHARGES, NEXT_ID, PAYMENT_METHOD, PLAN_LABEL, RETRY_ON, type Charge, type ChargeStatus } from "./billing-schedule-data";
import "./BillingSchedulePattern.css";

const STATUS: Record<ChargeStatus, { tone: BadgeTone; label: string }> = {
  upcoming: { tone: "info", label: "Upcoming" },
  invoiced: { tone: "neutral", label: "Invoiced" },
  paid: { tone: "success", label: "Paid" },
  failed: { tone: "danger", label: "Failed" },
  waived: { tone: "neutral", label: "Waived" },
};

/** Summary mode: two columns, so the table fits a half-width card (text columns keep a min width). */
const SUMMARY_COLUMNS = [
  { key: "charge", header: "Charge" },
  { key: "amount", header: "Amount", align: "end" as const, numeric: true },
];

const COLUMNS = [
  { key: "date", header: "Date" },
  { key: "description", header: "Description" },
  { key: "status", header: "Status" },
  { key: "amount", header: "Amount", align: "end" as const, numeric: true },
];

export interface BillingSchedulePatternProps {
  charges?: Charge[];
  nextId?: string;
  /** Show only the next-charge summary, no table (a billing overview card). */
  nextOnly?: boolean;
  /**
   * Overview card for a Billing page: no next-charge strip, the first `limit` charges in two
   * columns (charge with its date and status, amount) so it fits a half-width column, and View all.
   */
  summary?: boolean;
  /** Charges shown in summary mode. Default 3. */
  limit?: number;
  /** Section description. Default: the plan label from the data file. */
  description?: string;
  /** "View all" (ghost) in the Section actions, to the full schedule. Wins over Download all. */
  onViewAll?: () => void;
  paymentMethod?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onDownloadAll?: () => void;
  onChangeCard?: () => void;
  /** Failed payment: Update card is the one solid primary. */
  onUpdateCard?: () => void;
}

/**
 * Billing schedule block for a Billing settings page: next charge, a failed-payment notice, and every charge
 * in a kit Table with its status as a word. Copy it in and replace the demo data.
 */
export function BillingSchedulePattern({
  charges = CHARGES,
  nextId = NEXT_ID,
  nextOnly = false,
  summary = false,
  limit = 3,
  description = PLAN_LABEL,
  onViewAll,
  paymentMethod = PAYMENT_METHOD,
  loading = false,
  error,
  onRetry,
  onDownloadAll,
  onChangeCard,
  onUpdateCard,
}: BillingSchedulePatternProps) {
  const next = charges.find((charge) => charge.id === nextId);
  const failed = charges.find((charge) => charge.status === "failed");
  const ready = !loading && !error && charges.length > 0;
  const shown = summary ? charges.slice(0, limit) : charges;

  return (
    <Section
      title="Billing schedule"
      description={description}
      size="sm"
      aria-busy={loading || undefined}
      actions={
        ready && !nextOnly && onViewAll ? (
          <Button size="sm" appearance="ghost" mode="neutral" iconEnd="ArrowRight" onClick={onViewAll}>
            View all
          </Button>
        ) : ready && !nextOnly && onDownloadAll ? (
          <Button size="sm" appearance="ghost" mode="neutral" iconStart="Download" onClick={onDownloadAll}>
            Download all
          </Button>
        ) : undefined
      }
    >
      <div className="billing-schedule-pattern">
        {loading ? (
          <div className="billing-schedule-pattern__loading">
            <Skeleton lines={4} />
          </div>
        ) : error ? (
          <div className="billing-schedule-pattern__notice">
            <Alert variant="danger" title="Couldn’t load the billing schedule">
              {error}
            </Alert>
            {onRetry ? (
              <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
                Retry
              </Button>
            ) : null}
          </div>
        ) : charges.length === 0 ? (
          <Empty title="No charges yet" description="Your first charge appears here after the trial ends." icon="CalendarDays" />
        ) : (
          <>
            {next && !summary ? (
              <Card size="sm" aria-label="Next charge">
                <div className="billing-schedule-pattern__next">
                  <div className="billing-schedule-pattern__next-amount">
                    <span className="billing-schedule-pattern__caption">Next charge</span>
                    <span className="billing-schedule-pattern__figure">{next.amount}</span>
                  </div>
                  <Divider orientation="vertical" />
                  <div className="billing-schedule-pattern__next-meta">
                    <span className="billing-schedule-pattern__date">on {next.date}</span>
                    <span className="billing-schedule-pattern__caption">{paymentMethod}</span>
                  </div>
                  {onChangeCard ? (
                    <Button size="sm" appearance="outline" mode="neutral" onClick={onChangeCard}>
                      Change card
                    </Button>
                  ) : null}
                </div>
              </Card>
            ) : null}

            {failed && !nextOnly ? (
              <div className="billing-schedule-pattern__notice">
                <Alert variant="danger" title={`Payment failed on ${failed.date} · ${failed.amount}`}>
                  {`The card was declined. We'll retry on ${RETRY_ON}; update the card to avoid a pause.`}
                </Alert>
                {onUpdateCard ? (
                  <Button size="sm" onClick={onUpdateCard}>
                    Update card
                  </Button>
                ) : null}
              </div>
            ) : null}

            {!nextOnly ? (
              <Table
                aria-label="Charges"
                size="sm"
                columns={summary ? SUMMARY_COLUMNS : COLUMNS}
                rows={shown.map((charge) =>
                  summary
                    ? {
                        charge: <SummaryCharge charge={charge} />,
                        amount: <span className="billing-schedule-pattern__mono">{charge.amount}</span>,
                      }
                    : {
                        date: <span className="billing-schedule-pattern__mono">{charge.date}</span>,
                        description: <Description charge={charge} next={charge.id === nextId} />,
                        status: (
                          <Badge tone={STATUS[charge.status].tone} size="sm">
                            {STATUS[charge.status].label}
                          </Badge>
                        ),
                        amount: <span className="billing-schedule-pattern__mono">{charge.amount}</span>,
                      },
                )}
              />
            ) : null}
          </>
        )}
      </div>
    </Section>
  );
}

function Description({ charge, next }: { charge: Charge; next: boolean }) {
  return (
    <span className="billing-schedule-pattern__description">
      <span className="billing-schedule-pattern__line">
        {charge.label}
        {next ? (
          <Badge tone="info" size="sm">
            Next charge
          </Badge>
        ) : null}
      </span>
      {charge.note ? (
        <span className={charge.status === "failed" ? "billing-schedule-pattern__note billing-schedule-pattern__note--danger" : "billing-schedule-pattern__note"}>
          {charge.note}
        </span>
      ) : null}
    </span>
  );
}

function SummaryCharge({ charge }: { charge: Charge }) {
  return (
    <span className="billing-schedule-pattern__description">
      <span className="billing-schedule-pattern__line">
        {charge.label}
        <Badge tone={STATUS[charge.status].tone} size="sm">
          {STATUS[charge.status].label}
        </Badge>
      </span>
      <span className="billing-schedule-pattern__note billing-schedule-pattern__mono">{charge.date}</span>
    </span>
  );
}
