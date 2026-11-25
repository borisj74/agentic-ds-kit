/**
 * ListView flush rows, metaTone/iconTone, and SegmentedControl fullWidth. SSR render; runs against the
 * built kit (dist): build first (npm run build -w agentic-ds-kit).
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
let ListView;
let SegmentedControl;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ListView } = await import("../dist/ui/ListView/ListView.js"));
  ({ SegmentedControl } = await import("../dist/ui/SegmentedControl/SegmentedControl.js"));
});

const items = [
  { id: "a", primary: "Pinecrest Clinics", value: "$14,700.00", meta: "20 days late", metaTone: "danger" },
  { id: "b", primary: "Kettle Analytics", value: "$6,540.00", meta: "Open" },
  { id: "c", primary: "Automatic retry declined", icon: "CircleX", iconTone: "danger", meta: "Nov 7" },
  { id: "d", primary: "Reminder sent", icon: "Mail", meta: "Nov 8" },
];

function list(props) {
  return renderToStaticMarkup(React.createElement(ListView, { label: "Invoices", items, ...props }));
}

const rootClass = (html) => html.match(/^<div[^>]*class="([^"]+)"/)[1];

describe("ListView flush", () => {
  test("flush adds one class to the root; off by default", () => {
    const off = rootClass(list()).split(" ");
    const on = rootClass(list({ flush: true })).split(" ");
    const added = on.filter((c) => !off.includes(c));
    assert.equal(added.length, 1);
    assert.match(added[0], /flush/);
  });

  test("a flush selected row still sets aria-selected", () => {
    const html = list({ flush: true, selection: "single", selected: ["a"] });
    assert.match(html, /role="option"[^>]*aria-label="Pinecrest Clinics[^"]*"[^>]*aria-selected="true"/);
  });
});

describe("ListView metaTone and iconTone", () => {
  test("danger meta keeps its words and gets the danger class; neutral meta does not", () => {
    const html = list();
    const late = html.match(/<span class="([^"]+)">20 days late<\/span>/);
    const open = html.match(/<span class="([^"]+)">Open<\/span>/);
    assert.ok(late && open);
    assert.match(late[1], /danger/);
    assert.doesNotMatch(open[1], /danger/);
  });

  test("the meta words stay in the row name", () => {
    assert.ok(list().includes('aria-label="Pinecrest Clinics, $14,700.00, 20 days late"'));
  });

  test("danger icon tone lands on the leading slot only for that row", () => {
    const html = list();
    const leads = [...html.matchAll(/<span class="([^"]*leading[^"]*)" aria-hidden="true"><svg/g)].map((m) => m[1]);
    assert.equal(leads.length, 2);
    assert.match(leads[0], /danger/);
    assert.doesNotMatch(leads[1], /danger/);
  });
});

describe("SegmentedControl fullWidth", () => {
  const segs = [
    { value: "all", label: "All 48" },
    { value: "overdue", label: "Overdue 14" },
  ];
  const seg = (props) =>
    renderToStaticMarkup(React.createElement(SegmentedControl, { ariaLabel: "Show invoices", items: segs, ...props }));

  test("fullWidth adds one class to the radiogroup; off by default", () => {
    const off = rootClass(seg()).split(" ");
    const on = rootClass(seg({ fullWidth: true })).split(" ");
    const added = on.filter((c) => !off.includes(c));
    assert.equal(added.length, 1);
    assert.match(added[0], /fullWidth/);
    assert.match(seg({ fullWidth: true }), /role="radiogroup"/);
  });
});

describe("ListView size lg", () => {
  test("lg sets its own size class on the root", () => {
    const md = rootClass(list()).split(" ");
    const lg = rootClass(list({ size: "lg" })).split(" ");
    assert.ok(lg.some((c) => /^_?lg/.test(c) || c.startsWith("lg")), lg.join(" "));
    assert.ok(!md.some((c) => c.startsWith("lg")));
  });
});
