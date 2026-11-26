"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Alert } from "../../ui/Alert";
import { AlertDialog } from "../../ui/AlertDialog";
import { Badge } from "../../ui/Badge";
import type { BadgeTone } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import type { CardAction } from "../../ui/Card";
import { CurrencyInput } from "../../ui/CurrencyInput";
import { DatePicker } from "../../ui/DatePicker";
import { Divider } from "../../ui/Divider";
import { Drawer } from "../../ui/Drawer";
import { Empty } from "../../ui/Empty";
import { Field } from "../../ui/Field";
import { RadioGroup } from "../../ui/RadioGroup";
import { Table } from "../../ui/Table";
import type { TableRowAction } from "../../ui/Table";
import {
  CHARGES,
  EMPTY_NOTE,
  FAILURE_DETAIL,
  NEXT_CHARGE,
  PLAN_LABEL,
  type Charge,
  type ChargeStatus,
  type NextCharge,
} from "./billing-schedule-data";
import "./BillingSchedulePattern.css";

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

/** Summary mode: two columns, so the table fits a half-width card (text columns keep a min width). */
const SUMMARY_COLUMNS = [
  { key: "charge", header: "Charge" },
  { key: "amount", header: "Amount", align: "end" as const, numeric: true },
];

const COLUMNS = [
  { key: "date", header: "Date" },
  { key: "charge", header: "Description" },
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
  /** The nextOnly panel: date, figure and what it pays with. Default: the demo data. */
  next?: NextCharge;
  /** Show only the next-charge panel, no table (a billing overview card). */
  nextOnly?: boolean;
  /**
   * Overview card for a Billing page: no next-charge panel, the first `limit` charges in two
   * columns (charge with its date and status, amount) so it fits a half-width column, and View all.
   */
  summary?: boolean;
  /** Charges shown in summary mode. Default 3. */
  limit?: number;
  /** The Card description under the title, such as the plan name. Default: the demo plan. */
  description?: string;
  /** The failure Alert's body: what was declined, when the retry runs and what to do before then. */
  failureDetail?: string;
  /** ISO 4217 code for the edit Drawer's CurrencyInput. Default USD. */
  currency?: string;
  /** "View all" (ghost) in the Card header, to the full schedule. Wins over Download all. */
  onViewAll?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  /** Ask (outline, MessageCircle) in the Card header. */
  onAsk?: () => void;
  /** Download all (ghost) in the Card header; hidden while the failure Alert shows. */
  onDownloadAll?: () => void;
  /** Download icon on billed rows, named by the invoice. Without it billed rows have no action. */
  onDownloadInvoice?: (charge: Charge) => void;
  /** Change card (outline) in the nextOnly panel. */
  onChangeCard?: () => void;
  /** Failed payment: Update card is the one solid primary, in the failure Alert. */
  onUpdateCard?: () => void;
  /** Edit pencil on scheduled rows, opening the Drawer. Without it scheduled rows have no action. */
  onSaveCharge?: (id: string, edit: ChargeEdit) => void;
  /** Skip this month, after the AlertDialog. The demo also drops the row locally. */
  onSkipCharge?: (id: string) => void;
}

/** Three-letter months, so September reads Sep (en-GB Intl writes Sept). */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parse(date: string): Date | null {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** "01 Dec 2026", the one date format in the pattern. Falls back to the raw string when it is not YYYY-MM-DD. */
function longDate(date: string): string {
  const parsed = parse(date);
  if (!parsed) return date;
  return `${String(parsed.getUTCDate()).padStart(2, "0")} ${MONTHS[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`;
}

/** The pencil's name: "Edit Pro plan monthly, 01 Dec 2026". */
function editLabel(charge: Charge): string {
  return `Edit ${charge.label.replaceAll(" · ", " ")}, ${longDate(charge.date)}`;
}

function money(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

/** The newest failed charge that no paid charge came after: the one the failure Alert is about. */
function openFailure(billed: Charge[]): Charge | undefined {
  const failed = billed.find((charge) => charge.status === "failed");
  if (!failed) return undefined;
  return billed.some((charge) => charge.status === "paid" && charge.date > failed.date) ? undefined : failed;
}

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

/**
 * Billing schedule for one customer in a kit Card: the Card's header with the plan, one kit Table of
 * upcoming and billed charges with the next charge marked, a failure Alert when a payment is still open,
 * and a nextOnly panel. Scheduled rows can open a kit Drawer to move the date, change the amount or
 * skip the month. Copy it in and replace the demo data.
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
  const ready = !loading && !error && rows.length > 0;

  // One table: upcoming first (oldest first), then billed (newest first).
  const upcoming = rows
    .filter((charge) => UPCOMING.includes(charge.status))
    .sort((a, b) => a.date.localeCompare(b.date));
  const billed = rows
    .filter((charge) => !UPCOMING.includes(charge.status))
    .sort((a, b) => b.date.localeCompare(a.date));
  const ordered = [...upcoming, ...billed];
  /** The first scheduled charge says Next charge after its description. */
  const nextId = upcoming.find((charge) => charge.status === "scheduled")?.id;
  const failure = ready && !nextOnly && !summary ? openFailure(billed) : undefined;
  const hasRowActions = Boolean(onSaveCharge || onDownloadInvoice);

  useEffect(() => {
    if (editId || skipId || !focusAfter.current) return;
    const target = focusAfter.current;
    focusAfter.current = null;
    // Runs after the Drawer and AlertDialog restore focus to the opener, so the moved row wins.
    const frame = requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const charge = rows.find((item) => item.id === target);
      const pencil = charge
        ? root.querySelector<HTMLElement>(`button[aria-label="${CSS.escape(editLabel(charge))}"]`)
        : null;
      (pencil ?? root.querySelector<HTMLElement>("[data-charge-table='schedule']"))?.focus();
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
    setAnnounce(`Moved to ${longDate(edit.date)}`);
    focusAfter.current = id;
    setEditId(null);
  }

  function skip(id: string) {
    const charge = rows.find((item) => item.id === id);
    setRows((current) => current.filter((item) => item.id !== id));
    onSkipCharge?.(id);
    if (charge) setAnnounce(`Skipped ${charge.label}, ${longDate(charge.date)}`);
    focusAfter.current = id;
    setSkipId(null);
  }

  function rowActions(charge: Charge): TableRowAction[] {
    if (charge.status === "scheduled" && onSaveCharge) {
      return [{ icon: "Pencil", ariaLabel: editLabel(charge), onClick: () => setEditId(charge.id) }];
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

  // Card's own header holds the actions: Ask, then View all or Download all (at most two).
  const headerActions: CardAction[] = [];
  if (onAsk) headerActions.push({ label: "Ask", onClick: onAsk, iconStart: "MessageCircle", appearance: "outline" });
  if (ready && !nextOnly && onViewAll) headerActions.push({ label: "View all", onClick: onViewAll, appearance: "ghost" });
  else if (ready && !nextOnly && !failure && onDownloadAll)
    headerActions.push({ label: "Download all", onClick: onDownloadAll, iconStart: "Download", appearance: "ghost" });

  return (
    <Card
      size="sm"
      title="Billing schedule"
      description={description || undefined}
      headerAction={headerActions.length > 0 ? headerActions : undefined}
      aria-busy={loading || undefined}
    >
      <div className="billing-schedule-pattern" ref={rootRef}>
        <span role="status" className="billing-schedule-pattern__sr">
          {announce}
        </span>

        {loading ? (
          <Table aria-label="Charges" size="lg" columns={COLUMNS} rows={[]} state="loading" />
        ) : error ? (
          <Alert
            variant="danger"
            title="Couldn’t load the billing schedule"
            action={onRetry ? { label: "Retry", onClick: onRetry, appearance: "outline", icon: "RotateCcw" } : undefined}
          >
            {error}
          </Alert>
        ) : rows.length === 0 ? (
          <Empty title="No charges yet" description={EMPTY_NOTE} icon="CalendarDays" />
        ) : summary ? (
          <Table
            aria-label="Charges"
            size="sm"
            columns={SUMMARY_COLUMNS}
            rows={rows.slice(0, limit).map((charge) => ({
              charge: <SummaryCharge charge={charge} />,
              amount: <span className="billing-schedule-pattern__amount">{charge.amount}</span>,
            }))}
          />
        ) : nextOnly ? (
          <NextChargePanel next={next} onChangeCard={onChangeCard} />
        ) : (
          <>
            {failure ? (
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
              aria-label="Charges"
              data-charge-table="schedule"
              size="lg"
              stack
              columns={COLUMNS}
              rows={ordered.map((charge) => {
                const isNext = charge.id === nextId;
                return {
                  date: (
                    <span className={cx("billing-schedule-pattern__date", isNext && "billing-schedule-pattern__date--next")}>
                      {longDate(charge.date)}
                    </span>
                  ),
                  charge: <ChargeText charge={charge} next={isNext} />,
                  status: (
                    <Badge tone={STATUS[charge.status].tone} size="sm">
                      {STATUS[charge.status].label}
                    </Badge>
                  ),
                  amount: (
                    <span
                      className={cx(
                        "billing-schedule-pattern__amount",
                        charge.status === "waived" && "billing-schedule-pattern__amount--waived",
                      )}
                    >
                      {charge.amount}
                    </span>
                  ),
                };
              })}
              rowActions={hasRowActions ? (_row, index) => rowActions(ordered[index]) : undefined}
              rowActionsAs="icons"
            />
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
        title={skipping ? `Skip the ${longDate(skipping.date)} charge?` : "Skip this charge?"}
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
    </Card>
  );
}

/** nextOnly: the date and figure, a rule, what it pays with, then Change card. */
function NextChargePanel({ next, onChangeCard }: { next: NextCharge; onChangeCard?: () => void }) {
  return (
    <section className="billing-schedule-pattern__panel" aria-label="Next charge">
      <div className="billing-schedule-pattern__panel-figure">
        <span className="billing-schedule-pattern__caption">Next charge on {next.date}</span>
        <span className="billing-schedule-pattern__figure">{next.amount}</span>
      </div>
      <span className="billing-schedule-pattern__panel-rule">
        <Divider orientation="vertical" />
      </span>
      <div className="billing-schedule-pattern__panel-method">
        <span className="billing-schedule-pattern__caption">Pays with</span>
        <span className="billing-schedule-pattern__method">{next.paysWith}</span>
      </div>
      {onChangeCard ? (
        <span className="billing-schedule-pattern__panel-action">
          <Button size="sm" appearance="outline" mode="neutral" onClick={onChangeCard}>
            Change card
          </Button>
        </span>
      ) : null}
    </section>
  );
}

function ChargeText({ charge, next = false }: { charge: Charge; next?: boolean }) {
  return (
    <span className="billing-schedule-pattern__description">
      <span className={cx("billing-schedule-pattern__line", next && "billing-schedule-pattern__line--next")}>
        {charge.label}
        {next ? (
          <>
            {" "}
            <span className="billing-schedule-pattern__next-marker">Next charge</span>
          </>
        ) : null}
      </span>
      {charge.note ? (
        <span
          className={cx(
            "billing-schedule-pattern__note",
            charge.status === "failed" && "billing-schedule-pattern__note--danger",
          )}
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
        {charge.label}{" "}
        <Badge tone={STATUS[charge.status].tone} size="sm">
          {STATUS[charge.status].label}
        </Badge>
      </span>
      <span className="billing-schedule-pattern__note billing-schedule-pattern__date">{longDate(charge.date)}</span>
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
      description={charge ? `${charge.invoice ? `${charge.invoice} · ` : ""}was ${longDate(charge.date)}` : undefined}
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
