/**
 * ListView value, group total and selected row. SSR render through the CSS stub. Runs against the
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

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ListView } = await import("../dist/ui/ListView/ListView.js"));
});

const items = [
  { id: "a", primary: "Pinecrest Clinics", secondary: "INV-1821 · due Nov 1", value: "$14,700.00", meta: "20 days late", group: "nov" },
  { id: "b", primary: "Northwind Traders", secondary: "INV-1842 · due Nov 4", value: "$2,418.00", badge: "Overdue", group: "nov" },
  { id: "c", primary: "Kettle Analytics", secondary: "INV-1838 · due Nov 8", meta: "2h ago", group: "dec" },
];
const groups = [
  { id: "nov", label: "November", total: "$17,118.00" },
  { id: "dec", label: "December" },
];

function render(props) {
  return renderToStaticMarkup(React.createElement(ListView, { label: "Invoices", items, groups, ...props }));
}

describe("ListView value", () => {
  test("renders the value text on the row", () => {
    const html = render();
    assert.match(html, />\$14,700\.00</);
    assert.match(html, />\$2,418\.00</);
  });

  test("the row name reads primary, secondary, value, meta, then badge", () => {
    const html = render();
    assert.ok(html.includes('aria-label="Pinecrest Clinics, INV-1821 · due Nov 1, $14,700.00, 20 days late"'));
    assert.ok(html.includes('aria-label="Northwind Traders, INV-1842 · due Nov 4, $2,418.00, Overdue"'));
  });

  test("a row without value keeps its name and meta as before", () => {
    const html = render();
    assert.ok(html.includes('aria-label="Kettle Analytics, INV-1838 · due Nov 8, 2h ago"'));
  });
});

describe("ListView group total", () => {
  test("the total renders inside the header that labels the group", () => {
    const html = render();
    const header = html.match(/<div id="([^"]+)"[^>]*>(?:(?!<\/div>).)*November(?:(?!<\/div>).)*<\/div>/);
    assert.ok(header, "group header found");
    assert.match(header[0], /\$17,118\.00/);
    assert.ok(html.includes(`aria-labelledby="${header[1]}"`));
  });

  test("a group without total renders only its label", () => {
    const html = render();
    const header = html.match(/<div id="[^"]+"[^>]*>(?:(?!<\/div>).)*December(?:(?!<\/div>).)*<\/div>/);
    assert.ok(header);
    assert.doesNotMatch(header[0], /\$/);
  });

  test("a collapsible header keeps the total inside the button", () => {
    const html = render({ collapsibleGroups: true });
    const button = html.match(/<button[^>]*aria-expanded[^>]*>(?:(?!<\/button>).)*November(?:(?!<\/button>).)*<\/button>/);
    assert.ok(button);
    assert.match(button[0], /\$17,118\.00/);
  });
});

describe("ListView selected row", () => {
  test("single selection marks the row selected for the edge style", () => {
    const html = render({ selection: "single", defaultSelected: ["b"] });
    assert.match(html, /aria-selected="true"[^>]*>(?:(?!role=).)*data-selected="true"/);
    assert.equal((html.match(/data-selected="true"/g) ?? []).length, 1);
  });
});
