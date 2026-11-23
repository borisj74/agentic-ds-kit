/**
 * ChangeSummary: summary sentence, groupBy "sentiment", per-row why, onAsk and the quiet-month state.
 * Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

const items = [
  { id: "mrr", label: "MRR", before: "$372.1k", after: "$412.6k", delta: "+10.9%", direction: "up", sentiment: "good", why: "Upgrades from Growth to Scale" },
  { id: "starter", label: "Starter churn", before: "2.4%", after: "4.8%", delta: "+2.4 pt", direction: "up", sentiment: "bad" },
  { id: "trial", label: "Trial conversion", before: "22%", after: "22%", delta: "0 pt", direction: "flat" },
  { id: "churn", label: "Churn rate", before: "2.6%", after: "2.1%", delta: "−0.5 pt", direction: "down", sentiment: "good" },
];

let React;
let renderToStaticMarkup;
let ChangeSummary;
let groupBySentiment;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ChangeSummary } = await import("../dist/ui/ChangeSummary/ChangeSummary.js"));
  ({ groupBySentiment } = await import("../dist/ui/ChangeSummary/changeSummary.logic.js"));
});

const render = (props) => renderToStaticMarkup(React.createElement(ChangeSummary, { items, ...props }));

describe("ChangeSummary", () => {
  test("groupBySentiment: Better, Worse, Steady in order, item order kept, missing sentiment is neutral, empty groups dropped", () => {
    const groups = groupBySentiment(items);
    assert.deepEqual(groups.map((g) => g.label), ["Better", "Worse", "Steady"]);
    assert.deepEqual(groups[0].items.map((i) => i.id), ["mrr", "churn"]);
    assert.deepEqual(groupBySentiment(items.slice(0, 1)).map((g) => g.label), ["Better"]);
  });

  test("flat list by default; groupBy sentiment renders an h4 per group with its count", () => {
    assert.ok(!render().includes("<h4"));
    const html = render({ groupBy: "sentiment" });
    assert.equal((html.match(/<h4/g) ?? []).length, 3);
    assert.match(html, /Better<span[^>]*>2<\/span>/);
  });

  test("why shows under the values and joins the spoken sentence", () => {
    const html = render();
    assert.match(html, /MRR up \+10\.9%, good\. \$372\.1k to \$412\.6k\. Upgrades from Growth to Scale\./);
    assert.match(html, /Starter churn up \+2\.4 pt, bad\. 2\.4% to 4\.8%\.</);
  });

  test("summary leads; onViewAll and onAsk render kit Buttons", () => {
    const html = render({ summary: "A strong month.", onViewAll() {}, onAsk() {} });
    assert.ok(html.indexOf("A strong month.") < html.indexOf("MRR"));
    assert.match(html, /View full report/);
    assert.match(html, /Ask in Chat/);
    assert.equal((html.match(/<button/g) ?? []).length, 2);
  });

  test("quiet month: summary with no items shows the summary, not Empty; no items and no summary shows Empty", () => {
    const quiet = render({ items: [], summary: "No metric moved more than 2%.", period: "Oct → Nov", onAsk() {} });
    assert.match(quiet, /No metric moved more than 2%\./);
    assert.ok(!quiet.includes("Nothing to compare yet"));
    assert.match(quiet, /Oct → Nov/);
    assert.match(quiet, /Ask in Chat/);
    assert.match(render({ items: [] }), /Nothing to compare yet/);
  });

  test("loading is aria-busy and hides summary and actions", () => {
    const html = render({ loading: true, summary: "A strong month.", onAsk() {} });
    assert.match(html, /aria-busy="true"/);
    assert.ok(!html.includes("A strong month."));
    assert.ok(!html.includes("Ask in Chat"));
  });
});
