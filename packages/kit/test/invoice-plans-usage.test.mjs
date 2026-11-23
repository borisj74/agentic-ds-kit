/**
 * Invoice, plans and usage redesign: UsageMeter overage, InvoiceDocument estimate / period / onPay,
 * PricingPlans fit and its narrow TileGroup. Runs against the built kit (dist): build first.
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
let UsageMeter;
let InvoiceDocument;
let PricingPlans;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ UsageMeter } = await import("../dist/ui/UsageMeter/UsageMeter.js"));
  ({ InvoiceDocument } = await import("../dist/ui/InvoiceDocument/InvoiceDocument.js"));
  ({ PricingPlans } = await import("../dist/ui/PricingPlans/PricingPlans.js"));
});

const h = (type, props) => renderToStaticMarkup(React.createElement(type, props));

describe("UsageMeter", () => {
  test("warns from 0.8 by default", () => {
    assert.ok(h(UsageMeter, { title: "AI credits", used: 8000, limit: 10000 }).includes("Near limit"));
    assert.ok(!h(UsageMeter, { title: "AI credits", used: 7900, limit: 10000 }).includes("Near limit"));
  });

  test("past the limit it says Over limit, how far, and the overage in words", () => {
    const html = h(UsageMeter, {
      title: "AI credits",
      used: 11240,
      limit: 10000,
      overage: { rateLabel: "$4.00 per 100 credits", amount: "$49.60" },
    });
    for (const text of ["Over limit", "1,240 credits over the limit", "$4.00 per 100 credits", "$49.60 overage so far"]) {
      assert.ok(html.includes(text), text);
    }
  });

  test("exactly at the limit still says Limit reached", () => {
    assert.ok(h(UsageMeter, { title: "AI credits", used: 10000, limit: 10000 }).includes("Limit reached"));
  });
});

const BASE = {
  number: "INV-1842",
  to: "Northwind Traders",
  issuedOn: "1 Nov 2026",
  lines: [{ id: "a", description: "Business plan", quantity: 18, unitPrice: "$39.00", amount: "$702.00" }],
  subtotal: "$702.00",
  total: "$842.40",
};

describe("InvoiceDocument", () => {
  test("estimate: badge word, Estimated total, period, and no pay or record action", () => {
    const html = h(InvoiceDocument, { ...BASE, status: "estimate", period: "1–30 Nov 2026", onPay() {}, onRecordPayment() {} });
    for (const text of ["Estimate", "Estimated total", "Period", "1–30 Nov 2026", "Issues on"]) assert.ok(html.includes(text), text);
    assert.ok(!html.includes("Pay $842.40") && !html.includes("Record payment"));
  });

  test("onPay is the primary named with the total and wins over onRecordPayment", () => {
    const html = h(InvoiceDocument, { ...BASE, status: "issued", onPay() {}, onRecordPayment() {} });
    assert.ok(html.includes("Pay $842.40"));
    assert.ok(!html.includes("Record payment"));
  });

  test("lines keep Qty × Unit as a hidden second line for the narrow layout", () => {
    assert.ok(h(InvoiceDocument, { ...BASE, status: "issued" }).includes("18 × $39.00"));
  });
});

describe("PricingPlans", () => {
  const plans = [
    { id: "team", name: "Team", price: 24, features: ["3,000 credits"], fit: "Too small for 11,240" },
    { id: "business", name: "Business", price: 39, features: ["10,000 credits"], current: true },
    { id: "scale", name: "Scale", price: 59, features: ["25,000 credits"], fit: "Fits with 13,760 spare", recommended: true },
  ];
  const html = () => h(PricingPlans, { plans, interval: "month", onIntervalChange() {}, onSelect() {} });

  test("fit lines render; only the recommended card is highlighted and Current plan is a neutral word", () => {
    const out = html();
    assert.ok(out.includes("Fits with 13,760 spare") && out.includes("Too small for 11,240"));
    assert.equal((out.match(/_planHighlight_/g) ?? []).length, 1);
    assert.match(out, /_neutral_\w+[^>]*>Current plan</);
  });

  test("before it is measured (server render) the cards show, with one solid primary", () => {
    const out = html();
    assert.doesNotMatch(out, /aria-label="Plans"[^>]*role="radiogroup"|role="radiogroup"[^>]*aria-label="Plans"/);
    const solid = (out.match(/<button[^>]*class="[^"]*_solid_\w+[^"]*_primary_\w+/g) ?? []).length;
    assert.equal(solid, 1);
  });
});
