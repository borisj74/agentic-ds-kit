"use client";

import { useState } from "react";
import { DropdownMenu } from "agentic-ds-kit";
import { Table } from "agentic-ds-kit";
import type { TableColumn, TableSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

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

const ACTION_GROUPS = [
  {
    items: [
      { id: "view", label: "View" },
      { id: "copy", label: "Copy" },
      { id: "delete", label: "Delete" },
    ],
  },
];

const ACTION_COLUMNS: TableColumn[] = [
  { key: "product", header: "Product" },
  { key: "price", header: "Price", numeric: true, align: "end" },
  { key: "actions", header: "Actions" },
];

function ActionsMenu() {
  return (
    <DropdownMenu
      iconStart="MoreHorizontal"
      ariaLabel="Open menu"
      variant="tertiary"
      size="sm"
      align="end"
      groups={ACTION_GROUPS}
    />
  );
}

const ACTION_ROWS = [
  { product: "Wireless Mouse", price: "$29.99", actions: <ActionsMenu /> },
  { product: "Mechanical Keyboard", price: "$129.99", actions: <ActionsMenu /> },
  { product: "USB-C Hub", price: "$49.99", actions: <ActionsMenu /> },
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
        <h1 className={styles.heroTitle}>Table</h1>
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
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Size</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Size">
                    {SIZES.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.sizeTab} ${size === step ? styles.sizeTabActive : ""}`}
                        aria-pressed={size === step}
                        onClick={() => setSize(step)}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Caption sits under the grid; footer holds the total; Amount hugs the right edge.
                </p>
              </div>
              <CodeBlock code={masterCode(size)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Actions</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Table columns={ACTION_COLUMNS} rows={ACTION_ROWS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Put a kit DropdownMenu in the Actions cell. Rows accept nodes so the menu stays a
                  kit piece, not a new table cousin.
                </p>
              </div>
              <CodeBlock
                code={`<Table
  columns={[
    { key: "product", header: "Product" },
    { key: "price", header: "Price", numeric: true, align: "end" },
    { key: "actions", header: "Actions" },
  ]}
  rows={[
    {
      product: "Wireless Mouse",
      price: "$29.99",
      actions: (
        <DropdownMenu
          iconStart="MoreHorizontal"
          ariaLabel="Open menu"
          variant="tertiary"
          size="sm"
          align="end"
          groups={[{ items: [{ id: "view", label: "View" }, { id: "copy", label: "Copy" }, { id: "delete", label: "Delete" }] }]}
        />
      ),
    },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Table
                    caption={MASTER_CAPTION}
                    columns={MASTER_COLUMNS}
                    rows={[]}
                    emptyLabel="No results."
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  When there are no rows, one cell spans the columns and shows emptyLabel. Headers
                  stay so the table keeps its shape. Caption is optional and still sits under the
                  grid.
                </p>
              </div>
              <CodeBlock
                code={`<Table
  caption="A list of your recent invoices."
  emptyLabel="No results."
  columns={[
    { key: "invoice", header: "Invoice", emphasis: true },
    { key: "status", header: "Status" },
    { key: "method", header: "Method" },
    { key: "amount", header: "Amount", numeric: true, align: "end" },
  ]}
  rows={[]}
/>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
