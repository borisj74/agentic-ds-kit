/**
 * LogoStrip block: logo keys and kinds (logic), and the SSR render (labelled section, a named
 * list inside the Conveyor group, every logo named, links). Runs against the built kit (dist):
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

  test("list label carries the count", () => {
    assert.equal(logic.listLabel("Customer logos", 8), "Customer logos, 8");
  });
});

describe("LogoStrip render", () => {
  test("labelled section with h2 and a named list in the Conveyor group", () => {
    const html = renderToStaticMarkup(React.createElement(LogoStrip, { logos: logosFor(), description: "From startups to public companies." }));
    const id = html.match(/^<section[^>]*aria-labelledby="([^"]+)"/)[1];
    assert.match(html, new RegExp(`<h2 id="${id}"[^>]*>Trusted by teams at</h2>`));
    assert.match(html, /role="group"[^>]*aria-label="Customer logos"/);
    assert.match(html, /<ul[^>]*aria-label="Customer logos, 3"/);
    assert.match(html, /From startups to public companies\./);
  });

  test("every logo has a name", () => {
    const html = renderToStaticMarkup(React.createElement(LogoStrip, { logos: logosFor() }));
    assert.match(html, /<img[^>]*src="\/logos\/northpeak.svg"[^>]*alt="Northpeak"|<img[^>]*alt="Northpeak"/);
    assert.match(html, /role="img" aria-label="Fieldstone"/);
    assert.match(html, /<a[^>]*href="\/customers\/quarry"[^>]*>[\s\S]*?Quarry[\s\S]*?<\/a>/);
    assert.equal((html.match(/<li/g) ?? []).length, 3);
  });

  test("custom title and label", () => {
    const html = renderToStaticMarkup(React.createElement(LogoStrip, { logos: logosFor(), title: "Built with", label: "Partner logos", align: "start" }));
    assert.match(html, />Built with<\/h2>/);
    assert.match(html, /aria-label="Partner logos, 3"/);
  });

  test("nothing moves on its own: no autoplay or animation attributes", () => {
    const html = renderToStaticMarkup(React.createElement(LogoStrip, { logos: logosFor() }));
    assert.doesNotMatch(html, /aria-live|autoplay|animation/i);
  });
});
