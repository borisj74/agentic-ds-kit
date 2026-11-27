"use client";

import { useState } from "react";
import { Badge, Card, Cell, Table } from "agentic-ds-kit";
import type { TableColumn, TableRow, TableRowAction, TableSize, TableState } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, SizeControl } from "./ControlsPanel";

const SIZES: TableSize[] = ["sm", "md", "lg"];

const MASTER_COLUMNS: TableColumn[] = [
  { key: "invoice", header: "Invoice", emphasis: true },
  { key: "status", header: "Status" },
  { key: "method", header: "Method" },
  { key: "amount", header: "Amount", numeric: true, align: "end" },
];

const MASTER_ROWS = [
  { invoice: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { invoice: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
  { invoice: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00" },
  { invoice: "INV005", status: "Paid", method: "PayPal", amount: "$550.00" },
  { invoice: "INV006", status: "Pending", method: "Bank Transfer", amount: "$200.00" },
  { invoice: "INV007", status: "Unpaid", method: "Credit Card", amount: "$300.00" },
];

const MASTER_FOOTER = { label: "Total", value: "$2,500.00" };
const MASTER_CAPTION = "A list of your recent invoices.";

const INVOICE_ROWS: TableRow[] = [
  { customer: "Northwind Traders", invoice: "INV-2041", status: <Badge tone="danger" icon="CircleX">Overdue</Badge>, due: "Nov 12", amount: "$12,450.00" },
  { customer: "Hooli", invoice: "INV-2045", status: <Badge tone="danger" icon="CircleX">Failed</Badge>, due: "Nov 18", amount: "$1,249.00" },
  { customer: "Initech", invoice: "INV-2043", status: <Badge tone="info" icon="Clock">Partly paid</Badge>, due: "Nov 24", amount: "$7,200.00" },
  { customer: "Umbrella Health", invoice: "INV-2044", status: <Badge tone="neutral" icon="Clock">Open</Badge>, due: "Dec 5", amount: "$48,000.00" },
];

const DUE_DATES: Record<string, number> = { "Nov 12": 12, "Nov 18": 18, "Nov 24": 24, "Dec 5": 35 };

const INVOICE_COLUMNS: TableColumn[] = [
  { key: "customer", header: "Customer", sortable: true },
  { key: "invoice", header: "Invoice" },
  { key: "status", header: "Status" },
  { key: "due", header: "Due", sortable: true, sortValue: (row) => DUE_DATES[String(row.due)] ?? 0 },
  {
    key: "amount",
    header: "Amount",
    numeric: true,
    sortable: true,
    sortValue: (row) => Number(String(row.amount).replace(/[^0-9.]/g, "")),
  },
];

const ROW_ACTIONS = (): TableRowAction[] => [
  { label: "Send reminder", icon: "Send" },
  { label: "Download PDF", icon: "Download" },
  { label: "Void invoice", icon: "CircleX", mode: "danger" },
];

const CELL_ROWS: TableRow[] = [
  { owner: <Cell type="avatar" size="sm" name="Maya Chen" initials="MC" />, invoice: "INV-2041", amount: "$12,450.00" },
  { owner: <Cell type="avatar" size="sm" name="Leo Park" initials="LP" />, invoice: "INV-2045", amount: "$1,249.00" },
];

const CELL_COLUMNS: TableColumn[] = [
  { key: "owner", header: "Owner" },
  { key: "invoice", header: "Invoice" },
  { key: "amount", header: "Amount", numeric: true },
];

const STATES: TableState[] = ["loading", "empty", "error"];

const COLUMN_RULES = [
  ["Text starts on the left.", "Customer, owner and status read from the start of the cell."],
  ["Numbers end on the right.", "Amounts use tabular figures and always show cents, so the decimal points line up."],
  ["Headers follow their column.", "A number column puts its header and sort icon on the right."],
  ["Dates use one short format.", "Nov 12, with late text after it in words."],
  ["The row menu comes last.", "It is 56px wide, has no header text, and is named Actions for the row."],
  ["Edges match the card.", "In a flush Card the first and last cells take the card padding."],
  ["Rows stay one line.", "md rows are 40px. Keep cell text short."],
  ["Below 480px rows can stack.", "Opt in with stack: the first column and amount sit on top, the rest below. rowHref links the row."],
];

function masterCode(size: TableSize) {
  const lines = ["<Table", `  caption="${MASTER_CAPTION}"`];
  if (size !== "md") lines.push(`  size="${size}"`);
  lines.push(
    "  columns={[",
    '    { key: "invoice", header: "Invoice", emphasis: true },',
    '    { key: "status", header: "Status" },',
    '    { key: "method", header: "Method" },',
    '    { key: "amount", header: "Amount", numeric: true, align: "end" },',
    "  ]}",
    "  rows={[",
    '    { invoice: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },',
    '    { invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },',
    "  ]}",
    '  footer={{ label: "Total", value: "$2,500.00" }}',
    "/>",
  );
  return lines.join("\n");
}

export function TableDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<TableSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Table</h2>
        <p className={styles.lede}>
          Simple semantic table for invoices, lists, and text rows. Search and filters belong on
          DataTable. One piece. Not TableHeader/TableRow/TableCell cousins.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="table-master">
        <div className={styles.masterHeader}>
          <h2 id="table-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Invoices. Caption sits under the grid. Footer holds the total. Amount hugs the right
            edge. Size lives in the panel.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <Table
                    caption={MASTER_CAPTION}
                    size={size}
                    columns={MASTER_COLUMNS}
                    rows={MASTER_ROWS}
                    footer={MASTER_FOOTER}
                  />
                </div>
              </div>
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Caption sits under the grid; footer holds the total; Amount hugs the right edge.
                </p>
              </div>
              <CodeBlock code={masterCode(size)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sort and row menu</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewPage}>
                  <Card flush title="Invoices">
                    <Table
                      aria-label="Invoices"
                      columns={INVOICE_COLUMNS}
                      rows={INVOICE_ROWS}
                      rowActions={ROW_ACTIONS}
                      rowHref={(row) => `#${String(row.invoice)}`}
                      stack
                    />
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  sortable makes a header a button: ascending, descending, then off. Give currency and
                  date columns a sortValue. rowActions adds one row menu in the last column. In a flush
                  Card the first and last cells line up with the card title. stack is opt-in: below
                  480px each row becomes two lines and rowHref links it.
                </p>
              </div>
              <CodeBlock
                code={`<Table
  aria-label="Invoices"
  stack
  rowHref={(row) => \`/invoices/\${row.invoice}\`}
  rowActions={(row) => [
    { label: "Send reminder", icon: "Send", onClick: () => remind(row.invoice) },
    { label: "Void invoice", icon: "CircleX", mode: "danger", onClick: () => voidInvoice(row.invoice) },
  ]}
  columns={[
    { key: "customer", header: "Customer", sortable: true },
    { key: "invoice", header: "Invoice" },
    { key: "status", header: "Status" },
    { key: "due", header: "Due", sortable: true, sortValue: (row) => dueDate(row) },
    { key: "amount", header: "Amount", numeric: true, sortable: true, sortValue: (row) => cents(row) },
  ]}
  rows={[
    { customer: "Northwind Traders", invoice: "INV-2041", status: <Badge tone="danger" icon="CircleX">Overdue</Badge>, due: "Nov 12", amount: "$12,450.00" },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Loading, empty and error</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  {STATES.map((state) => (
                    <Table
                      key={state}
                      aria-label={`Invoices, ${state}`}
                      columns={INVOICE_COLUMNS.slice(0, 3)}
                      rows={INVOICE_ROWS}
                      state={state}
                      emptyLabel="No invoices match these filters."
                      errorMessage="Couldn’t load invoices from Stripe."
                      onRetry={() => undefined}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The header stays in every state. loading shows skeleton rows. empty shows emptyLabel,
                  so say why it is empty. error names what failed and onRetry adds Try again. Put
                  Clear filters or Ask next to the table, not inside it.
                </p>
              </div>
              <CodeBlock
                code={`<Table
  columns={columns}
  rows={rows}
  state={isLoading ? "loading" : error ? "error" : rows.length === 0 ? "empty" : undefined}
  emptyLabel="No invoices match these filters."
  errorMessage="Couldn’t load invoices from Stripe."
  onRetry={refetch}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Cell values</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Table aria-label="Invoice owners" columns={CELL_COLUMNS} rows={CELL_ROWS} stickyHeader />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Rows take kit Cell values (avatar, link, badge) and Badge. HeaderCell stays on
                  DataTable. stickyHeader keeps the header in view when you give the Table a height.
                </p>
              </div>
              <CodeBlock
                code={`<Table
  stickyHeader
  style={{ maxHeight: "20rem" }}
  columns={[{ key: "owner", header: "Owner" }, { key: "invoice", header: "Invoice" }, { key: "amount", header: "Amount", numeric: true }]}
  rows={[{ owner: <Cell type="avatar" size="sm" name="Maya Chen" initials="MC" />, invoice: "INV-2041", amount: "$12,450.00" }]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Column rules</h2>
              <ol className={styles.usageBody}>
                {COLUMN_RULES.map(([rule, detail]) => (
                  <li key={rule}>
                    <strong>{rule}</strong> {detail}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
