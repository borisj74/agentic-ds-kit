/**
 * UsageBilling: Upgrade on the plan card is the one solid primary (the UsageMeter's own Upgrade
 * stays off), names carry counts, and upgrade / download / manage payment reach the block's
 * props. Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit). CSS
 * imports are stubbed so the block renders on the server with react-dom/server.
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

const plan = { name: "Pro", price: "$49", priceNote: "per month", nextCharge: "$49.00 on 1 Dec", paymentMethod: "Visa ending 4242", upgradeTo: "Team" };
const allowance = { title: "AI credits", used: 9200, limit: 10000, unit: "credits", periodStart: "Nov 1", resetLabel: "resets Dec 1" };
const limits = [
  { id: "seats", label: "Seats", used: 5, limit: 5 },
  { id: "projects", label: "Projects", used: 8, limit: 20 },
  { id: "storage", label: "Storage", used: 41, limit: 50, unit: "GB" },
];
const invoices = [
  { id: "i5", number: "INV-0005", date: "1 Nov 2026", amount: "$49.00", status: "open" },
  { id: "i4", number: "INV-0004", date: "1 Oct 2026", amount: "$49.00", status: "paid" },
  { id: "i3", number: "INV-0003", date: "1 Sep 2026", amount: "$49.00", status: "paid" },
  { id: "i2", number: "INV-0002", date: "1 Aug 2026", amount: "$29.00", status: "overdue" },
  { id: "i1", number: "INV-0001", date: "1 Jul 2026", amount: "$29.00", status: "void" },
];

let logic;
let React;
let renderToStaticMarkup;
let UsageBilling;
let Card;
let ListView;
let UsageMeter;

before(async () => {
  logic = await import("../dist/ui/UsageBilling/usageBilling.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ UsageBilling } = await import("../dist/ui/UsageBilling/UsageBilling.js"));
  ({ Card } = await import("../dist/ui/Card/Card.js"));
  ({ ListView } = await import("../dist/ui/ListView/ListView.js"));
  ({ UsageMeter } = await import("../dist/ui/UsageMeter/UsageMeter.js"));
});

const base = { plan, allowance, limits, invoices };

function render(props) {
  return renderToStaticMarkup(React.createElement(UsageBilling, { ...base, ...props }));
}

/** Render once and return the block's own element tree, so tests can call its children's handlers. */
function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = UsageBilling({ ...base, ...props });
      return out;
    }),
  );
  return out;
}

function findAll(node, type, hits = []) {
  if (!node || typeof node !== "object") return hits;
  if (Array.isArray(node)) {
    for (const child of node) findAll(child, type, hits);
    return hits;
  }
  if (node.type === type) hits.push(node);
  findAll(node.props?.children, type, hits);
  return hits;
}

describe("UsageBilling logic", () => {
  test("limits near their allowance are counted", () => {
    assert.equal(logic.nearLimitCount(limits), 2);
    assert.equal(logic.limitsSummary(limits), "3 limits · 2 near their limit");
    assert.equal(logic.limitsSummary([limits[1]]), "1 limit · all within plan");
  });

  test("invoices become ListView rows with a status badge and a named Download", () => {
    const rows = logic.invoiceItems(invoices, 4);
    assert.equal(rows.length, 4);
    assert.deepEqual(rows.map((r) => r.badge), ["Open", "Paid", "Paid", "Overdue"]);
    assert.equal(rows[3].badgeTone, "danger");
    assert.equal(rows[0].secondary, "1 Nov 2026 · $49.00");
    assert.equal(rows[0].actions[0].label, "Download INV-0005");
  });

  test("upgrade label names the next plan", () => {
    assert.equal(logic.upgradeLabel("Team"), "Upgrade to Team");
    assert.equal(logic.upgradeLabel(undefined), "Upgrade plan");
  });
});

describe("UsageBilling rendered", () => {
  test("a labelled section with the parts", () => {
    const html = render({ onUpgrade() {}, onManagePayment() {} });
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"/);
    assert.match(html, /<h2[^>]*>Usage &amp; billing<\/h2>/);
    for (const text of ["AI credits", "Pro plan", "Visa ending 4242", "Other limits", "Recent invoices, 4 of 5", "Upgrade to Team", "Manage payment"]) {
      assert.ok(html.includes(text), text);
    }
    assert.ok(!html.includes("INV-0001"), "only invoiceLimit rows");
  });

  test("Upgrade on the plan card is the one solid primary; the meter's own is off", () => {
    const node = tree({ onUpgrade() {}, onManagePayment() {} });
    const primaries = findAll(node, Card).flatMap((card) => (card.props.actions ?? []).filter((a) => a.appearance === "solid" && a.mode === "primary"));
    assert.equal(primaries.length, 1);
    assert.equal(primaries[0].label, "Upgrade to Team");
    assert.equal(findAll(node, UsageMeter)[0].props.onUpgrade, undefined);
    // Over the meter's warn line, the meter would have drawn its own Upgrade plan.
    assert.ok(!render({ onUpgrade() {} }).includes("Upgrade plan"));
  });

  test("without onUpgrade there is no Upgrade", () => {
    assert.ok(!render().includes("Upgrade to Team"));
  });
});

describe("UsageBilling callbacks", () => {
  test("upgrade, manage payment and download reach the props", () => {
    const calls = [];
    const node = tree({
      onUpgrade: () => calls.push(["upgrade"]),
      onManagePayment: () => calls.push(["payment"]),
      onDownloadInvoice: (id) => calls.push(["download", id]),
    });
    const plan = findAll(node, Card)[0];
    for (const action of plan.props.actions) action.onClick();
    findAll(node, ListView)[0].props.onAction("i4", "download");
    assert.deepEqual(calls, [["payment"], ["upgrade"], ["download", "i4"]]);
  });
});

describe("UsageBilling in the catalog (MCP)", () => {
  test("list_components returns it as a Billing block", async () => {
    const { getComponent, listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "usagebilling");
    assert.equal(row?.name, "UsageBilling");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Billing");
    assert.equal(getComponent("UsageBilling").component.import, 'import { UsageBilling } from "agentic-ds-kit";');
  });
});
