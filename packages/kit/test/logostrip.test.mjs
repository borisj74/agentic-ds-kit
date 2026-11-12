/**
 * LogoStrip block: logo keys, kinds, rows and directions (logic), and the SSR render (labelled
 * section, a named group of rows, each row read once with an inert copy, every logo named, links,
 * Pause / Play). Runs against the built kit (dist):
 * build first (npm run build -w agentic-ds-kit). CSS imports are stubbed.
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

let logic;
let React;
let renderToStaticMarkup;
let LogoStrip;

before(async () => {
  logic = await import("../dist/ui/LogoStrip/logoStrip.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ LogoStrip } = await import("../dist/ui/LogoStrip/LogoStrip.js"));
});

function mark() {
  return React.createElement("svg", { viewBox: "0 0 24 24" }, React.createElement("circle", { cx: 12, cy: 12, r: 10 }));
}

const logosFor = () => [
  { name: "Northpeak", src: "/logos/northpeak.svg" },
  { name: "Fieldstone", logo: mark() },
  { name: "Quarry", href: "/customers/quarry" },
];

describe("LogoStrip logic", () => {
  test("kinds: node wins over image, text when neither", () => {
    const items = logic.stripLogos([{ name: "A", src: "/a.svg", logo: "x" }, { name: "B", src: "/b.svg" }, { name: "C" }]);
    assert.deepEqual(items.map((i) => i.kind), ["node", "image", "text"]);
  });

  test("keys are unique; unnamed logos are dropped", () => {
    const items = logic.stripLogos([{ name: "Same" }, { name: "Same" }, { name: "  " }, { id: "x", name: "X" }]);
    assert.deepEqual(items.map((i) => i.key), ["Same", "Same-1", "x"]);
  });

  test("rows: dealt round-robin, never more rows than logos", () => {
    assert.deepEqual(logic.stripRows([1, 2, 3, 4, 5, 6, 7], 3), [[1, 4, 7], [2, 5], [3, 6]]);
    assert.deepEqual(logic.stripRows([1, 2], 5), [[1], [2]]);
    assert.deepEqual(logic.stripRows([], 3), [[]]);
    assert.deepEqual(logic.stripRows([1, 2, 3], 0), [[1, 2, 3]]);
  });

  test("neighbouring rows run in opposite directions; loops slow down with more logos", () => {
    assert.deepEqual([0, 1, 2, 3].map(logic.rowDirection), ["left", "right", "left", "right"]);
    assert.equal(logic.rowDuration(8), 32);
    assert.equal(logic.rowDuration(2), 20);
  });

  test("list label carries the count", () => {
    assert.equal(logic.listLabel("Customer logos", 8), "Customer logos, 8");
  });
});

describe("LogoStrip render", () => {
  const many = () => Array.from({ length: 9 }, (_, i) => ({ name: `Logo ${i + 1}` }));

  test("labelled section with h2 and a named group of rows", () => {
    const html = renderToStaticMarkup(React.createElement(LogoStrip, { logos: logosFor(), description: "From startups to public companies." }));
    const id = html.match(/^<section[^>]*aria-labelledby="([^"]+)"/)[1];
    assert.match(html, new RegExp(`<h2 id="${id}"[^>]*>Trusted by teams at</h2>`));
    assert.match(html, /role="group"[^>]*aria-label="Customer logos, 3"/);
    assert.match(html, /From startups to public companies\./);
  });

  test("three rows by default, each read once: the copy is aria-hidden and inert", () => {
    const html = renderToStaticMarkup(React.createElement(LogoStrip, { logos: many() }));
    assert.equal((html.match(/<ul/g) ?? []).length, 6);
    assert.equal((html.match(/<ul[^>]*aria-hidden="true"[^>]*inert=""/g) ?? []).length, 3);
    assert.equal((html.match(/--logostrip-duration/g) ?? []).length, 3);
    const two = renderToStaticMarkup(React.createElement(LogoStrip, { logos: many(), rows: 2 }));
    assert.equal((two.match(/<ul/g) ?? []).length, 4);
  });

  test("every logo has a name", () => {
    const html = renderToStaticMarkup(React.createElement(LogoStrip, { logos: logosFor(), rows: 1 }));
    assert.match(html, /<img[^>]*alt="Northpeak"/);
    assert.match(html, /role="img" aria-label="Fieldstone"/);
    assert.match(html, /<a[^>]*href="\/customers\/quarry"[^>]*>[\s\S]*?Quarry[\s\S]*?<\/a>/);
  });

  test("custom title and label", () => {
    const html = renderToStaticMarkup(React.createElement(LogoStrip, { logos: logosFor(), title: "Built with", label: "Partner logos", align: "start" }));
    assert.match(html, />Built with<\/h2>/);
    assert.match(html, /aria-label="Partner logos, 3"/);
  });

  test("Pause / Play is a pressed-state button; paused starts still", () => {
    const moving = renderToStaticMarkup(React.createElement(LogoStrip, { logos: logosFor() }));
    assert.match(moving, /<button[^>]*aria-pressed="false"[^>]*>[\s\S]*?Pause logos/);
    const still = renderToStaticMarkup(React.createElement(LogoStrip, { logos: logosFor(), defaultPaused: true }));
    assert.match(still, /<button[^>]*aria-pressed="true"[^>]*>[\s\S]*?Play logos/);
  });
});
