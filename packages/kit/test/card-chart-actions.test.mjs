/**
 * Header actions on charts (ChartFrame actions) and Card (icon-only, up to two), InsightCard rich
 * description, and ListView dot and meta. SSR through the CSS stub. Runs against the built kit
 * (dist): build first (npm run build -w agentic-ds-kit).
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

let h;
let React;
let kit;

before(async () => {
  React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  h = (type, props, ...children) => renderToStaticMarkup(React.createElement(type, props, ...children));
  kit = {
    LineChart: (await import("../dist/ui/LineChart/LineChart.js")).LineChart,
    Heatmap: (await import("../dist/ui/Heatmap/Heatmap.js")).Heatmap,
    Button: (await import("../dist/ui/Button/Button.js")).Button,
    Card: (await import("../dist/ui/Card/Card.js")).Card,
    InsightCard: (await import("../dist/ui/InsightCard/InsightCard.js")).InsightCard,
    ListView: (await import("../dist/ui/ListView/ListView.js")).ListView,
  };
});

const askButton = () => React.createElement(kit.Button, { appearance: "ghost", mode: "neutral", size: "sm", iconStart: "MessageCircle", ariaLabel: "Ask about Signups" });

describe("chart actions", () => {
  test("LineChart draws actions before the Table toggle", () => {
    const html = h(kit.LineChart, { title: "Signups", data: [{ label: "Mon", value: 3 }, { label: "Tue", value: 5 }], actions: askButton() });
    const ask = html.indexOf('aria-label="Ask about Signups"');
    const table = html.indexOf("<span>Table</span>");
    assert.ok(ask > 0 && table > ask);
  });

  test("actions alone still draw the header (no title, no table)", () => {
    const html = h(kit.LineChart, { data: [{ label: "Mon", value: 3 }], showTable: false, actions: askButton() });
    assert.match(html, /<figcaption/);
    assert.ok(!html.includes("<span>Table</span>"));
  });

  test("Heatmap passes actions through", () => {
    const html = h(kit.Heatmap, { title: "Retention", rows: ["Jan"], columns: ["M1"], data: [{ row: "Jan", column: "M1", value: 90 }], actions: askButton() });
    assert.match(html, /aria-label="Ask about Signups"/);
  });
});

describe("Card header actions", () => {
  test("icon-only action is a Button named by its label", () => {
    const html = h(kit.Card, { title: "Plan mix", headerAction: { label: "Ask about Plan mix", iconStart: "MessageCircle", iconOnly: true } }, "body");
    assert.match(html, /<button[^>]*aria-label="Ask about Plan mix"/);
    assert.ok(!html.includes(">Ask about Plan mix<"), "label is not visible text");
  });

  test("two actions render, a third is dropped", () => {
    const html = h(
      kit.Card,
      {
        title: "Accounts",
        headerAction: [
          { label: "Ask about Accounts", iconStart: "MessageCircle", iconOnly: true },
          { label: "View all", href: "/accounts" },
          { label: "Third" },
        ],
      },
      "body",
    );
    assert.match(html, /aria-label="Ask about Accounts"/);
    assert.match(html, /<a[^>]*href="\/accounts"[^>]*>View all<\/a>/);
    assert.ok(!html.includes("Third"));
  });

  test("a single action object still works", () => {
    assert.match(h(kit.Card, { title: "T", headerAction: { label: "Edit" } }, "b"), />Edit</);
  });
});

describe("InsightCard description node", () => {
  test("strong text renders inside the description", () => {
    const description = React.createElement(React.Fragment, null, "Net new revenue was ", React.createElement("strong", null, "$18.4k"), ".");
    const html = h(kit.InsightCard, { title: "This period", description });
    assert.match(html, /<p[^>]*>Net new revenue was <strong>\$18\.4k<\/strong>\.<\/p>/);
  });
});

describe("ListView dot and meta", () => {
  test("dot is a hidden leading mark; meta shows and joins the row name", () => {
    const html = h(kit.ListView, {
      label: "Changes",
      items: [{ id: "a", primary: "Refunds rose", secondary: "Three in one day", dot: "warning", meta: "2h ago" }],
    });
    assert.match(html, /<span class="[^"]*dotSlot[^"]*" aria-hidden="true"><span class="[^"]*dot-warning/);
    assert.match(html, />2h ago</);
    assert.match(html, /Refunds rose, Three in one day, 2h ago/);
  });

  test("icon wins over dot", () => {
    const html = h(kit.ListView, { label: "L", items: [{ id: "a", primary: "P", icon: "Bell", dot: "info" }] });
    assert.ok(!html.includes("dot-info"));
  });
});
