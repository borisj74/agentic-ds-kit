"use client";

import { Alert, Card, DataTable } from "agentic-ds-kit";
import type { DataTableColumn, DataTableRow } from "agentic-ds-kit";

type InvoiceStatus = "Paid" | "Pending" | "Overdue";

interface Invoice {
  id: string;
  client: string;
  amount: number;
  due: string;
  status: InvoiceStatus;
}

const INVOICES: Invoice[] = [
  { id: "INV-1042", client: "Northwind Traders", amount: 12450, due: "2026-09-30", status: "Paid" },
  { id: "INV-1043", client: "Globex Corporation", amount: 980.5, due: "2026-10-08", status: "Overdue" },
  { id: "INV-1044", client: "Initech", amount: 3200, due: "2026-10-15", status: "Pending" },
  { id: "INV-1045", client: "Umbrella Health Partners", amount: 145000, due: "2026-11-21", status: "Pending" },
  { id: "INV-1046", client: "Hooli", amount: 7.25, due: "2026-10-31", status: "Paid" },
];

const TONE = { Paid: "success", Pending: "warning", Overdue: "danger" } as const;

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const ROW_ACTIONS = {
  type: "actionMenu" as const,
  label: "Invoice actions",
  actions: [
    { label: "Send reminder", icon: "Send" },
    { label: "Download PDF", icon: "Download" },
  ],
};

const COLUMNS: DataTableColumn[] = [
  { key: "invoice", header: "Invoice", sortable: true, width: "6rem" },
  { key: "client", header: "Client", sortable: true, wrap: true },
  { key: "due", header: "Due", sortable: true, width: "5rem", sortValue: (row) => new Date(String(row.dueOn)) },
  {
    key: "amount",
    header: "Amount",
    type: "number",
    sortable: true,
    sortValue: (row) => Number(row.amountValue),
  },
  { key: "status", header: "Status", sortable: true, width: "6rem" },
  { key: "actions", header: "Actions" },
];

const ROWS: DataTableRow[] = INVOICES.map((invoice) => ({
  id: invoice.id,
  invoice: { type: "link", label: invoice.id, href: `#${invoice.id.toLowerCase()}` },
  client: invoice.client,
  due: day.format(new Date(invoice.due)),
  amount: money.format(invoice.amount),
  status: { type: "badge", label: invoice.status, tone: TONE[invoice.status] },
  actions: ROW_ACTIONS,
  // Not columns, so not rendered: the raw values the formatted columns sort by.
  dueOn: invoice.due,
  amountValue: invoice.amount,
}));

/** Keeps the kit split's stacking container query without the page inset. */
const SPLIT_HOST = { padding: 0, overflow: "visible" } as const;

export const TABLE_CARD_CODE = `<div className="layout-split--primary">
  <Card
    title="Recent invoices"
    flush
    headerAction={{ label: "View all", href: "/invoices" }}
  >
    <DataTable
      ariaLabel="Recent invoices"
      cellSize="sm"
      columns={[
        { key: "invoice", header: "Invoice", sortable: true, width: "6rem" },
        { key: "client", header: "Client", sortable: true, wrap: true },
        { key: "due", header: "Due", sortable: true, width: "5rem",
          sortValue: (row) => new Date(row.dueOn) },
        { key: "amount", header: "Amount", type: "number", sortable: true,
          sortValue: (row) => row.amountValue },
        { key: "status", header: "Status", sortable: true, width: "6rem" },
        { key: "actions", header: "Actions" },
      ]}
      rows={invoices.map((invoice) => ({
        id: invoice.id,
        invoice: { type: "link", label: invoice.id, href: \`/invoices/\${invoice.id}\`, linkAs: Link },
        client: invoice.client,
        due: formatDate(invoice.due), // "Oct 2"
        amount: formatMoney(invoice.amount), // "$12,450.00"
        status: { type: "badge", label: invoice.status, tone: toneFor(invoice.status) },
        actions: { type: "actionMenu", label: "Invoice actions", actions: rowActions },
        dueOn: invoice.due, // not a column: what Due sorts by
        amountValue: invoice.amount,
      }))}
    />
  </Card>
  <Card title="Payment alerts" headerAction={{ label: "View all", href: "/alerts" }}>
    <Alert variant="danger" title="1 invoice overdue">Globex Corporation, $980.50.</Alert>
  </Card>
</div>`;

export function TableCardExample() {
  return (
    <div className="layout-content" style={SPLIT_HOST}>
      <div className="layout-split--primary">
        <Card title="Recent invoices" flush headerAction={{ label: "View all", href: "#datatable" }}>
          <DataTable ariaLabel="Recent invoices" cellSize="sm" columns={COLUMNS} rows={ROWS} />
        </Card>
        <Card title="Payment alerts" headerAction={{ label: "View all", href: "#datatable" }}>
          <Alert variant="danger" title="1 invoice overdue">
            Globex Corporation, $980.50.
          </Alert>
          <Alert variant="warning" title="2 due this month">
            Initech and Umbrella Health Partners.
          </Alert>
        </Card>
      </div>
    </div>
  );
}
