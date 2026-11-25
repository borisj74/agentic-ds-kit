"use client";

import { Receipt } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Empty } from "../../ui/Empty";
import { IconButton } from "../../ui/IconButton";
import { Input } from "../../ui/Input";
import { ListView } from "../../ui/ListView";
import type { ListViewItem } from "../../ui/ListView";
import { PageHeader } from "../../ui/PageHeader";
import type { PageHeaderProps } from "../../ui/PageHeader";
import { SegmentedControl } from "../../ui/SegmentedControl";
import { Table } from "../../ui/Table";
import {
  INVOICES,
  type InvoiceStatus,
  type ListDetailItem,
} from "./list-detail-data";
import "./ListDetailPattern.css";

export interface ListDetailPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  /** The open record when the URL hash names none. Leave it out to start with nothing open. */
  selectedId?: string;
}

type Filter = "all" | InvoiceStatus;

const FILTER_LABEL: Record<Filter, string> = {
  all: "All",
  overdue: "Overdue",
  open: "Open",
  paid: "Paid",
};

const STATUS_BADGE: Record<
  InvoiceStatus,
  { tone: "danger" | "info" | "success"; icon: string; label: string }
> = {
  overdue: { tone: "danger", icon: "CircleX", label: "Overdue" },
  open: { tone: "info", icon: "Clock", label: "Open" },
  paid: { tone: "success", icon: "CircleCheck", label: "Paid" },
};

/*
 * The demo stands for a bigger ledger: the segments and the Showing line count the whole book, while the list
 * renders a page of it. Replace with your own totals (or counts from the server).
 */
const DEMO_TOTALS: Record<Filter, number> = {
  all: 48,
  overdue: 14,
  open: 21,
  paid: 13,
};

const LINE_COLUMNS = [
  { key: "item", header: "Item" },
  { key: "qty", header: "Qty", numeric: true },
  { key: "amount", header: "Amount", numeric: true },
];

/*
 * Narrow = below --grid-breakpoint-sm (640), read at runtime. Below it the list fills the page and a
 * row opens a full-page detail; at 640 and up the detail sits beside the list. 40rem is the fallback.
 */
function narrowQuery(): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--grid-breakpoint-sm")
    .trim();
  return `(width < ${value || "40rem"})`;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(narrowQuery());
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(narrowQuery()).matches,
    () => false,
  );
}

function invoiceById(
  id: string | null | undefined,
): ListDetailItem | undefined {
  return id ? INVOICES.find((item) => item.id === id) : undefined;
}

function dueLine(item: ListDetailItem): string {
  return item.daysLate > 0
    ? `due ${item.due}, ${item.daysLate} days late`
    : `due ${item.due}`;
}

function rowMeta(item: ListDetailItem): string {
  if (item.status === "overdue") return `${item.daysLate} days late`;
  return STATUS_BADGE[item.status].label;
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const look = STATUS_BADGE[status];
  return (
    <Badge tone={look.tone} icon={look.icon} size="sm">
      {look.label}
    </Badge>
  );
}

/** The record's body: amount strip, line items and payment history. Shared by the side pane and the full page. */
function InvoiceBody({
  invoice,
  narrow,
}: {
  invoice: ListDetailItem;
  narrow: boolean;
}) {
  const lineRows = invoice.lines.map((line) => ({
    item: line.item,
    qty: line.qty,
    amount: line.amount,
  }));
  // Wide reads as a log, oldest first; the phone shows the latest attempt first.
  const history = narrow ? [...invoice.payments].reverse() : invoice.payments;
  const payments: ListViewItem[] = history.map((payment) => ({
    id: payment.id,
    primary: narrow ? payment.short : payment.text,
    icon: payment.icon,
    // A declined attempt says so in its text; the red icon only adds weight.
    iconTone: payment.icon === "CircleX" ? "danger" : "neutral",
    meta: narrow ? payment.day : payment.at,
  }));
  // On the phone line items are plain rows, item and amount, with no column header.
  const lineItems: ListViewItem[] = invoice.lines.map((line) => ({
    id: line.item,
    primary: line.short ?? line.item,
    value: line.amount,
  }));
  const summary = narrow
    ? [
        {
          label: `Amount due · ${invoice.card}`,
          value: invoice.amount,
          lead: true,
        },
      ]
    : [
        {
          label: invoice.status === "paid" ? "Amount paid" : "Amount due",
          value: invoice.amount,
          lead: true,
        },
        { label: "Issued", value: invoice.issued },
        { label: "Card on file", value: invoice.card },
        { label: "Contact", value: invoice.contact },
      ];
  return (
    <div className="list-detail-pattern__body">
      <Card size="sm" flush>
        <dl
          className={`list-detail-pattern__summary${narrow ? " list-detail-pattern__summary--single" : ""}`}
        >
          {summary.map((cell) => (
            <div key={cell.label} className="list-detail-pattern__summary-cell">
              <dt>{cell.label}</dt>
              <dd data-lead={cell.lead || undefined}>{cell.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card
        title="Line items"
        headingLevel={3}
        size={narrow ? "sm" : "md"}
        flush
      >
        {narrow ? (
          <ListView
            label={`Line items on ${invoice.id}`}
            size="xs"
            flush
            items={lineItems}
          />
        ) : (
          <Table
            columns={LINE_COLUMNS}
            rows={lineRows}
            footer={{
              label: invoice.status === "paid" ? "Total paid" : "Total due",
              value: invoice.total,
            }}
          />
        )}
      </Card>
      <Card
        title="Payment history"
        headingLevel={3}
        size={narrow ? "sm" : "md"}
        flush
      >
        <ListView
          label={`Payment history for ${invoice.id}`}
          size={narrow ? "xs" : "md"}
          flush
          items={payments}
          empty={{ title: "No payment attempts yet." }}
        />
      </Card>
    </div>
  );
}

export function ListDetailPattern({
  breadcrumbs,
  selectedId,
}: ListDetailPatternProps) {
  const narrow = useNarrow();
  const [openId, setOpenId] = useState<string | null>(
    invoiceById(selectedId)?.id ?? null,
  );
  const [filter, setFilter] = useState<Filter>("overdue");
  const [query, setQuery] = useState("");
  const [announce, setAnnounce] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const headingId = useId();
  const returnTo = useRef<string | null>(null);

  // Follow a changed `selectedId` prop by adjusting state during render
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [prevSelectedId, setPrevSelectedId] = useState(selectedId);
  if (selectedId !== prevSelectedId) {
    setPrevSelectedId(selectedId);
    setOpenId(invoiceById(selectedId)?.id ?? null);
  }

  // One URL per record: #INV-1842 opens that invoice, an empty hash is the list. A hash on load wins over selectedId.
  useEffect(() => {
    const fromHash = (initial: boolean) => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (initial && !hash) return;
      setOpenId((current) => {
        const next = invoiceById(hash)?.id ?? null;
        if (current && !next) returnTo.current = current;
        return next;
      });
    };
    fromHash(true);
    const onHash = () => fromHash(false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const open = invoiceById(openId);

  function openInvoice(id: string) {
    if (id === openId) return;
    setOpenId(id);
    setAnnounce(`${id} open`);
    if (window.location.hash !== `#${id}`)
      window.history.pushState(null, "", `#${id}`);
  }

  // Back (the link or the browser) puts focus on the row that was open, once the list is back.
  useEffect(() => {
    const id = returnTo.current;
    if (!id || openId || !narrow) return;
    returnTo.current = null;
    const row = listRef.current?.querySelector<HTMLElement>(
      `[role="listitem"][id$="-${CSS.escape(id)}"]`,
    );
    row?.focus();
  }, [openId, narrow]);

  const counts = DEMO_TOTALS;

  const needle = query.trim().toLowerCase();
  const inFilter = INVOICES.filter(
    (item) => filter === "all" || item.status === filter,
  );
  const shown = needle
    ? inFilter.filter(
        (item) =>
          item.customer.toLowerCase().includes(needle) ||
          item.id.toLowerCase().includes(needle),
      )
    : inFilter;

  const items: ListViewItem[] = shown.map((item) => ({
    id: item.id,
    primary: item.customer,
    // The phone row keeps the invoice number only; the due date is in the record.
    secondary: narrow ? item.id : `${item.id} · due ${item.due}`,
    value: item.amount,
    meta: rowMeta(item),
    // "N days late" says it in words; danger tone only adds weight.
    metaTone: item.status === "overdue" ? "danger" : "neutral",
  }));

  const filterItems = (Object.keys(FILTER_LABEL) as Filter[]).map((key) => ({
    value: key,
    label: `${FILTER_LABEL[key]} ${counts[key]}`,
  }));

  const newInvoice = narrow ? (
    <IconButton
      icon="Plus"
      ariaLabel="New invoice"
      size="lg"
      appearance="outline"
      mode="neutral"
    />
  ) : (
    <Button size="sm" appearance="outline" mode="neutral" iconStart="Plus">
      New invoice
    </Button>
  );

  const oldestOverdue = INVOICES.find((item) => item.status === "overdue");

  // Ask sits on its own at the start; Download PDF and the one primary sit together at the end.
  // Below 640 the row is lg (40): Ask, Download PDF as an IconButton, and Retry payment filling the rest.
  const detailActions = (invoice: ListDetailItem) => (
    <div className="list-detail-pattern__actions">
      <span className="list-detail-pattern__ask">
        <Button
          size={narrow ? "lg" : "sm"}
          appearance="outline"
          mode="neutral"
          iconStart="MessageCircle"
        >
          Ask
        </Button>
      </span>
      {narrow ? (
        <IconButton
          icon="Download"
          ariaLabel="Download PDF"
          size="lg"
          appearance="outline"
          mode="neutral"
        />
      ) : (
        <Button
          size="md"
          appearance="outline"
          mode="neutral"
          iconStart="Download"
        >
          Download PDF
        </Button>
      )}
      {invoice.status === "overdue" ? (
        <span className={narrow ? "list-detail-pattern__grow" : undefined}>
          <Button
            size={narrow ? "lg" : "md"}
            iconStart="RefreshCw"
            block={narrow}
          >
            Retry payment
          </Button>
        </span>
      ) : null}
    </div>
  );

  const live = (
    <p className="list-detail-pattern__sr" role="status" aria-live="polite">
      {announce}
    </p>
  );

  // Below 640 with a record open: the record is the page, and the header's back step returns to the list.
  if (narrow && open) {
    return (
      <div className="layout-canvas">
        <nav
          className="layout-header list-detail-pattern__topbar"
          aria-label="Back"
        >
          <Button
            size="lg"
            appearance="ghost"
            mode="neutral"
            iconStart="ChevronLeft"
            onClick={() => {
              window.location.hash = "";
            }}
          >
            Invoices
          </Button>
        </nav>
        <div className="layout-content list-detail-pattern__page">
          <section
            className="list-detail-pattern__detail"
            aria-labelledby={headingId}
          >
            <header className="list-detail-pattern__head list-detail-pattern__head--page">
              <div className="list-detail-pattern__title-row">
                <h1 id={headingId} className="list-detail-pattern__title">
                  {open.id}
                </h1>
                <StatusBadge status={open.status} />
              </div>
              <p className="list-detail-pattern__sub">
                {open.customer} · {dueLine(open)}
              </p>
            </header>
            <InvoiceBody invoice={open} narrow />
            {detailActions(open)}
          </section>
          {live}
        </div>
      </div>
    );
  }

  const list = (
    <div className="list-detail-pattern__list" ref={listRef}>
      {narrow ? null : (
        <div className="list-detail-pattern__chrome">
          <PageHeader
            title="Invoices"
            breadcrumbs={breadcrumbs}
            actions={newInvoice}
          />
        </div>
      )}
      <div className="list-detail-pattern__controls list-detail-pattern__chrome">
        <Input
          id={searchId}
          type="search"
          size={narrow ? "lg" : "md"}
          iconStart="Search"
          placeholder="Search customer or invoice"
          ariaLabel="Search invoices"
          value={query}
          onChange={setQuery}
        />
        <SegmentedControl
          ariaLabel="Show invoices"
          size={narrow ? "md" : "sm"}
          fullWidth
          items={filterItems}
          value={filter}
          onChange={(value) => setFilter(value as Filter)}
        />
      </div>
      {filter === "overdue" && !narrow ? (
        <p className="list-detail-pattern__note list-detail-pattern__chrome">
          Overdue · oldest first
        </p>
      ) : null}
      <div
        className={`list-detail-pattern__rows${narrow ? " list-detail-pattern__rows--phone" : ""}`}
      >
        <ListView
          label="Invoices"
          size="md"
          flush
          items={items}
          selection={narrow ? "none" : "single"}
          selected={!narrow && openId ? [openId] : []}
          onSelectedChange={(ids) => (ids[0] ? openInvoice(ids[0]) : undefined)}
          interaction={narrow ? "drill" : "none"}
          onOpen={openInvoice}
          truncate="secondary"
          empty={{
            title: "No invoice matches this search.",
            description: "Try a customer name or an invoice number.",
          }}
        />
      </div>
      <p
        className="list-detail-pattern__note list-detail-pattern__chrome"
        hidden={narrow}
      >
        Showing {shown.length} of {needle ? inFilter.length : counts[filter]}
        {filter === "all" ? "" : ` ${FILTER_LABEL[filter].toLowerCase()}`}
      </p>
    </div>
  );

  return (
    <div
      className={
        narrow ? "layout-canvas layout-canvas--sticky-header" : "layout-canvas list-detail-pattern__canvas"
      }
    >
      {narrow ? (
        <div className="layout-header">
          <PageHeader title="Invoices" actions={newInvoice} />
        </div>
      ) : null}
      <div
        className={
          narrow ? "layout-content" : "layout-content list-detail-pattern__wide"
        }
      >
        {narrow ? (
          list
        ) : (
          <div className="layout-split--secondary list-detail-pattern__split">
            {list}
            {open ? (
              <section
                className="list-detail-pattern__detail list-detail-pattern__pane"
                aria-labelledby={headingId}
              >
                <header className="list-detail-pattern__head">
                  <div className="list-detail-pattern__title-row">
                    <h2 id={headingId} className="list-detail-pattern__title">
                      {open.id}
                    </h2>
                    <StatusBadge status={open.status} />
                  </div>
                  <p className="list-detail-pattern__sub">
                    {open.customer} · {dueLine(open)}
                  </p>
                  {detailActions(open)}
                </header>
                <InvoiceBody invoice={open} narrow={false} />
              </section>
            ) : (
              <div className="list-detail-pattern__pane list-detail-pattern__empty">
                <Empty
                  title="No invoice open"
                  description={`Pick one from the list. ${counts.overdue} of ${counts.all} are overdue.`}
                  icon={Receipt}
                  actions={
                    oldestOverdue ? (
                      <Button
                        size="sm"
                        appearance="outline"
                        mode="neutral"
                        onClick={() => openInvoice(oldestOverdue.id)}
                      >
                        Open oldest overdue
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            )}
          </div>
        )}
        {live}
      </div>
    </div>
  );
}
