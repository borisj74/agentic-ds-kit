"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Alert } from "../../ui/Alert";
import { AlertDialog } from "../../ui/AlertDialog";
import { Badge } from "../../ui/Badge";
import type { BadgeTone } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { CurrencyInput } from "../../ui/CurrencyInput";
import { DatePicker } from "../../ui/DatePicker";
import { Divider } from "../../ui/Divider";
import { Drawer } from "../../ui/Drawer";
import { Empty } from "../../ui/Empty";
import { Field } from "../../ui/Field";
import { ListView } from "../../ui/ListView";
import { RadioGroup } from "../../ui/RadioGroup";
import { Section } from "../../ui/Section";
import { Skeleton } from "../../ui/Skeleton";
import { Table } from "../../ui/Table";
import type { TableRowAction } from "../../ui/Table";
import {
  BILLED_WINDOW,
  CHARGES,
  FAILURE_DETAIL,
  NEXT_CHARGE,
  PLAN_LABEL,
  UPCOMING_WINDOW,
  type Charge,
  type ChargeStatus,
  type NextCharge,
} from "./billing-schedule-data";
import "./BillingSchedulePattern.css";

type KitIconName = "Clock" | "RotateCcw" | "File" | "CircleCheck" | "CircleX" | "Minus";

/** Status is a word in a Badge with its own icon (aria-hidden), never colour alone. Scheduled stays neutral. */
const STATUS: Record<ChargeStatus, { tone: BadgeTone; label: string; icon: KitIconName }> = {
  scheduled: { tone: "neutral", label: "Scheduled", icon: "Clock" },
  retrying: { tone: "warning", label: "Retrying", icon: "RotateCcw" },
  invoiced: { tone: "info", label: "Invoiced", icon: "File" },
  paid: { tone: "success", label: "Paid", icon: "CircleCheck" },
  failed: { tone: "danger", label: "Failed", icon: "CircleX" },
  waived: { tone: "neutral", label: "Waived", icon: "Minus" },
};

const UPCOMING: ChargeStatus[] = ["scheduled", "retrying"];

/** Summary mode: two columns, so the table fits a half-width card (text columns keep a min width). */
const SUMMARY_COLUMNS = [
  { key: "charge", header: "Charge" },
  { key: "amount", header: "Amount", align: "end" as const, numeric: true },
];

const COLUMNS = [
  { key: "date", header: "Date" },
  { key: "charge", header: "Charge" },
  { key: "invoice", header: "Invoice" },
  { key: "status", header: "Status" },
  { key: "amount", header: "Amount", align: "end" as const, numeric: true },
];

/** What a saved edit changes. scope "rest" also moves the later parts of a split fee (Charge.splitLabel). */
export interface ChargeEdit {
  /** YYYY-MM-DD. */
  date: string;
  /** The new amount as a number; the pattern formats it with `currency` for the demo. */
  amount: number;
  scope: "this" | "rest";
}

export interface BillingSchedulePatternProps {
  charges?: Charge[];
  /** The next-charge Card: one figure with its lines. Default: the demo data. */
  next?: NextCharge;
  /** Show only the next-charge summary, no tables (a billing overview card). */
  nextOnly?: boolean;
  /**
   * Overview card for a Billing page: no next-charge Card, the first `limit` charges in two
   * columns (charge with its date and status, amount) so it fits a half-width column, and View all.
   */
  summary?: boolean;
  /** Charges shown in summary mode. Default 3. */
  limit?: number;
  /** Section description. Default: the customer and plan from the data file. */
  description?: string;
  /** The failure Alert's body: what was declined, the next and last retry, and what happens after. */
  failureDetail?: string;
  /** ISO 4217 code for the edit Drawer's CurrencyInput and the Upcoming total. Default USD. */
  currency?: string;
  /** "View all" (ghost) in the Section actions, to the full schedule. Wins over Download all. */
  onViewAll?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  /** Ask (outline, MessageCircle) in the Section actions. */
  onAsk?: () => void;
  onDownloadAll?: () => void;
  /** Download on a billed row, named by its invoice. */
  onDownloadInvoice?: (charge: Charge) => void;
  /** Hidden while a payment has failed: Update card takes its place. */
  onChangeCard?: () => void;
  /** Failed payment: Update card is the one solid primary, in the failure Alert. */
  onUpdateCard?: () => void;
  /** Save changes in the edit Drawer. The demo also moves the row locally. */
  onSaveCharge?: (id: string, edit: ChargeEdit) => void;
  /** Skip this month, after the AlertDialog. The demo also drops the row locally. */
  onSkipCharge?: (id: string) => void;
}

const DAY = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const LONG = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

function parse(date: string): Date | null {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** "15 Dec". Falls back to the raw string when it is not YYYY-MM-DD. */
function day(date: string): string {
  const parsed = parse(date);
  return parsed ? DAY.format(parsed) : date;
}

function weekday(date: string): string {
  const parsed = parse(date);
  return parsed ? WEEKDAY.format(parsed) : "";
}

function longDate(date: string): string {
  const parsed = parse(date);
  return parsed ? LONG.format(parsed) : date;
}

/** The pencil's name: "Edit Onboarding part 2 of 3, 15 Dec". */
function editLabel(charge: Charge): string {
  return `Edit ${charge.label.replaceAll(" · ", " ")}, ${day(charge.date)}`;
}

function money(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

/**
 * Billing schedule for one customer: the next charge as one figure, a failure Alert that says what
 * happens next, and Upcoming and Billed as two kit Tables. Scheduled rows open a kit Drawer to move
 * the date, change the amount or skip the month. Copy it in and replace the demo data.
 */
export function BillingSchedulePattern({
  charges = CHARGES,
  next = NEXT_CHARGE,
  nextOnly = false,
  summary = false,
  limit = 3,
  description = PLAN_LABEL,
  failureDetail = FAILURE_DETAIL,
  currency = "USD",
  onViewAll,
  loading = false,
  error,
  onRetry,
  onAsk,
  onDownloadAll,
  onDownloadInvoice,
  onChangeCard,
  onUpdateCard,
  onSaveCharge,
  onSkipCharge,
}: BillingSchedulePatternProps) {
  // Local copy so the demo can move and skip rows; a new `charges` prop replaces it.
  const [rows, setRows] = useState(charges);
  const [source, setSource] = useState(charges);
  if (source !== charges) {
    setSource(charges);
    setRows(charges);
  }

  const [editId, setEditId] = useState<string | null>(null);
  const [skipId, setSkipId] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  /** After Save or Skip, focus goes to this row's pencil (or the table) once the Drawer has closed. */
  const focusAfter = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const editing = rows.find((charge) => charge.id === editId) ?? null;
  const skipping = rows.find((charge) => charge.id === skipId) ?? null;
  const failed = rows.find((charge) => charge.status === "failed");
  const ready = !loading && !error && rows.length > 0;
  const showsFailure = Boolean(failed) && !nextOnly && !summary;

  const upcoming = rows
    .filter((charge) => UPCOMING.includes(charge.status))
    .sort((a, b) => a.date.localeCompare(b.date));
  const billed = rows
    .filter((charge) => !UPCOMING.includes(charge.status))
    .sort((a, b) => b.date.localeCompare(a.date));
  const upcomingTotal = upcoming.every((charge) => typeof charge.value === "number")
    ? money(upcoming.reduce((sum, charge) => sum + (charge.value ?? 0), 0), currency)
    : undefined;
  const retryIncluded = upcoming.some((charge) => charge.status === "retrying");

  useEffect(() => {
    if (editId || skipId || !focusAfter.current) return;
    const target = focusAfter.current;
    focusAfter.current = null;
    // Runs after the Drawer and AlertDialog restore focus to the opener, so the moved row wins.
    const frame = requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const charge = rows.find((item) => item.id === target);
      // Both layouts are in the DOM and a container query shows one: take what is visible.
      // Without layout (no rects anywhere) the first match wins.
      const visible = (selector: string) => {
        const nodes = [...root.querySelectorAll<HTMLElement>(selector)];
        return nodes.find((node) => node.getClientRects().length > 0) ?? nodes[0];
      };
      const pencil = charge ? visible(`button[aria-label="${CSS.escape(editLabel(charge))}"]`) : undefined;
      (pencil ?? visible("[data-charge-table='upcoming']"))?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [editId, skipId, rows]);

  function save(id: string, edit: ChargeEdit) {
    setRows((current) =>
      current.map((charge) =>
        charge.id === id ? { ...charge, date: edit.date, value: edit.amount, amount: money(edit.amount, currency) } : charge,
      ),
    );
    onSaveCharge?.(id, edit);
    setAnnounce(`Moved to ${weekday(edit.date)} ${day(edit.date)}`);
    focusAfter.current = id;
    setEditId(null);
  }

  function skip(id: string) {
    const charge = rows.find((item) => item.id === id);
    setRows((current) => current.filter((item) => item.id !== id));
    onSkipCharge?.(id);
    if (charge) setAnnounce(`Skipped ${charge.label}, ${day(charge.date)}`);
    focusAfter.current = id;
    setSkipId(null);
  }

  const askButton = onAsk ? (
    <Button size="sm" appearance="outline" mode="neutral" iconStart="MessageCircle" onClick={onAsk}>
      Ask
    </Button>
  ) : null;
  const sectionAction =
    ready && !nextOnly && onViewAll ? (
      <Button size="sm" appearance="ghost" mode="neutral" iconEnd="ArrowRight" onClick={onViewAll}>
        View all
      </Button>
    ) : ready && !nextOnly && onDownloadAll ? (
      <Button size="sm" appearance="ghost" mode="neutral" iconStart="Download" onClick={onDownloadAll}>
        Download all
      </Button>
    ) : null;

  return (
    <Section
      title="Billing schedule"
      description={description}
      size="sm"
      aria-busy={loading || undefined}
      actions={
        askButton || sectionAction ? (
          <>
            {askButton}
            {sectionAction}
          </>
        ) : undefined
      }
    >
      <div className="billing-schedule-pattern" ref={rootRef}>
        <span role="status" className="billing-schedule-pattern__sr">
          {announce}
        </span>
        {loading ? (
          <div className="billing-schedule-pattern__loading">
            <Skeleton lines={4} />
          </div>
        ) : error ? (
          <Alert
            variant="danger"
            title="Couldn’t load the billing schedule"
            action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
          >
            {error}
          </Alert>
        ) : rows.length === 0 ? (
          <Empty title="No charges yet" description="Your first charge appears here after the trial ends." icon="CalendarDays" />
        ) : summary ? (
          <Table
            aria-label="Charges"
            size="sm"
            columns={SUMMARY_COLUMNS}
            rows={rows.slice(0, limit).map((charge) => ({
              charge: <SummaryCharge charge={charge} />,
              amount: <span className="billing-schedule-pattern__mono">{charge.amount}</span>,
            }))}
          />
        ) : (
          <>
            <div className={showsFailure ? "billing-schedule-pattern__summary layout-split--primary" : "billing-schedule-pattern__summary"}>
              <NextChargeCard next={next} onChangeCard={showsFailure ? undefined : onChangeCard} />
              {showsFailure && failed ? (
                <Alert
                  variant="danger"
                  placement="page"
                  title={`${failed.invoice ?? failed.label} failed on ${day(failed.date)} · ${failed.amount}`}
                  action={onUpdateCard ? { label: "Update card", onClick: onUpdateCard } : undefined}
                >
                  {failureDetail}
                </Alert>
              ) : null}
            </div>

            {!nextOnly ? (
              <>
                <div className="billing-schedule-pattern__wide">
                  <ScheduleTable
                    kind="upcoming"
                    heading="Upcoming"
                    window={UPCOMING_WINDOW}
                    charges={upcoming}
                    footer={
                      upcomingTotal
                        ? {
                            label: `Total, ${UPCOMING_WINDOW}${retryIncluded ? ", retry included" : ""}`,
                            value: upcomingTotal,
                          }
                        : undefined
                    }
                    emptyLabel="Nothing scheduled in the next 60 days."
                    actions={(charge) =>
                      charge.status === "scheduled"
                        ? [
                            {
                              icon: "Pencil",
                              ariaLabel: editLabel(charge),
                              onClick: () => setEditId(charge.id),
                            },
                          ]
                        : []
                    }
                  />
                  <ScheduleTable
                    kind="billed"
                    heading="Billed"
                    window={BILLED_WINDOW}
                    charges={billed}
                    emptyLabel="Nothing billed in the last 60 days."
                    actions={(charge) =>
                      onDownloadInvoice
                        ? [
                            {
                              icon: "Download",
                              ariaLabel: `Download ${charge.invoice ?? charge.label}`,
                              onClick: () => onDownloadInvoice(charge),
                            },
                          ]
                        : []
                    }
                  />
                </div>
                <div className="billing-schedule-pattern__narrow">
                  <ScheduleList
                    upcoming={upcoming}
                    billed={billed}
                    currency={currency}
                    onEdit={setEditId}
                    onDownloadInvoice={onDownloadInvoice}
                  />
                </div>
              </>
            ) : null}
          </>
        )}
      </div>

      <EditChargeDrawer
        charge={editing}
        currency={currency}
        onClose={() => setEditId(null)}
        onSave={save}
        onSkip={(id) => {
          setEditId(null);
          setSkipId(id);
        }}
      />

      <AlertDialog
        open={skipping !== null}
        tone="warning"
        title={skipping ? `Skip the ${day(skipping.date)} charge?` : "Skip this charge?"}
        description={
          skipping
            ? `${skipping.label} (${skipping.amount}) won’t be charged this month. It doesn’t move to a later date.`
            : ""
        }
        consequences={skipping?.invoice ? [`${skipping.invoice} drops this line.`] : undefined}
        actionLabel="Skip charge"
        onCancel={() => {
          if (skipping) focusAfter.current = skipping.id;
          setSkipId(null);
        }}
        onAction={() => skipping && skip(skipping.id)}
      />
    </Section>
  );
}

function NextChargeCard({ next, onChangeCard }: { next: NextCharge; onChangeCard?: () => void }) {
  return (
    <Card aria-label="Next charge">
      <div className="billing-schedule-pattern__next">
        <div className="billing-schedule-pattern__next-amount">
          <span className="billing-schedule-pattern__caption">Next scheduled charge · {next.date}</span>
          <span className="billing-schedule-pattern__figure">{next.amount}</span>
          <span className="billing-schedule-pattern__note">{next.detail}</span>
          {onChangeCard ? (
            <span className="billing-schedule-pattern__next-action">
              <Button size="sm" appearance="outline" mode="neutral" onClick={onChangeCard}>
                Change card
              </Button>
            </span>
          ) : null}
        </div>
        {next.lines.length > 0 ? (
          <>
            <span className="billing-schedule-pattern__next-rule">
              <Divider orientation="vertical" />
            </span>
            <div className="billing-schedule-pattern__lines">
              {next.lines.map((line) => (
                <div key={line.label} className="billing-schedule-pattern__line-item">
                  <span>{line.label}</span>
                  <span className="billing-schedule-pattern__mono">{line.amount}</span>
                </div>
              ))}
              {next.invoice ? (
                <div className="billing-schedule-pattern__line-item billing-schedule-pattern__line-item--foot">
                  <span>Goes on {next.invoice}</span>
                  <span className="billing-schedule-pattern__mono">
                    {next.lines.length} {next.lines.length === 1 ? "line" : "lines"}
                  </span>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </Card>
  );
}

function ScheduleTable({
  kind,
  heading,
  window,
  charges,
  footer,
  emptyLabel,
  actions,
}: {
  kind: "upcoming" | "billed";
  heading: string;
  window: string;
  charges: Charge[];
  footer?: { label: string; value: string };
  emptyLabel: string;
  actions: (charge: Charge) => TableRowAction[];
}) {
  return (
    <div className="billing-schedule-pattern__group">
      <h3 className="billing-schedule-pattern__group-heading">
        {heading}
        <span className="billing-schedule-pattern__group-window">{window}</span>
      </h3>
      <Card size="sm" flush>
        <Table
          aria-label={heading}
          data-charge-table={kind}
          size="lg"
          columns={COLUMNS}
          rows={charges.map((charge) => ({
            date: <ChargeDate label={day(charge.date)} weekday={weekday(charge.date)} />,
            charge: <ChargeText charge={charge} />,
            invoice: <span className="billing-schedule-pattern__invoice">{charge.invoice ?? ""}</span>,
            status: (
              <Badge tone={STATUS[charge.status].tone} size="sm" icon={STATUS[charge.status].icon}>
                {STATUS[charge.status].label}
              </Badge>
            ),
            amount: <span className="billing-schedule-pattern__mono">{charge.amount}</span>,
          }))}
          rowActions={(_row, index) => actions(charges[index])}
          rowActionsAs="icons"
          footer={footer}
          emptyLabel={emptyLabel}
        />
      </Card>
    </div>
  );
}

const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" });

type ListTone = "neutral" | "warning" | "info" | "success" | "danger";

/**
 * Below 40rem: Upcoming as a ListView grouped by month with month totals, then Billed. Amount and
 * status sit on the right; the edit pencil and Download stay on the row, named like the desktop ones.
 */
function ScheduleList({
  upcoming,
  billed,
  currency,
  onEdit,
  onDownloadInvoice,
}: {
  upcoming: Charge[];
  billed: Charge[];
  currency: string;
  onEdit: (id: string) => void;
  onDownloadInvoice?: (charge: Charge) => void;
}) {
  const months: { id: string; label: string; total?: string }[] = [];
  for (const charge of upcoming) {
    const id = charge.date.slice(0, 7);
    if (months.some((month) => month.id === id)) continue;
    const inMonth = upcoming.filter((item) => item.date.startsWith(id));
    const parsed = parse(charge.date);
    const priced = inMonth.every((item) => typeof item.value === "number");
    months.push({
      id,
      label: parsed ? MONTH.format(parsed) : id,
      total: priced ? money(inMonth.reduce((sum, item) => sum + (item.value ?? 0), 0), currency) : undefined,
    });
  }

  const item = (charge: Charge, upcomingRow: boolean) => {
    const edit = upcomingRow && charge.status === "scheduled";
    const download = !upcomingRow && Boolean(onDownloadInvoice);
    return {
      id: charge.id,
      primary: charge.label,
      secondary: [`${weekday(charge.date)} ${day(charge.date)}`, charge.invoice].filter(Boolean).join(" · "),
      value: charge.amount,
      badge: STATUS[charge.status].label,
      badgeTone: STATUS[charge.status].tone as ListTone,
      group: upcomingRow ? charge.date.slice(0, 7) : undefined,
      actions: edit
        ? [{ id: "edit", label: "Edit", icon: "Pencil" as const, actionLabel: editLabel(charge) }]
        : download
          ? [{ id: "download", label: "Download", icon: "Download" as const, actionLabel: `Download ${charge.invoice ?? charge.label}` }]
          : undefined,
    };
  };

  return (
    <>
      <div className="billing-schedule-pattern__group">
        <h3 className="billing-schedule-pattern__group-heading">
          Upcoming
          <span className="billing-schedule-pattern__group-window">{UPCOMING_WINDOW}</span>
        </h3>
        <Card size="sm" flush>
          <ListView
            label="Upcoming"
            groups={months}
            items={upcoming.map((charge) => item(charge, true))}
            onAction={(id) => onEdit(id)}
            empty={{ title: "Nothing scheduled in the next 60 days." }}
          />
        </Card>
      </div>
      <div className="billing-schedule-pattern__group">
        <h3 className="billing-schedule-pattern__group-heading">
          Billed
          <span className="billing-schedule-pattern__group-window">{BILLED_WINDOW}</span>
        </h3>
        <Card size="sm" flush>
          <ListView
            label="Billed"
            items={billed.map((charge) => item(charge, false))}
            onAction={(id) => {
              const charge = billed.find((entry) => entry.id === id);
              if (charge) onDownloadInvoice?.(charge);
            }}
            empty={{ title: "Nothing billed in the last 60 days." }}
          />
        </Card>
      </div>
    </>
  );
}

/** `label` doubles as the row name the Table reads for its Actions group. */
function ChargeDate({ label, weekday: name }: { label: string; weekday: string }) {
  return (
    <span className="billing-schedule-pattern__date">
      <span className="billing-schedule-pattern__date-day">{label}</span>
      {name ? <span className="billing-schedule-pattern__note">{name}</span> : null}
    </span>
  );
}

function ChargeText({ charge }: { charge: Charge }) {
  return (
    <span className="billing-schedule-pattern__description">
      <span>{charge.label}</span>
      {charge.note ? (
        <span
          className={
            charge.status === "failed"
              ? "billing-schedule-pattern__note billing-schedule-pattern__note--danger"
              : "billing-schedule-pattern__note"
          }
        >
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
        <Badge tone={STATUS[charge.status].tone} size="sm" icon={STATUS[charge.status].icon}>
          {STATUS[charge.status].label}
        </Badge>
      </span>
      <span className="billing-schedule-pattern__note billing-schedule-pattern__mono">{longDate(charge.date)}</span>
    </span>
  );
}

function EditChargeDrawer({
  charge,
  currency,
  onClose,
  onSave,
  onSkip,
}: {
  charge: Charge | null;
  currency: string;
  onClose: () => void;
  onSave: (id: string, edit: ChargeEdit) => void;
  onSkip: (id: string) => void;
}) {
  const uid = useId();
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [scope, setScope] = useState<"this" | "rest">("this");
  const [amountError, setAmountError] = useState("");

  // Reset the fields each time a row's pencil opens the Drawer.
  const [forId, setForId] = useState<string | null>(null);
  if ((charge?.id ?? null) !== forId) {
    setForId(charge?.id ?? null);
    if (charge) {
      setDate(charge.date);
      setAmount(charge.value ?? null);
      setScope("this");
      setAmountError("");
    }
  }

  const open = charge !== null;
  const dateId = `${uid}-date`;
  const amountId = `${uid}-amount`;

  function submit() {
    if (!charge) return;
    if (amount === null || amount <= 0) {
      setAmountError("Enter an amount above 0.");
      return;
    }
    onSave(charge.id, { date, amount, scope });
  }

  return (
    <Drawer
      open={open}
      side="right"
      size="md"
      title={charge?.label ?? "Edit charge"}
      description={charge ? `${charge.invoice ? `${charge.invoice} · ` : ""}was ${weekday(charge.date)} ${day(charge.date)}` : undefined}
      onClose={onClose}
      footerStart={
        charge ? (
          <Button size="sm" appearance="ghost" mode="neutral" onClick={() => onSkip(charge.id)}>
            Skip this month
          </Button>
        ) : null
      }
      footer={
        <>
          <Button size="sm" appearance="outline" mode="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Save changes
          </Button>
        </>
      }
    >
      {charge ? (
        <div className="billing-schedule-pattern__form">
          <Field label="Charge date" htmlFor={dateId}>
            <DatePicker id={dateId} className="billing-schedule-pattern__picker" value={date} onValueChange={(value: string) => setDate(value)} />
          </Field>
          <Field label="Amount" htmlFor={amountId} error={amountError || undefined}>
            <CurrencyInput
              id={amountId}
              currency={currency}
              value={amount}
              min={0}
              error={Boolean(amountError)}
              steppers={false}
              onChange={(value) => {
                setAmount(value);
                if (amountError) setAmountError("");
              }}
            />
          </Field>
          {charge.splitLabel ? (
            <RadioGroup
              name={`${uid}-scope`}
              legend="Apply to"
              size="md"
              value={scope}
              onChange={(value) => setScope(value === "rest" ? "rest" : "this")}
              options={[
                { value: "this", label: "This charge only" },
                { value: "rest", label: charge.splitLabel },
              ]}
            />
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}
