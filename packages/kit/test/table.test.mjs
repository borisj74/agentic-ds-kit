/**
 * Table: sortable headers (click and keyboard), sortValue, stickyHeader, rowActions, state
 * (loading, empty, error with onRetry), opt-in stack, rowHref and Cell values in rows.
 * SSR for markup, jsdom for interaction. Runs against the built kit (dist); `npm test` builds first.
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

let JSDOM = null;
try {
  ({ JSDOM } = await import("jsdom"));
} catch {
  JSDOM = null;
}

let h;
let render;
let kit;

const COLUMNS = [
  { key: "customer", header: "Customer", sortable: true },
  { key: "status", header: "Status" },
  {
    key: "amount",
    header: "Amount",
    numeric: true,
    sortable: true,
    sortValue: (row) => Number(String(row.amount).replace(/[^0-9.]/g, "")),
  },
];

const ROWS = [
  { customer: "Northwind Traders", status: "Overdue", amount: "$12,450.00" },
  { customer: "Hooli", status: "Failed", amount: "$1,249.00" },
  { customer: "Initech", status: "Partly paid", amount: "$7,200.00" },
];

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  kit = {
    ...(await import("../dist/ui/Table/Table.js")),
    ...(await import("../dist/ui/Cell/Cell.js")),
  };
});

describe("Table markup", () => {
  test("unchanged API: no sort buttons, no actions column, no busy flag", () => {
    const html = render(h(kit.Table, { columns: [{ key: "a", header: "A" }], rows: [{ a: "x" }] }));
    assert.doesNotMatch(html, /<button/);
    assert.doesNotMatch(html, /aria-sort/);
    assert.doesNotMatch(html, /aria-busy/);
  });

  test("sortable columns get aria-sort=none and a header button", () => {
    const html = render(h(kit.Table, { columns: COLUMNS, rows: ROWS }));
    assert.equal((html.match(/aria-sort="none"/g) ?? []).length, 2);
    assert.match(html, /<button type="button"[^>]*><span>Customer<\/span><svg/);
    assert.match(html, /stroke-width="1.5"/);
  });

  test("rowActions adds a last column named per row", () => {
    const html = render(
      h(kit.Table, { columns: COLUMNS, rows: ROWS, rowActions: () => [{ label: "Send reminder" }] }),
    );
    assert.match(html, /aria-label="Actions for Northwind Traders"/);
    assert.match(html, /aria-label="Actions for Hooli"/);
    assert.match(html, /<th scope="col"[^>]*><span[^>]*>Actions<\/span><\/th>/);
  });

  test("state=loading keeps the header and marks the region busy", () => {
    const html = render(h(kit.Table, { columns: COLUMNS, rows: ROWS, state: "loading" }));
    assert.match(html, /aria-busy="true"/);
    assert.match(html, /<th[^>]*>.*Customer/);
    assert.doesNotMatch(html, /Northwind/);
  });

  test("state=empty and rows=[] show Empty with emptyLabel", () => {
    for (const props of [{ rows: ROWS, state: "empty" }, { rows: [] }]) {
      const html = render(h(kit.Table, { columns: COLUMNS, emptyLabel: "No invoices match these filters.", ...props }));
      assert.match(html, /role="status"/);
      assert.match(html, /No invoices match these filters\./);
      assert.match(html, /colSpan="3"|colspan="3"/);
    }
  });

  test("state=error shows LoadError with errorMessage and Try again", () => {
    const html = render(
      h(kit.Table, { columns: COLUMNS, rows: ROWS, state: "error", errorMessage: "Couldn’t load invoices.", onRetry() {} }),
    );
    assert.match(html, /role="alert"/);
    assert.match(html, /Couldn’t load invoices\./);
    assert.match(html, />Try again</);
  });

  test("errorMessage has a default", () => {
    const html = render(h(kit.Table, { columns: COLUMNS, rows: ROWS, state: "error" }));
    assert.match(html, /Couldn’t load this table\./);
  });

  test("rowHref links the first cell", () => {
    const html = render(h(kit.Table, { columns: COLUMNS, rows: ROWS, rowHref: (_row, i) => `/invoices/${i}` }));
    assert.match(html, /<a href="\/invoices\/0"[^>]*>Northwind Traders<\/a>/);
  });

  test("Cell values render in rows and name the row menu", () => {
    const rows = [{ customer: h(kit.Cell, { type: "text", label: "Acme Logistics" }), status: "Open", amount: "$9,600.00" }];
    const html = render(h(kit.Table, { columns: COLUMNS, rows, rowActions: () => [{ label: "Open" }] }));
    assert.match(html, /data-nistha="cell"|Acme Logistics/);
    assert.match(html, /aria-label="Actions for Acme Logistics"/);
  });
});

describe("Table interaction", { skip: JSDOM ? false : "jsdom is not installed" }, () => {
  test("clicking and pressing Enter on a sortable header cycles asc, desc, off", async () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
    const { window } = dom;
    for (const [k, v] of Object.entries({ window, document: window.document, navigator: window.navigator, HTMLElement: window.HTMLElement, Node: window.Node })) {
      Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
    }
    window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const React = await import("react");
    const { createRoot } = await import("react-dom/client");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await React.act(async () => root.render(h(kit.Table, { columns: COLUMNS, rows: ROWS })));

    const firstCells = () => [...container.querySelectorAll("tbody tr")].map((tr) => tr.querySelector("td").textContent);
    const amountTh = () => container.querySelectorAll("th")[2];
    const amountButton = amountTh().querySelector("button");

    await React.act(async () => amountButton.click());
    assert.equal(amountTh().getAttribute("aria-sort"), "ascending");
    assert.deepEqual(firstCells(), ["Hooli", "Initech", "Northwind Traders"], "sortValue sorts numbers, not strings");

    // A native button activates on Enter; jsdom does not synthesize the click, so fire what the browser would.
    amountButton.focus();
    assert.equal(document.activeElement, amountButton);
    await React.act(async () => {
      amountButton.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      amountButton.click();
    });
    assert.equal(amountTh().getAttribute("aria-sort"), "descending");
    assert.deepEqual(firstCells(), ["Northwind Traders", "Initech", "Hooli"]);

    await React.act(async () => amountButton.click());
    assert.equal(amountTh().getAttribute("aria-sort"), "none");
    assert.deepEqual(firstCells(), ["Northwind Traders", "Hooli", "Initech"], "third press restores the given order");
    assert.equal(document.activeElement, amountButton, "focus stays on the header button");

    await React.act(async () => root.unmount());
  });

  test("Try again calls onRetry", async () => {
    const React = await import("react");
    const { createRoot } = await import("react-dom/client");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    let calls = 0;
    await React.act(async () =>
      root.render(h(kit.Table, { columns: COLUMNS, rows: ROWS, state: "error", onRetry: () => (calls += 1) })),
    );
    const button = [...container.querySelectorAll("button")].find((b) => b.textContent === "Try again");
    await React.act(async () => button.click());
    assert.equal(calls, 1);
    await React.act(async () => root.unmount());
  });
});
