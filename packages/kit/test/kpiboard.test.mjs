/**
 * KpiBoard: the range drives cards, chart and table; the Scorecards pick the charted metric and
 * say which one is picked; callbacks reach the block's props. Runs against the built kit (dist):
 * build first (npm run build -w agentic-ds-kit). CSS imports are stubbed so the block renders
 * on the server with react-dom/server.
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

const ranges = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

const metrics = [
  {
    id: "revenue",
    label: "Revenue",
    values: { "7d": { value: "$12.1k", delta: "+4%", trend: "up" }, "30d": { value: "$48.2k", delta: "+12%", trend: "up" } },
    columns: [
      { key: "name", header: "Customer" },
      { key: "amount", header: "Revenue", type: "number" },
    ],
    rowsTitle: "Top customers",
    rankBy: "amount",
  },
  {
    id: "signups",
    label: "Signups",
    values: { "7d": { value: "310" }, "30d": { value: "1,284" } },
    columns: [
      { key: "name", header: "Source" },
      { key: "count", header: "Signups", type: "number" },
    ],
    rowsTitle: "Top sources",
  },
  { id: "churn", label: "Churn", values: { "30d": { value: "1.2%", delta: "-0.3%", trend: "down" } }, columns: [{ key: "name", header: "Plan" }] },
];

const series = {
  revenue: { "7d": [{ label: "Mon", value: 1 }], "30d": [{ label: "W1", value: 10 }, { label: "W2", value: 12 }] },
  signups: { "30d": [{ label: "W1", value: 300 }] },
};

const rows = {
  revenue: {
    "30d": [
      { id: "a", name: "Northwind", amount: "$4,100" },
      { id: "b", name: "Globex", amount: "$9,800" },
      { id: "c", name: "Initech", amount: "$2,050" },
    ],
    "7d": [{ id: "d", name: "Umbrella", amount: "$900" }],
  },
  signups: { "30d": [{ id: "s1", name: "Search", count: 640 }] },
};

let logic;
let React;
let renderToStaticMarkup;
let KpiBoard;
let Scoreboard;
let SegmentedControl;

before(async () => {
  logic = await import("../dist/ui/KpiBoard/kpiBoard.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ KpiBoard } = await import("../dist/ui/KpiBoard/KpiBoard.js"));
  ({ Scoreboard } = await import("../dist/ui/Scoreboard/Scoreboard.js"));
  ({ SegmentedControl } = await import("../dist/ui/SegmentedControl/SegmentedControl.js"));
});

const base = { metrics, series, rows, ranges };

function render(props) {
  return renderToStaticMarkup(React.createElement(KpiBoard, { ...base, ...props }));
}

/** Render once and return the block's own element tree, so tests can call its children's handlers. */
function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = KpiBoard({ ...base, ...props });
      return out;
    }),
  );
  return out;
}

function find(node, type) {
  if (!node || typeof node !== "object") return undefined;
  if (Array.isArray(node)) {
    for (const child of node) {
      const hit = find(child, type);
      if (hit) return hit;
    }
    return undefined;
  }
  if (node.type === type) return node;
  return find(node.props?.children, type);
}

describe("KpiBoard logic", () => {
  test("range and metric fall back to the first", () => {
    assert.equal(logic.resolveRange(ranges, "nope").value, "7d");
    assert.equal(logic.resolveRange(ranges, "30d").value, "30d");
    assert.equal(logic.resolveMetric(metrics, undefined).id, "revenue");
    assert.equal(logic.resolveMetric(metrics, "churn").id, "churn");
  });

  test("cards follow the range; only the selected one carries the badge", () => {
    const cards = logic.cardsFor(metrics, ranges[1], "signups");
    assert.deepEqual(cards.map((c) => c.value), ["$48.2k", "1,284", "1.2%"]);
    assert.deepEqual(cards.map((c) => c.selected), [false, true, false]);
    assert.deepEqual(cards.map((c) => c.badge), [undefined, logic.SELECTED_BADGE, undefined]);
    assert.equal(cards[0].hint, "last 30 days");
    // A range with no entry for a metric shows a dash.
    assert.equal(logic.cardsFor(metrics, ranges[0], "revenue")[2].value, "—");
  });

  test("series and top rows are per metric and range", () => {
    assert.equal(logic.seriesFor(series, "revenue", "30d").length, 2);
    assert.deepEqual(logic.seriesFor(series, "churn", "30d"), []);
    assert.deepEqual(logic.topRows(rows, metrics[0], "30d", 2).map((r) => r.id), ["b", "a"]);
    assert.deepEqual(logic.topRows(rows, metrics[1], "30d", 5).map((r) => r.id), ["s1"]);
    assert.deepEqual(logic.topRows(rows, metrics[2], "30d", 5), []);
  });
});

describe("KpiBoard rendered", () => {
  test("a labelled section with a Range radio group", () => {
    const html = render();
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"/);
    assert.match(html, /<h2[^>]*>Key metrics<\/h2>/);
    assert.match(html, /role="radiogroup"[^>]*aria-label="Range"/);
  });

  test("Scorecards are toggle buttons; the selected one is pressed and named with its badge", () => {
    const html = render({ defaultSelectedMetric: "signups" });
    const pressed = html.match(/aria-pressed="true"/g) ?? [];
    const notPressed = html.match(/aria-pressed="false"/g) ?? [];
    assert.equal(pressed.length, 1);
    assert.equal(notPressed.length, 2);
    const button = html.match(/<button[^>]*aria-pressed="true"[^>]*>/)[0];
    const ids = button.match(/aria-labelledby="([^"]+)"/)[1].split(" ");
    assert.equal(ids.length, 3, "label, value and badge");
    assert.ok(html.includes(logic.SELECTED_BADGE));
  });

  test("the range changes the cards, the chart title and the table", () => {
    const week = render();
    const month = render({ range: "30d" });
    assert.ok(week.includes("$12.1k") && !week.includes("$48.2k"));
    assert.ok(month.includes("$48.2k"));
    assert.ok(week.includes("Revenue · 7 days") && month.includes("Revenue · 30 days"));
    assert.ok(week.includes("Top customers · 7 days") && week.includes("Umbrella") && !week.includes("Globex"));
    assert.ok(month.includes("Globex") && !month.includes("Umbrella"));
  });

  test("the selected metric drives chart and table", () => {
    const html = render({ range: "30d", selectedMetric: "signups" });
    assert.ok(html.includes("Signups · 30 days"));
    assert.ok(html.includes("Top sources · 30 days") && html.includes("Search"));
    assert.ok(!html.includes("Northwind"));
  });
});

describe("KpiBoard callbacks", () => {
  test("picking a card and a range reach the props", () => {
    const calls = [];
    const node = tree({ onSelectedMetricChange: (id) => calls.push(["metric", id]), onRangeChange: (r) => calls.push(["range", r]) });
    find(node, Scoreboard).props.items[2].onClick();
    find(node, SegmentedControl).props.onChange("30d");
    assert.deepEqual(calls, [
      ["metric", "churn"],
      ["range", "30d"],
    ]);
  });
});

describe("KpiBoard in the catalog (MCP)", () => {
  test("list_components returns it as an Analytics block", async () => {
    const { getComponent, listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "kpiboard");
    assert.equal(row?.name, "KpiBoard");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Analytics");
    assert.equal(getComponent("KpiBoard").component.import, 'import { KpiBoard } from "agentic-ds-kit";');
  });
});
