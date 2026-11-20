/**
 * Scorecard looks: reference and expressive sparklines, and the meter. SSR through the CSS stub.
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

let React;
let renderToStaticMarkup;
let Scorecard;
let Scoreboard;
let sparklineLayout;
let meterState;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ Scorecard } = await import("../dist/ui/Scorecard/Scorecard.js"));
  ({ Scoreboard } = await import("../dist/ui/Scoreboard/Scoreboard.js"));
  ({ sparklineLayout, meterState } = await import("../dist/ui/Scorecard/scorecardVisual.logic.js"));
});

const h = (type, props) => renderToStaticMarkup(React.createElement(type, props));
const base = { label: "MRR", value: "$412.6k", hint: "vs previous 3 months" };
const data = [370, 380, 390, 400, 410];

describe("sparklineLayout", () => {
  test("shares one scale with the reference and spans the box", () => {
    const layout = sparklineLayout(data, { reference: 430 });
    assert.equal(layout.points[0].x, 0);
    assert.equal(layout.points.at(-1).x, 100);
    // The reference is the highest value, so it sits above the line's last point.
    assert.ok(layout.referenceY < layout.points.at(-1).y);
    assert.match(layout.area, /Z$/);
  });

  test("needs two finite values; compare needs two too", () => {
    assert.equal(sparklineLayout([1, Number.NaN]), null);
    assert.equal(sparklineLayout(data, { compare: [1] }).compareLine, null);
    assert.ok(sparklineLayout(data, { compare: [1, 2, 3] }).compareLine);
  });

  test("smooth draws curves", () => {
    assert.match(sparklineLayout(data, { smooth: true }).line, / C /);
    assert.doesNotMatch(sparklineLayout(data).line, / C /);
  });
});

describe("meterState", () => {
  test("percent of max, over-limit only for lower", () => {
    assert.deepEqual(meterState({ value: 2.1, max: 3, label: "x", direction: "lower" }), { percent: 70, overLimit: false });
    assert.deepEqual(meterState({ value: 3.6, max: 3, label: "x", direction: "lower" }), { percent: 120, overLimit: true });
    assert.deepEqual(meterState({ value: 495, max: 450, label: "x" }), { percent: 110, overLimit: false });
    assert.equal(meterState({ value: 1, max: 0, label: "x" }), null);
    assert.equal(meterState(undefined), null);
  });
});

describe("Scorecard looks", () => {
  test("plain stays the default polyline", () => {
    const html = h(Scorecard, { ...base, sparkline: data });
    assert.match(html, /<polyline/);
    assert.doesNotMatch(html, /linearGradient/);
  });

  test("reference draws area, reference label, dots and dates", () => {
    const html = h(Scorecard, {
      ...base,
      sparkline: data,
      sparklineVariant: "reference",
      reference: { value: 395, label: "Target $395k" },
      highlightLast: 2,
      sparklineDates: ["Aug 28", "Nov 20"],
    });
    assert.match(html, /linearGradient/);
    assert.match(html, /Target \$395k/);
    assert.equal((html.match(/_highlightDot_/g) ?? []).length, 2);
    assert.match(html, /Aug 28/);
    assert.match(html, /Nov 20/);
    assert.doesNotMatch(html, /<polyline/);
  });

  test("reference drawing is aria-hidden", () => {
    const html = h(Scorecard, { ...base, sparkline: data, sparklineVariant: "reference" });
    assert.match(html, /<span class="_visual_[^"]*" aria-hidden="true">/);
  });

  test("expressive shows the end tag and a legend only with compare", () => {
    const plain = h(Scorecard, { ...base, sparkline: data, sparklineVariant: "expressive" });
    assert.match(plain, /_endTag_[^>]*>\$412\.6k</);
    assert.doesNotMatch(plain, /This period/);
    const withCompare = h(Scorecard, { ...base, sparkline: data, sparklineVariant: "expressive", compare: [360, 365, 370, 372, 380] });
    assert.match(withCompare, /This period/);
    assert.match(withCompare, /Previous/);
    assert.match(withCompare, /_compareLine_/);
  });

  test("too little data falls back to no drawing", () => {
    const html = h(Scorecard, { ...base, sparkline: [1], sparklineVariant: "expressive" });
    assert.doesNotMatch(html, /<svg/);
    assert.doesNotMatch(html, /_stacked_/);
  });

  test("meter composes kit Meter, replaces the line, and names the progressbar", () => {
    const html = h(Scorecard, {
      ...base,
      label: "Churn rate",
      sparkline: data,
      meter: { value: 2.1, max: 3, label: "under 3.0% limit", direction: "lower" },
    });
    assert.match(html, /role="progressbar"/);
    assert.match(html, /aria-label="Churn rate, under 3.0% limit"/);
    assert.match(html, /aria-valuenow="70"/);
    assert.match(html, />70%</);
    assert.doesNotMatch(html, /<polyline/);
    assert.match(html, /_fillNeutral_/);
  });

  test("meter over its limit turns warning", () => {
    const html = h(Scorecard, { ...base, meter: { value: 3.6, max: 3, label: "over 3.0% limit", direction: "lower" } });
    assert.match(html, /_fill_[^"]* _warning_/);
  });
});

describe("Scoreboard passes looks through", () => {
  test("each item keeps its own look", () => {
    const html = h(Scoreboard, {
      items: [
        { label: "MRR", value: "1", sparkline: data, sparklineVariant: "reference" },
        { label: "Churn", value: "2", meter: { value: 1, max: 2, label: "of 2" } },
        { label: "Users", value: "3", sparkline: data },
      ],
    });
    assert.match(html, /linearGradient/);
    assert.match(html, /role="progressbar"/);
    assert.match(html, /<polyline/);
  });
});
