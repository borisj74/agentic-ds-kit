/**
 * insight-stack pattern (packages/kit/patterns/InsightStackPattern): server-rendered markup for the
 * ranked, loading and all-clear states, and the a11y wiring the contract promises.
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import { before, describe, test } from "node:test";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function load(url, context, next) {
  if (url.endsWith(".css")) return { format: "module", source: "export default new Proxy({}, { get: (_, key) => String(key) });", shortCircuit: true };
  return next(url, context);
}`),
);

type Mod = typeof import("../packages/kit/patterns/InsightStackPattern");
let h: typeof import("react").createElement;
let render: (node: import("react").ReactElement) => string;
let pattern: Mod;
let KitLabelsProvider: typeof import("../packages/kit/ui/shared/labels").KitLabelsProvider;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  pattern = await import("../packages/kit/patterns/InsightStackPattern");
  ({ KitLabelsProvider } = await import("../packages/kit/ui/shared/labels"));
});

const noop = () => {};

function ranked(extra: Record<string, unknown> = {}) {
  return h(pattern.InsightStackPattern, {
    title: "Three things changed this month",
    source: "Billing, product and CRM · last 30 days",
    eyebrow: "Summary · 3 of 7 insights",
    meta: "09:00",
    items: pattern.DEMO_INSIGHTS,
    defaultOpenIds: ["starter-churn"],
    seeAllLabel: "See all 7",
    onSeeAll: noop,
    askLabel: "Ask in Chat",
    onAsk: noop,
    onDismiss: noop,
    ...extra,
  });
}

describe("insight-stack pattern", () => {
  test("article is labelled by the h3 title and described by the source", () => {
    const html = render(ranked());
    const labelledby = /<article[^>]*aria-labelledby="([^"]+)"/.exec(html)?.[1];
    const describedby = /<article[^>]*aria-describedby="([^"]+)"/.exec(html)?.[1];
    assert.ok(labelledby && describedby);
    assert.match(html, new RegExp(`<h3 id="${labelledby}"[^>]*>Three things changed this month</h3>`));
    assert.match(html, new RegExp(`<p id="${describedby}"[^>]*>Billing, product and CRM · last 30 days</p>`));
  });

  test("findings are an ordered list with spoken ranks", () => {
    const html = render(ranked());
    assert.match(html, /<ol class="insight-stack-pattern__list">/);
    assert.equal((html.match(/<li /g) ?? []).length, 3);
    assert.match(html, />Rank 1</);
    assert.match(html, />Rank 3</);
  });

  test("signed changes use Delta (Worse with goodWhen); unsigned amounts are plain tone text", () => {
    const html = render(ranked());
    assert.match(html, /\+\$18\.4k/);
    assert.match(html, /Worse · \+2\.4 pt/);
    assert.match(html, /insight-stack-pattern__amount--warning">\$1,360</);
  });

  test("Why? is a button wired to a named region; closed panels are hidden", () => {
    const html = render(ranked());
    const toggles = [...html.matchAll(/<button type="button" id="([^"]+)" class="insight-stack-pattern__why" aria-expanded="(true|false)" aria-controls="([^"]+)"/g)];
    assert.equal(toggles.length, 3);
    assert.deepEqual(toggles.map((m) => m[2]), ["false", "true", "false"]);
    for (const [, toggleId, expanded, panelId] of toggles) {
      const panel = new RegExp(`<div id="${panelId}" role="region" aria-labelledby="${toggleId} [^"]+" class="insight-stack-pattern__panel"( hidden="")?`).exec(html);
      assert.ok(panel, `region for ${toggleId}`);
      assert.equal(Boolean(panel[1]), expanded === "false");
    }
    assert.match(html, /aria-label="Confidence"/);
    assert.match(html, />High · 82%</);
  });

  test("footer: See all and Ask are outline Buttons, plus a named X", () => {
    const html = render(ranked());
    assert.match(html, />See all 7</);
    assert.match(html, />Ask in Chat</);
    assert.match(html, /aria-label="Dismiss"/);
    assert.doesNotMatch(html, /solid/);
  });

  test("seeAllHref renders a real link", () => {
    const html = render(ranked({ onSeeAll: undefined, seeAllHref: "/insights" }));
    assert.match(html, /<a [^>]*href="\/insights"[^>]*>See all 7<\/a>/);
  });

  test("loading: status, Skeletons hidden, no X, no footer", () => {
    const html = render(
      h(pattern.InsightStackPattern, {
        title: "Reading 30 days of billing data",
        eyebrow: "Summary · Updating",
        loading: true,
        onDismiss: noop,
        askLabel: "Ask in Chat",
        onAsk: noop,
      }),
    );
    assert.match(html, /aria-busy="true"/);
    assert.match(html, /role="status"[^>]*>Updating</);
    assert.match(html, /<ol class="insight-stack-pattern__list" aria-hidden="true">/);
    assert.doesNotMatch(html, /Dismiss/);
    assert.doesNotMatch(html, /Ask in Chat/);
  });

  test("all clear: caption and only Ask", () => {
    const html = render(
      h(pattern.InsightStackPattern, {
        title: "Nothing needs you today",
        caption: "Changes over 5% show up here first",
        items: [],
        seeAllLabel: "See all",
        onSeeAll: noop,
        askLabel: "Ask in Chat",
        onAsk: noop,
      }),
    );
    assert.match(html, /insight-stack-pattern--empty/);
    assert.match(html, />Changes over 5% show up here first</);
    assert.doesNotMatch(html, /See all/);
    assert.match(html, />Ask in Chat</);
    assert.doesNotMatch(html, /<ol/);
  });

  test("KitLabels why and confidence", () => {
    const html = render(h(KitLabelsProvider, { labels: { why: "Warum?", confidence: "Sicherheit" }, children: ranked() }));
    assert.match(html, />Warum\?</);
    assert.match(html, />Sicherheit</);
    assert.match(html, /aria-label="Sicherheit"/);
  });
});
