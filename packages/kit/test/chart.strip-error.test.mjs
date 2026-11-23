/**
 * LineChart and ComboChart: the change-strip helpers (signed format, last finite point), and the frame
 * states in SSR (error row with Retry replaces the plot, loading sets aria-busy, empty label, the strip's
 * legend item and table column). The plot itself draws after the browser measures the width, so SSR
 * covers the frame. Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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
let LineChart;
let ComboChart;

before(async () => {
  logic = await import("../dist/ui/LineChart/lineChart.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ LineChart } = await import("../dist/ui/LineChart/LineChart.js"));
  ({ ComboChart } = await import("../dist/ui/ComboChart/ComboChart.js"));
});

const labels = ["Nov 18", "Nov 19", "Nov 20"];
const mrr = [408000, 407300, 412600];
const net = [700, -700, 5300];

describe("LineChart change strip helpers", () => {
  test("formatSigned uses + and a real minus sign", () => {
    assert.equal(logic.formatSigned(1200), "+1,200");
    assert.equal(logic.formatSigned(-1600), "−1,600");
    assert.equal(logic.formatSigned(0), "0");
    assert.equal(logic.formatSigned(Number.NaN), "—");
  });

  test("lastFiniteIndex skips trailing gaps", () => {
    assert.equal(logic.lastFiniteIndex([1, 2, 3]), 2);
    assert.equal(logic.lastFiniteIndex([1, 2, undefined, Number.NaN]), 1);
    assert.equal(logic.lastFiniteIndex([]), -1);
  });
});

describe("LineChart frame", () => {
  const render = (props) =>
    renderToStaticMarkup(
      React.createElement(LineChart, { title: "MRR", labels, series: [{ label: "MRR", data: mrr }], ...props }),
    );

  test("changeStrip adds a legend item and its height under the plot", () => {
    const html = render({ highlightLast: true, changeStrip: { label: "Net change per day", data: net } });
    assert.match(html, /<li><span[^>]*><span[^>]*><\/span><span>Net change per day<\/span><\/span><\/li>/);
    assert.match(html, /height="312"/);
    assert.match(render(), /height="240"/);
  });

  test("error replaces the plot with an alert and Retry", () => {
    const html = render({ error: "Stripe didn't answer in time.", onRetry: () => undefined });
    assert.match(html, /role="alert"/);
    assert.match(html, /Stripe didn(&#x27;|')t answer in time\./);
    assert.match(html, /Retry/);
    assert.doesNotMatch(html, /<svg[^>]*role="group"/);
  });

  test("loading sets aria-busy", () => {
    assert.match(render({ isLoading: true }), /aria-busy="true"/);
  });
});

describe("ComboChart dual axis", () => {
  test("lineExtentOf fits the line without forcing zero", async () => {
    const combo = await import("../dist/ui/ComboChart/comboChart.logic.js");
    const rows = labels.map((label, index) => ({ label, mrr: mrr[index] }));
    assert.deepEqual(combo.lineExtentOf(rows, "mrr"), [407300, 412600]);
    assert.deepEqual(combo.lineExtentOf([{ label: "a", mrr: 5 }], "mrr"), [4, 6]);
    assert.deepEqual(combo.lineExtentOf([], "mrr"), [0, 1]);
  });
});

describe("ComboChart frame states", () => {
  const data = labels.map((label, index) => ({ label, change: net[index], mrr: mrr[index] }));
  const render = (props) =>
    renderToStaticMarkup(
      React.createElement(ComboChart, {
        title: "MRR movement",
        data,
        bars: [{ key: "change", label: "Net change per day" }],
        line: { key: "mrr", label: "MRR" },
        ...props,
      }),
    );

  test("error shows the alert row with Retry", () => {
    const html = render({ error: "Stripe didn't answer in time.", onRetry: () => undefined });
    assert.match(html, /role="alert"/);
    assert.match(html, /Retry/);
  });

  test("loading sets aria-busy; emptyLabel replaces the default text", () => {
    assert.match(render({ isLoading: true }), /aria-busy="true"/);
    const empty = render({ data: [], emptyLabel: "No changes yet" });
    assert.match(empty, /No changes yet/);
    assert.doesNotMatch(empty, /No data for this range/);
  });
});
