"use client";

import { useId, useState } from "react";
import { Alert } from "../../ui/Alert";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Drawer } from "../../ui/Drawer";
import { Empty } from "../../ui/Empty";
import { ListView } from "../../ui/ListView";
import { PricingPlans } from "../../ui/PricingPlans";
import { Skeleton } from "../../ui/Skeleton";
import { Table } from "../../ui/Table";
import { UsageMeter } from "../../ui/UsageMeter";
import { BillingSchedulePattern } from "../BillingSchedulePattern";
import {
  CREDITS,
  INVOICES,
  INVOICES_NOTE,
  INVOICES_SUMMARY,
  OVERDUE,
  PAYMENT_METHOD,
  PLAN,
  PRICING_PLANS,
  RECENT_CHARGES,
  type Invoice,
} from "./settings-data";

export type BillingState = "ready" | "overdue" | "loading" | "error";

export interface BillingSettingsProps {
  state?: BillingState;
  /** Below --grid-breakpoint-md: one column, AI credits first, invoices as a list. */
  narrow?: boolean;
  onRetry?: () => void;
  onUpgrade?: () => void;
  onChoosePlan?: (planId: string) => void;
  onPayNow?: () => void;
  onUpdateCard?: () => void;
  onViewAllCharges?: () => void;
  onViewAllInvoices?: () => void;
  onDownload?: (invoiceId: string) => void;
}

const INVOICE_COLUMNS = [
  { key: "invoice", header: "Invoice", emphasis: true },
  { key: "date", header: "Date" },
  { key: "item", header: "Item" },
  { key: "status", header: "Status" },
  { key: "amount", header: "Amount", numeric: true },
];

function statusBadge(invoice: Invoice) {
  return (
    <Badge tone={invoice.status === "paid" ? "success" : "danger"} size="sm">
      {invoice.status === "paid" ? "Paid" : "Failed"}
    </Badge>
  );
}

/**
 * Billing page: the plan (Compare plans opens kit PricingPlans in a Drawer), the payment method,
 * AI credits in a kit UsageMeter (its Upgrade is the one solid primary), invoices in a kit Table,
 * then the billing-schedule example in its summary mode. Narrow puts AI credits first and lists
 * invoices in a ListView. Overdue puts a danger Alert on top and makes Pay now the one solid
 * primary; Upgrade steps away.
 */
export function BillingSettings({
  state = "ready",
  narrow = false,
  onRetry,
  onUpgrade,
  onChoosePlan,
  onPayNow,
  onUpdateCard,
  onViewAllCharges,
  onViewAllInvoices,
  onDownload,
}: BillingSettingsProps) {
  const noteId = useId();
  const [plansOpen, setPlansOpen] = useState(false);
  const [interval, setInterval] = useState<"month" | "year">("month");

  if (state === "error") {
    return (
      <div className="layout-content">
        <Empty
          outlined
          icon="CircleX"
          title="Couldn’t load billing"
          description="The billing service didn’t respond. Your plan and payments are not affected."
          actions={
            <Button appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="layout-content settings-pattern__stack" aria-busy="true">
        <div className="layout-split">
          <Card title="Plan">
            <Skeleton lines={3} label="Loading plan" />
          </Card>
          <Card title="Payment method">
            <Skeleton lines={3} label="Loading payment method" />
          </Card>
        </div>
        <UsageMeter title="AI credits" used={0} limit={CREDITS.limit} loading />
        <Card title="Invoices">
          <Skeleton lines={4} label="Loading invoices" />
        </Card>
      </div>
    );
  }

  const overdue = state === "overdue";
  const comparePlans = () => setPlansOpen(true);

  const credits = (
    <UsageMeter
      className="settings-pattern__credits"
      title="AI credits"
      used={CREDITS.used}
      limit={CREDITS.limit}
      resetLabel={CREDITS.resetLabel}
      categories={CREDITS.categories}
      warnAt={0.8}
      paceNote={CREDITS.paceNote}
      // Overdue: Pay now is the one solid primary, so Upgrade steps away.
      onUpgrade={overdue ? undefined : onUpgrade ?? comparePlans}
    />
  );

  const plan = narrow ? (
    <CompactCard title={PLAN.short} detail={`Next charge ${PLAN.nextCharge}`} action="Compare" actionLabel="Compare plans" onAction={comparePlans} />
  ) : (
    <Card
      title="Plan"
      badge={
        <Badge tone="neutral" size="sm">
          Current
        </Badge>
      }
      headerAction={{ label: "Compare plans", appearance: "outline", mode: "neutral", onClick: comparePlans }}
    >
      <div className="settings-pattern__fields">
        <div className="settings-pattern__line">
          <span className="settings-pattern__figure">{PLAN.name}</span>
          <span className="settings-pattern__caption">{PLAN.priceNote}</span>
        </div>
        <div className="settings-pattern__row settings-pattern__row--center settings-pattern__ruled">
          <span className="settings-pattern__muted">Next charge</span>
          <span className="settings-pattern__mono">{PLAN.nextCharge}</span>
        </div>
      </div>
    </Card>
  );

  const card = narrow ? (
    <CompactCard title={PAYMENT_METHOD.card} detail={PAYMENT_METHOD.expires} action="Update" actionLabel="Update card" onAction={onUpdateCard} />
  ) : (
    <Card
      title="Payment method"
      headerAction={{ label: "Update card", appearance: "outline", mode: "neutral", onClick: onUpdateCard }}
    >
      <div className="settings-pattern__fields">
        <ListView
          label="Payment method"
          size="sm"
          items={[{ id: "card", icon: "CreditCard", primary: PAYMENT_METHOD.card, secondary: PAYMENT_METHOD.expires }]}
        />
        <div className="settings-pattern__row settings-pattern__row--center settings-pattern__ruled">
          <span className="settings-pattern__muted">Receipts go to</span>
          <span className="settings-pattern__strong">{PAYMENT_METHOD.receipts}</span>
        </div>
      </div>
    </Card>
  );

  const invoices = narrow ? (
    <Card title="Invoices" flush>
      <ListView
        label="Invoices"
        size="lg"
        flush
        items={INVOICES.map((invoice) => ({
          id: invoice.id,
          primary: invoice.number,
          secondary: `${invoice.short} · ${invoice.amount}${invoice.status === "failed" ? " · retry 25 Nov" : ""}`,
          badge: invoice.status === "paid" ? "Paid" : "Failed",
          badgeTone: invoice.status === "paid" ? ("success" as const) : ("danger" as const),
        }))}
      />
    </Card>
  ) : (
    <Card
      title="Invoices"
      flush
      description={INVOICES_SUMMARY}
    >
      <Table
        aria-label="Invoices"
        aria-describedby={noteId}
        columns={INVOICE_COLUMNS}
        rows={INVOICES.map((invoice) => ({
          invoice: <span className="settings-pattern__mono">{invoice.number}</span>,
          date: invoice.date,
          item: invoice.item,
          status: statusBadge(invoice),
          amount: <span className="settings-pattern__mono">{invoice.amount}</span>,
        }))}
        rowActionsAs="icons"
        rowActions={(_, index) => [
          {
            icon: "Download",
            ariaLabel: `Download ${INVOICES[index].number}`,
            onClick: () => onDownload?.(INVOICES[index].id),
          },
        ]}
      />
      <div className="settings-pattern__row settings-pattern__row--center settings-pattern__inset">
        <span className="settings-pattern__caption" id={noteId}>
          {INVOICES_NOTE}
        </span>
        <Button appearance="ghost" mode="neutral" size="sm" onClick={onViewAllInvoices}>
          View all invoices
        </Button>
      </div>
    </Card>
  );

  const schedule = (
    <Card>
      <BillingSchedulePattern charges={RECENT_CHARGES} description="Upcoming and recent charges" summary onViewAll={onViewAllCharges} />
    </Card>
  );

  return (
    <div className="layout-content settings-pattern__stack">
      {overdue ? (
        <div className="settings-pattern__notice">
          <Alert variant="danger" title={OVERDUE.title}>
            {OVERDUE.body}
          </Alert>
          <div className="settings-pattern__actions">
            <Button appearance="outline" mode="neutral" onClick={onUpdateCard}>
              Update card
            </Button>
            <Button onClick={onPayNow}>Pay now</Button>
          </div>
        </div>
      ) : null}

      {narrow ? (
        <>
          {credits}
          {plan}
          {card}
        </>
      ) : (
        <>
          <div className="layout-split">
            {plan}
            {card}
          </div>
          {credits}
        </>
      )}
      {invoices}
      {schedule}

      <Drawer
        open={plansOpen}
        side={narrow ? "bottom" : "right"}
        size="lg"
        title="Compare plans"
        onClose={() => setPlansOpen(false)}
      >
        <PricingPlans
          plans={PRICING_PLANS}
          interval={interval}
          onIntervalChange={setInterval}
          savingsLabel="Save 17% with yearly"
          footnote="Prices exclude tax. Change or cancel any time."
          onSelect={(id) => {
            setPlansOpen(false);
            onChoosePlan?.(id);
          }}
        />
      </Drawer>
    </div>
  );
}

/** Narrow plan and card summary: one line, its detail, and one outline action, in a small Card. */
function CompactCard({
  title,
  detail,
  action,
  actionLabel,
  onAction,
}: {
  title: string;
  detail: string;
  action: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <Card size="sm">
      <div className="settings-pattern__row settings-pattern__row--center">
        <span className="settings-pattern__two-line">
          <span className="settings-pattern__strong">{title}</span>
          <span className="settings-pattern__caption">{detail}</span>
        </span>
        <Button appearance="outline" mode="neutral" size="sm" ariaLabel={actionLabel} onClick={onAction}>
          {action}
        </Button>
      </div>
    </Card>
  );
}
