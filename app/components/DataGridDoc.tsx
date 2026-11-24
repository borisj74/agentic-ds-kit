"use client";

import { useState } from "react";
import { DataGrid } from "agentic-ds-kit";
import type { DataGridColumn, DataGridRow, DataGridTotal } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const CONDITIONS: DataGridColumn[] = [
  { key: "field", header: "Field" },
  {
    key: "condition",
    header: "Condition",
    type: "select",
    width: "12rem",
    options: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "greater_than", label: "Greater than" },
      { value: "is_any_of", label: "Is any of" },
      { value: "is_empty", label: "Is empty" },
    ],
  },
  { key: "value", header: "Value", placeholder: "Enter a value" },
];

const CONDITION_ROWS: DataGridRow[] = [
  { id: "1", field: "Plan name", condition: "equals", value: "Enterprise" },
  { id: "2", field: "Quantity", condition: "greater_than", value: "10" },
  { id: "3", field: "Region", condition: "is_any_of", value: "EU" },
];

const DATE_COLUMNS: DataGridColumn[] = [
  {
    key: "product",
    header: "Product",
    type: "select",
    options: [
      { value: "platform", label: "Platform" },
      { value: "addon", label: "Add-on" },
      { value: "support", label: "Support" },
    ],
  },
  { key: "start", header: "Start date", type: "date", placeholder: "Pick a date" },
  { key: "end", header: "End date", type: "date", placeholder: "Pick a date" },
];

const DATE_ROWS: DataGridRow[] = [
  { id: "t1", product: "platform", start: "2026-01-01", end: "2026-12-31" },
  { id: "t2", product: "support", start: "2026-04-01", end: "2027-03-31" },
];

const TAX_RATES = [
  { value: "vat20", label: "VAT 20%" },
  { value: "zero", label: "Zero-rated" },
];

/** INV-1887 for Northwind Traders: row 3 has a quantity that needs a fix. */
const LINE_COLUMNS: DataGridColumn[] = [
  { key: "description", header: "Description", placeholder: "Describe the line" },
  {
    key: "qty",
    header: "Qty",
    type: "number",
    width: "6rem",
    validate: (value) => (Number(value) >= 1 && Number.isInteger(Number(value)) ? undefined : "enter 1 or more"),
  },
  { key: "unit", header: "Unit price", type: "money", width: "8rem" },
  { key: "tax", header: "Tax", type: "select", options: TAX_RATES, width: "10rem" },
  {
    key: "amount",
    header: "Amount",
    type: "money",
    width: "8rem",
    compute: (row) => {
      const amount = Number(row.qty) * Number(row.unit);
      return Number.isFinite(amount) ? amount.toFixed(2) : "";
    },
  },
];

const LINE_ROWS: DataGridRow[] = [
  { id: "l1", description: "Business plan · Dec 2026", qty: "18", unit: "39.00", tax: "vat20" },
  { id: "l2", description: "AI credits pack · 5,000", qty: "1", unit: "180.00", tax: "vat20" },
  { id: "l3", description: "Onboarding workshop", qty: "-2", unit: "450.00", tax: "zero" },
  { id: "l4", description: "Extra storage · 50 GB", qty: "50", unit: "0.50", tax: "vat20" },
];

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/** Subtotal, VAT and Total from the valid rows only; DataGrid leaves invalid rows out. */
function invoiceTotals(valid: DataGridRow[]): DataGridTotal[] {
  const line = (row: DataGridRow) => Number(row.qty) * Number(row.unit) || 0;
  const subtotal = valid.reduce((sum, row) => sum + line(row), 0);
  const vat = valid.filter((row) => row.tax === "vat20").reduce((sum, row) => sum + line(row) * 0.2, 0);
  return [
    { label: "Subtotal", value: usd(subtotal) },
    { label: "VAT 20%", value: usd(vat) },
    { label: "Total", value: usd(subtotal + vat), emphasis: true, narrowLabel: "Total incl. VAT" },
  ];
}

const LINES_CODE = `<DataGrid
  label="INV-1887 lines"
  rowNumbers
  canAddRows
  canRemoveRows
  errorSummary
  columns={[
    { key: "description", header: "Description" },
    { key: "qty", header: "Qty", type: "number", validate: (v) => (Number(v) >= 1 ? undefined : "enter 1 or more") },
    { key: "unit", header: "Unit price", type: "money" },
    { key: "tax", header: "Tax", type: "select", options: taxRates },
    { key: "amount", header: "Amount", type: "money", compute: (row) => (Number(row.qty) * Number(row.unit)).toFixed(2) },
  ]}
  rows={lines}
  onRowsChange={setLines}
  totals={(valid) => [
    { label: "Subtotal", value: "$907.00" },
    { label: "VAT 20%", value: "$181.40" },
    { label: "Total", value: "$1,088.40", emphasis: true, narrowLabel: "Total incl. VAT" },
  ]}
/>`;

function InvoiceLines() {
  const [lines, setLines] = useState(LINE_ROWS);
  return (
    <DataGrid
      label="INV-1887 lines"
      rowNumbers
      canAddRows
      canRemoveRows
      errorSummary
      columns={LINE_COLUMNS}
      rows={lines}
      onRowsChange={setLines}
      totals={invoiceTotals}
    />
  );
}

const MASTER_CODE = `<DataGrid
  label="Conditions"
  columns={[
    { key: "field", header: "Field" },
    {
      key: "condition",
      header: "Condition",
      type: "select",
      options: conditions,
      width: "12rem",
    },
    { key: "value", header: "Value" },
  ]}
  rows={rules}
  onRowsChange={setRules}
  canAddRows
  canRemoveRows
/>`;

const DATES_CODE = `<DataGrid
  label="Terms"
  columns={[
    { key: "product", header: "Product", type: "select", options: products },
    { key: "start", header: "Start date", type: "date" },
    { key: "end", header: "End date", type: "date" },
  ]}
  defaultRows={terms}
/>`;

const EMPTY_CODE = `<DataGrid
  label="Conditions"
  columns={columns}
  defaultRows={[]}
  canAddRows
  emptyLabel="No rows yet."
/>`;

const NUMBERS_CODE = `<DataGrid
  label="Conditions"
  size="sm"
  rowNumbers
  stickyFirstColumn
  columns={columns}
  defaultRows={rows}
  canAddRows
  canRemoveRows
/>`;

const PREVIEW_FILL = { maxWidth: "100%" } as const;
const MASTER_LAYOUT = { gridTemplateColumns: "minmax(0, 1fr)" } as const;

export function DataGridDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [rows, setRows] = useState(CONDITION_ROWS);

  const masterGrid = (
    <DataGrid
      label="Conditions"
      columns={CONDITIONS}
      rows={rows}
      onRowsChange={setRows}
      canAddRows
      canRemoveRows
    />
  );

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>DataGrid</h2>
        <p className={styles.lede}>
          An editable table: people click a cell to add or change its content, like rule conditions,
          line items, or mappings. It validates cells, totals the valid rows, and stacks below
          30rem.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="datagrid-master">
        <div className={styles.masterHeader}>
          <h2 id="datagrid-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Click a cell or press Enter to edit. Condition is kit Select. Add and remove rows.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout} style={MASTER_LAYOUT}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  {masterGrid}
                </div>
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  DataGrid for in-place edits. Table for a short read-only list. DataTable for
                  search, filters, and selection. Do not put a Field and Input on every row.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Invoice lines: money, computed, validated, totals</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewPage}>
                  <InvoiceLines />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Qty is a number column and Unit price a money column: end-aligned, tabular
                  figures. Amount is computed and read-only. Qty −2 fails validate, so that cell
                  alone gets a danger ring and icon, its message is tied to it, Amount shows an em
                  dash and the row is left out of the totals. errorSummary counts the lines to fix.
                  Add row stays a ghost Button.
                </p>
              </div>
              <CodeBlock code={LINES_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Stacked below 30rem</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewSurface}>
                  <InvoiceLines />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Narrower than 30rem the grid stacks. Each line shows its description, the other
                  values and Amount, and opens to labelled fields. A line with an error starts open
                  with the message under the field. The footer keeps only the total, as Total incl.
                  VAT.
                </p>
              </div>
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Dates</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <DataGrid label="Terms" columns={DATE_COLUMNS} defaultRows={DATE_ROWS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Date columns use kit DatePicker. Values are YYYY-MM-DD. Product is kit Select.
                </p>
              </div>
              <CodeBlock code={DATES_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <DataGrid
                    label="Conditions"
                    columns={CONDITIONS}
                    defaultRows={[]}
                    canAddRows
                    emptyLabel="No rows yet."
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Headers stay. emptyLabel fills the body. Add row starts the first cell in edit.
                </p>
              </div>
              <CodeBlock code={EMPTY_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Row numbers</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <DataGrid
                    label="Conditions"
                    size="sm"
                    rowNumbers
                    stickyFirstColumn
                    columns={CONDITIONS}
                    defaultRows={CONDITION_ROWS}
                    canAddRows
                    canRemoveRows
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  rowNumbers adds a # column. stickyFirstColumn pins # and the first column when
                  the grid scrolls sideways.
                </p>
              </div>
              <CodeBlock code={NUMBERS_CODE} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
