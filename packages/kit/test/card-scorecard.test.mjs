/**
 * Card header row (icon, eyebrow, meta, X), source line and footer (Ask left, actions right), and
 * Scorecard frame and value sizes. SSR through the CSS stub; the CSS checks read the sources.
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

let h;
let React;
let Card;

before(async () => {
  React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  h = (type, props, ...children) => renderToStaticMarkup(React.createElement(type, props, ...children));
  Card = (await import("../dist/ui/Card/Card.js")).Card;
});

const full = () => ({
  title: "Revenue by plan",
  icon: "ChartBar",
  eyebrow: "Analytics",
  meta: "12:04",
  onDismiss: () => {},
  source: "Stripe · last 30 days",
  onAsk: () => {},
  askLabel: "Ask",
  actions: [{ label: "Export" }, { label: "Open report", appearance: "solid", mode: "primary" }],
});

describe("Card header row", () => {
  test("eyebrow and meta render as text, not headings, before the title", () => {
    const html = h(Card, full(), "rows");
    assert.ok(html.indexOf("Analytics") < html.indexOf("Revenue by plan"));
    assert.ok(html.indexOf("12:04") < html.indexOf("Revenue by plan"));
    assert.doesNotMatch(html, /<h\d[^>]*>Analytics/);
    assert.match(html, /<h2 id="[^"]+"[^>]*>Revenue by plan<\/h2>/);
  });

  test("the X is a button named Dismiss", () => {
    const html = h(Card, full(), "rows");
    assert.match(html, /<button[^>]*aria-label="Dismiss"/);
  });

  test("the icon tile is hidden from assistive tech", () => {
    const html = h(Card, full(), "rows");
    assert.match(html, /<span[^>]*aria-hidden="true"[^>]*><svg/);
  });

  test("without header props the card has no Dismiss and no header row", () => {
    const html = h(Card, { title: "Plan mix" }, "b");
    assert.doesNotMatch(html, /Dismiss/);
    assert.doesNotMatch(html, /topRow/);
  });
});

describe("Card source and footer", () => {
  test("source describes the article", () => {
    const html = h(Card, full(), "rows");
    const id = html.match(/aria-describedby="([^"]+)"/)[1];
    assert.match(html, new RegExp(`<p id="${id}"[^>]*>Stripe · last 30 days</p>`));
  });

  test("Ask comes first in the footer, then the actions", () => {
    const html = h(Card, full(), "rows");
    const footer = html.slice(html.indexOf("<footer"));
    assert.ok(footer.indexOf(">Ask<") < footer.indexOf(">Export<"));
    assert.ok(footer.indexOf(">Export<") < footer.indexOf(">Open report<"));
    assert.match(footer, /<svg[^>]*aria-hidden="true"/);
  });

  test("Ask needs a label", () => {
    const html = h(Card, { title: "T", onAsk: () => {} }, "b");
    assert.doesNotMatch(html, /<footer/);
  });

  test("footer CSS is a row with a divider and no full-width buttons", () => {
    const css = readFileSync(new URL("../ui/Card/Card.module.css", import.meta.url), "utf8");
    const footer = css.match(/\n\.footer \{[^}]*\}/)[0];
    assert.match(footer, /justify-content: space-between/);
    assert.match(footer, /border-top: var\(--border-divider\) solid var\(--border-faint\)/);
    assert.doesNotMatch(css, /\.footer button/);
  });
});

describe("Scorecard frame", () => {
  const css = readFileSync(new URL("../ui/Scorecard/Scorecard.module.css", import.meta.url), "utf8");

  test("no transparent keyword", () => {
    assert.doesNotMatch(css, /transparent/);
  });

  test("shares Card's frame tokens and the space-4 / space-6 padding", () => {
    const card = css.match(/(^|\n)\.card \{[^}]*\}/)[0];
    assert.match(card, /background: var\(--surface-card\)/);
    assert.match(card, /var\(--border-faint\)/);
    assert.match(card, /padding: var\(--space-4\)/);
    assert.match(css.match(/\n\.sm \{[^}]*\}/)[0], /padding: var\(--space-4\)/);
    assert.match(css.match(/\n\.lg \{[^}]*\}/)[0], /padding: var\(--space-6\)/);
  });

  test("value sizes are three real steps", () => {
    assert.match(css, /\.sm \.value \{[^}]*--type-size-ui-lg/);
    assert.match(css, /\n\.value \{[^}]*--type-size-ui-xl/);
    assert.match(css, /\.lg \.value \{[^}]*--type-size-heading-4/);
  });
});
