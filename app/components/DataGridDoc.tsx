"use client";

import { useState } from "react";
import { DataGrid } from "agentic-ds-kit";
import type { DataGridColumn, DataGridRow } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

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
        <h1 className={styles.heroTitle}>DataGrid</h1>
        <p className={styles.lede}>
          An editable table: people click a cell to add or change its content, like rule conditions,
          line items, or mappings.
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
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  DataGrid for in-place edits. Table for a short read-only list. DataTable for
                  search, filters, and selection. Do not put a Field and Input on every row.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
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
