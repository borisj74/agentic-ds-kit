/**
 * BarList: a ranked list with a bar behind each label. Logic (sort, bar length, rows shown) and the
 * SSR render through the CSS stub. Runs against the built kit (dist): build first
 * (npm run build -w agentic-ds-kit).
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

const pages = [
  { label: "/careers", value: 640 },
  { label: "/pricing", value: 4820, href: "/a/pricing" },
  { label: "/docs/install", value: 3110 },
  { label: "/blog", value: 1960 },
  { label: "/legal", value: 0 },
  { label: "/changelog", value: 1960 },
];

let logic;
let React;
let renderToStaticMarkup;
let BarList;

before(async () => {
  logic = await import("../dist/ui/BarList/barList.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ BarList } = await import("../dist/ui/BarList/BarList.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(BarList, { data: pages, label: "Top pages", ...props }));
}

const labelsIn = (html) => [...html.matchAll(/<(?:a|span) class="[^"]*label[^"]*"[^>]*>([^<]+)</g)].map((m) => m[1]);

describe("BarList logic", () => {
  test("sorts descending by default, ascending on request, keeps data order for none; ties keep data order", () => {
    assert.deepEqual(logic.sortRows(pages).map((r) => r.label), ["/pricing", "/docs/install", "/blog", "/changelog", "/careers", "/legal"]);
    assert.deepEqual(logic.sortRows(pages, "ascending").map((r) => r.label), ["/legal", "/careers", "/blog", "/changelog", "/docs/install", "/pricing"]);
    assert.deepEqual(logic.sortRows(pages, "none").map((r) => r.label), pages.map((r) => r.label));
  });

  test("bar length is a share of the largest value; negative, NaN and an all-zero list draw no bar", () => {
    assert.equal(logic.barPercent(4820, 4820), 100);
    assert.equal(logic.barPercent(2410, 4820), 50);
    assert.equal(logic.barPercent(-5, 100), 0);
    assert.equal(logic.barPercent(Number.NaN, 100), 0);
    assert.equal(logic.barPercent(10, 0), 0);
  });

  test("rows shown: maxRows until open, everything without maxRows", () => {
    assert.equal(logic.visibleCount(8, 5, false), 5);
    assert.equal(logic.visibleCount(8, 5, true), 8);
    assert.equal(logic.visibleCount(8, undefined, false), 8);
    assert.equal(logic.visibleCount(3, 5, false), 3);
    assert.equal(logic.visibleCount(8, 2.7, false), 2);
  });
});

describe("BarList render", () => {
  test("a named ordered list, largest first, values as text, bars hidden from screen readers", () => {
    const html = render();
    assert.match(html, /<ol id="[^"]+"[^>]*aria-label="Top pages"/);
    assert.deepEqual(labelsIn(html), ["/pricing", "/docs/install", "/blog", "/changelog", "/careers", "/legal"]);
    for (const text of ["4,820", "3,110", "1,960", "640"]) assert.ok(html.includes(text), text);
    assert.match(html, /--barlist-length:100%/);
    assert.match(html, /<span class="[^"]*bar[^"]*" aria-hidden="true">/);
    assert.ok(!html.includes("Show all"), "no toggle without maxRows");
  });

  test("href makes the label a link; rows without href stay text", () => {
    const html = render();
    assert.match(html, /<a class="[^"]*" href="\/a\/pricing">\/pricing<\/a>/);
    assert.ok(!html.includes('href="undefined"'));
  });

  test("maxRows shows the top rows and a Show all button wired to the list", () => {
    const html = render({ maxRows: 3 });
    assert.deepEqual(labelsIn(html), ["/pricing", "/docs/install", "/blog"]);
    const listId = html.match(/<ol id="([^"]+)"/)[1];
    assert.match(html, new RegExp(`aria-expanded="false"[^>]*aria-controls="${listId}"|aria-controls="${listId}"[^>]*aria-expanded="false"`));
    assert.ok(html.includes("Show all 6"));
    assert.ok(!render({ maxRows: 6 }).includes("Show all"), "no toggle when everything already fits");
  });

  test("valueFormatter writes the value text; empty data says No data", () => {
    const html = render({ valueFormatter: (v) => `€${v}` });
    assert.ok(html.includes("€4820"));
    const empty = render({ data: [] });
    assert.ok(empty.includes("No data"));
    assert.ok(!empty.includes("<ol"));
  });
});
