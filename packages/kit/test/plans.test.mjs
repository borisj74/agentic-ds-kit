/**
 * Plans block: FAQ items (logic), the SSR render (one solid primary, the
 * sections and their labels), and the interval / choose callbacks. Runs against the built kit
 * (dist): build first (npm run build -w agentic-ds-kit). CSS imports are stubbed; the built
 * CSS-module class names (_solid_…, _primary_…) still mark a Button's appearance and mode.
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

const plans = [
  { id: "free", name: "Free", price: 0, features: ["1 agent"] },
  { id: "team", name: "Team", price: 24, yearlyPrice: 19, features: ["10 agents"], recommended: true },
  { id: "scale", name: "Scale", price: 48, yearlyPrice: 39, features: ["Unlimited agents"] },
];
const faqs = [
  { id: "trial", question: "Is there a trial?", answer: "Team is free for 14 days." },
  { id: "cancel", question: "Can I cancel?", answer: "Any time." },
];

let logic;
let React;
let renderToStaticMarkup;
let Plans;

before(async () => {
  logic = await import("../dist/ui/Plans/plans.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ Plans } = await import("../dist/ui/Plans/Plans.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(Plans, { plans, faqs, ...props }));
}

describe("Plans logic", () => {
  test("faq: two or more become Accordion items, one is left out", () => {
    assert.deepEqual(logic.faqItems(faqs)[0], { id: "trial", title: "Is there a trial?", content: "Team is free for 14 days." });
    assert.deepEqual(logic.faqItems(faqs.slice(0, 1)), []);
    assert.deepEqual(logic.faqItems(undefined), []);
  });
});

describe("Plans render", () => {
  test("labelled section with h2, PricingPlans and FAQ, no comparison table", () => {
    const html = render({ title: "Pricing", description: "Start free." });
    assert.match(html, /^<section[^>]*aria-labelledby="([^"]+)"/);
    const id = html.match(/^<section[^>]*aria-labelledby="([^"]+)"/)[1];
    assert.match(html, new RegExp(`<h2 id="${id}"[^>]*>Pricing</h2>`));
    assert.match(html, />Choose a plan</);
    assert.doesNotMatch(html, /<table/);
    assert.match(html, />Questions</);
    assert.match(html, /role="radiogroup"[^>]*aria-label="Billing interval"/);
    assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 2);
  });

  test("one solid primary: the recommended plan's CTA", () => {
    const buttons = render().match(/<button[^>]*>[\s\S]*?<\/button>/g) ?? [];
    const solid = buttons.filter((b) => /^<button[^>]*class="[^"]*_solid_\w+[^"]*_primary_\w+/.test(b));
    assert.equal(solid.length, 1);
    assert.match(solid[0], /Choose Team/);
  });

  test("callbacks: interval change and choose plan with the interval", () => {
    const calls = [];
    let inner = "month";
    const uncontrolled = logic.plansHandlers({
      interval: "year",
      setInterval: (next) => (inner = next),
      onIntervalChange: (next) => calls.push(["interval", next]),
      onChoosePlan: (id, interval) => calls.push(["choose", id, interval]),
    });
    uncontrolled.changeInterval("year");
    uncontrolled.choose("team");
    assert.equal(inner, "year");
    assert.deepEqual(calls, [
      ["interval", "year"],
      ["choose", "team", "year"],
    ]);
    const bare = logic.plansHandlers({ interval: "month" });
    assert.doesNotThrow(() => {
      bare.changeInterval("year");
      bare.choose("free");
    });
  });

  test("FAQ is optional", () => {
    const html = render({ faqs: [] });
    assert.doesNotMatch(html, />Questions</);
  });

  test("yearly prices when the interval is yearly", () => {
    assert.match(render({ interval: "year" }), /billed yearly · save 21%/);
    assert.match(render({ defaultInterval: "month" }), /billed monthly/);
  });
});
