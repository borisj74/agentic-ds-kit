/**
 * DataGrid line items: number and money columns, a computed read-only column, cell validation
 * that leaves invalid rows out of totals, the totals footer and the error summary. SSR through
 * the CSS stub. Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import { before, describe, test } from "node:test";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function load(url, context, next) {
  if (url.endsWith(".css")) return { format: "module", source: "", shortCircuit: true };
  return next(url, context);
}`),
);

let React;
let renderToStaticMarkup;
let DataGrid;
let logic;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ DataGrid } = await import("../dist/ui/DataGrid/DataGrid.js"));
  logic = await import("../dist/ui/DataGrid/dataGrid.logic.js");
});

const tax = [
  { value: "vat20", label: "VAT 20%" },
  { value: "zero", label: "Zero-rated" },
];

const columns = [
  { key: "description", header: "Description" },
  { key: "qty", header: "Qty", type: "number", validate: (v) => (Number(v) >= 1 ? undefined : "enter 1 or more") },
  { key: "unit", header: "Unit price", type: "money" },
  { key: "tax", header: "Tax", type: "select", options: tax },
  { key: "amount", header: "Amount", type: "money", compute: (row) => (Number(row.qty) * Number(row.unit)).toFixed(2) },
];

const rows = [
  { id: "1", description: "Business plan · Dec 2026", qty: "18", unit: "39", tax: "vat20" },
  { id: "2", description: "AI credits pack · 5,000", qty: "1", unit: "180", tax: "vat20" },
  { id: "3", description: "Onboarding workshop", qty: "-2", unit: "450", tax: "zero" },
  { id: "4", description: "Extra storage · 50 GB", qty: "50", unit: "0.50", tax: "vat20" },
];

const money = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function totals(valid) {
  const line = (row) => Number(row.qty) * Number(row.unit);
  const subtotal = valid.reduce((sum, row) => sum + line(row), 0);
  const vat = valid.filter((row) => row.tax === "vat20").reduce((sum, row) => sum + line(row) * 0.2, 0);
  return [
    { label: "Subtotal", value: money(subtotal) },
    { label: "VAT 20%", value: money(vat) },
    { label: "Total", value: money(subtotal + vat), emphasis: true, narrowLabel: "Total incl. VAT" },
  ];
}

const h = (props) =>
  renderToStaticMarkup(React.createElement(DataGrid, { label: "INV-1887 lines", columns, rows, ...props }));

describe("DataGrid logic", () => {
  test("money formats decimal strings in the currency; other text stays", () => {
    assert.equal(logic.formatMoney("39"), "$39.00");
    assert.equal(logic.formatMoney("1088.4"), "$1,088.40");
    assert.equal(logic.formatMoney("12", "EUR"), "€12.00");
    assert.equal(logic.formatMoney("n/a"), "n/a");
    assert.equal(logic.formatMoney(""), "");
  });

  test("validation finds the cell, and invalid rows drop out of the valid set", () => {
    assert.deepEqual(logic.cellErrors(columns, rows[2]), { qty: "enter 1 or more" });
    assert.deepEqual(rows.filter((row) => Object.keys(logic.cellErrors(columns, row)).length === 0).map((row) => row.id), ["1", "2", "4"]);
    assert.equal(logic.errorSummaryText(0), "");
    assert.equal(logic.errorSummaryText(1), "1 line needs a fix");
    assert.equal(logic.errorSummaryText(3), "3 lines need a fix");
  });

  test("computed cells work out the value, or an em dash on an invalid row", () => {
    const amount = columns[4];
    assert.equal(logic.cellText(amount, rows[0], true), "$702.00");
    assert.equal(logic.cellText(amount, rows[2], false), "—");
  });

  test("the stacked line joins the other values; messages carry the total note", () => {
    assert.equal(logic.stackedSummary(columns, rows[0]), "18 · $39.00 · VAT 20%");
    assert.equal(
      logic.cellMessage("Qty, row 3", "enter 1 or more", true),
      "Qty, row 3: enter 1 or more · left out of the total",
    );
    assert.equal(logic.cellMessage("Qty", "enter 1 or more", false), "Qty: enter 1 or more");
  });
});

describe("DataGrid rendered with line items", () => {
  test("the invalid cell alone is aria-invalid and described by its message", () => {
    const html = h({ totals });
    assert.equal((html.match(/aria-invalid="true"/g) ?? []).length, 1);
    const cell = html.match(/<button[^>]*aria-invalid="true"[^>]*>/)[0];
    assert.match(cell, /aria-label="Qty, row 3: -2"/);
    const describedBy = cell.match(/aria-describedby="([^"]+)"/)[1];
    const message = html.split(`id="${describedBy}"`)[1];
    assert.ok(message, "the message element exists");
    assert.ok(message.startsWith(`>Qty, row 3: enter 1 or more · left out of the total<`) || message.includes(">Qty, row 3: enter 1 or more · left out of the total<"));
  });

  test("Amount is read-only text: an em dash on the invalid row", () => {
    const html = h({ totals });
    assert.ok(html.includes("$702.00") && html.includes("$180.00") && html.includes("$25.00"));
    assert.ok(!/aria-label="Amount, row/.test(html), "computed cells are not buttons");
    assert.ok(html.includes(">—<"));
  });

  test("totals leave the invalid row out", () => {
    const html = h({ totals });
    assert.match(html, /<tfoot/);
    assert.match(html, /<th scope="row"[^>]*>Subtotal<\/th><td[^>]*>\$907\.00</);
    assert.ok(html.includes("$181.40") && html.includes("$1,088.40"));
  });

  test("errorSummary counts rows needing a fix", () => {
    assert.match(h({ errorSummary: true }), /role="status"[^>]*>.*1 line needs a fix<\/p>/);
    const fixed = rows.map((row) => (row.id === "3" ? { ...row, qty: "2" } : row));
    assert.match(h({ errorSummary: true, rows: fixed }), /role="status"[^>]*><\/p>/);
  });
});
