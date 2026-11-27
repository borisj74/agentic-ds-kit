/**
 * TraceWaterfall narrow layout: under 40rem of card width the label and the two numbers share one line
 * and the bar takes the full width below, so bars stay readable and nothing scrolls sideways.
 * jsdom has no container queries, so this reads the built stylesheet and checks the row markup order.
 * Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

const css = readFileSync(new URL("../dist/ui/TraceWaterfall/TraceWaterfall.kit.css", import.meta.url), "utf8");

/** The body of the narrow container query, braces balanced. */
function narrowBlock() {
  const start = css.indexOf("@container tracewaterfall (max-width: 40rem)");
  assert.ok(start >= 0, "narrow container query exists");
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error("unbalanced narrow block");
}

const rule = (block, cls) => {
  const match = block.match(new RegExp(`\\._${cls}_[a-z0-9]+_\\d+\\s*\\{([^}]*)\\}`));
  return match ? match[1] : "";
};

let React;
let renderToStaticMarkup;
let TraceWaterfall;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ TraceWaterfall } = await import("../dist/ui/TraceWaterfall/TraceWaterfall.js"));
});

describe("TraceWaterfall narrow layout", () => {
  test("the card is the tracewaterfall inline-size container", () => {
    assert.match(css, /\._card_[a-z0-9]+_\d+\s*\{[^}]*container:\s*tracewaterfall \/ inline-size;/);
  });

  test("under 40rem: label and two number lanes on line one, the bar spans the row below", () => {
    const block = narrowBlock();
    assert.match(block, /grid-template-columns:\s*minmax\(0, 1fr\) var\(--trace-num\) var\(--trace-num\);/);
    assert.doesNotMatch(block, /--trace-label/, "the 150px label lane is dropped");
    const track = rule(block, "track");
    assert.match(track, /grid-column:\s*1 \/ -1;/);
    assert.match(track, /grid-row:\s*2;/);
    assert.match(rule(block, "axis"), /grid-column:\s*1 \/ -1;/, "the axis spans the same width as the bars");
  });

  test("under 40rem: the end tick hangs inside the axis and loading rows stack", () => {
    const block = narrowBlock();
    assert.match(block, /\._tick_[a-z0-9]+_\d+\[data-edge="?end"?\]\s*\{[^}]*transform:\s*translateX\(-100%\);/);
    assert.match(rule(block, "skeletonRow"), /grid-template-columns:\s*minmax\(0, 1fr\);/);
  });

  test("only a tick at 100% is marked as the end edge", () => {
    const render = (endMs) =>
      renderToStaticMarkup(
        React.createElement(TraceWaterfall, {
          title: "Run trace",
          spans: [{ id: "plan", label: "Plan task", kind: "model", startMs: 0, endMs }],
        }),
      );
    assert.equal(render(4000).match(/data-edge="end"/g)?.length, 1, "4s run ends on a tick");
    assert.equal(render(4200).match(/data-edge="end"/g), null, "4.2s run has no tick at 100%");
  });

  test("the wide lanes stay as they are outside the query", () => {
    const outside = css.replace(narrowBlock(), "");
    assert.match(outside, /grid-template-columns:\s*var\(--trace-label\) minmax\(0, 1fr\) var\(--trace-num\) var\(--trace-num\);/);
  });

  test("each row renders label, track, duration, cost in that order", () => {
    const out = renderToStaticMarkup(
      React.createElement(TraceWaterfall, {
        title: "Run trace",
        spans: [{ id: "plan", label: "Plan task", kind: "model", startMs: 0, endMs: 4200, cost: 0.03 }],
      }),
    );
    const row = out.split("<li")[1];
    const order = ["_label_", "_track_", ">4.2s<", ">$0.03<"].map((needle) => row.indexOf(needle));
    assert.ok(order.every((at) => at >= 0), "all four cells present");
    assert.deepEqual([...order].sort((a, b) => a - b), order, "label, track, duration, cost");
  });
});
