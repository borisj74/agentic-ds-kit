/**
 * A chart directly in a Card body drops its own frame, the way DataTable does in a flush Card.
 * ChartFrame marks a framed chart with data-kit-frame="chart"; Card's CSS keys on it.
 * SSR through the CSS stub. Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

let h;
let React;
let kit;

before(async () => {
  React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  h = (type, props, ...children) => renderToStaticMarkup(React.createElement(type, props, ...children));
  kit = {
    LineChart: (await import("../dist/ui/LineChart/LineChart.js")).LineChart,
    BarChart: (await import("../dist/ui/BarChart/BarChart.js")).BarChart,
    Card: (await import("../dist/ui/Card/Card.js")).Card,
  };
});

const data = [
  { label: "Mon", value: 3 },
  { label: "Tue", value: 5 },
];
const figureTag = (html) => html.match(/<figure[^>]*>/)?.[0] ?? "";

describe("ChartFrame frame hook", () => {
  test("a chart with a title is marked as a framed chart", () => {
    assert.match(figureTag(h(kit.LineChart, { title: "Signups", data })), /data-kit-frame="chart"/);
  });

  test("the Table toggle alone marks it (no title)", () => {
    assert.match(figureTag(h(kit.LineChart, { data })), /data-kit-frame="chart"/);
  });

  test("a bare chart (no title, legend, actions or table) is not marked", () => {
    assert.doesNotMatch(figureTag(h(kit.LineChart, { data, showTable: false })), /data-kit-frame/);
  });

  test("other ChartFrame charts carry it too", () => {
    assert.match(figureTag(h(kit.BarChart, { title: "Orders", data })), /data-kit-frame="chart"/);
  });

  test("in a Card the chart sits directly in the body", () => {
    const html = h(kit.Card, { title: "Revenue" }, React.createElement(kit.LineChart, { title: "MRR", data }));
    assert.match(html, /<div[^>]*>\s*<figure[^>]*data-kit-frame="chart"/);
  });
});

describe("Card CSS drops the chart frame", () => {
  const css = readFileSync(new URL("../ui/Card/Card.module.css", import.meta.url), "utf8");
  const rule = (selector) => {
    const start = css.indexOf(`${selector} {`);
    assert.ok(start >= 0, `missing rule ${selector}`);
    return css.slice(start, css.indexOf("}", start));
  };

  test("any Card: no border, radius, fill or shadow", () => {
    const body = rule('.body > [data-kit-frame="chart"]');
    for (const decl of ["border: 0", "border-radius: 0", "background: none", "box-shadow: none"]) {
      assert.ok(body.includes(decl), decl);
    }
  });

  test("padded Card: the card padding is the inset", () => {
    assert.match(rule('.card:not(.flush) .body > [data-kit-frame="chart"]'), /padding: 0/);
  });

  test("flush Card: the chart takes the card inset", () => {
    assert.match(rule('.flush .body > [data-kit-frame="chart"]'), /padding: var\(--card-spacing\)/);
  });
});
