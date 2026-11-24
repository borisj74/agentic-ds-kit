/**
 * Card headingLevel: the title renders as the chosen heading element, keeps its class (same look)
 * and still names the article. SSR through the CSS stub. Runs against the built kit (dist).
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

let render;
let Card;

before(async () => {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  Card = (await import("../dist/ui/Card/Card.js")).Card;
  render = (props) => renderToStaticMarkup(React.createElement(Card, props, "Body"));
});

describe("Card headingLevel", () => {
  test("defaults to h2", () => {
    const html = render({ title: "Open invoices" });
    assert.match(html, /<h2 id="[^"]+" class="[^"]*">Open invoices<\/h2>/);
  });

  for (const level of [1, 3, 4]) {
    test(`headingLevel ${level} renders h${level} with the same class and names the article`, () => {
      const base = render({ title: "Sign in to Northwind" });
      const html = render({ title: "Sign in to Northwind", headingLevel: level });
      const cls = (s, tag) => s.match(new RegExp(`<${tag} id="([^"]+)" class="([^"]*)"`));
      const h2 = cls(base, "h2");
      const hn = cls(html, `h${level}`);
      assert.ok(hn, `expected an h${level}`);
      assert.doesNotMatch(html, /<h2/);
      assert.equal(hn[2], h2[2], "title class (and so its look) is unchanged");
      assert.match(html, new RegExp(`<article[^>]*aria-labelledby="${hn[1]}"`));
    });
  }

  test("no title, no heading", () => {
    assert.doesNotMatch(render({ headingLevel: 1 }), /<h[1-4]/);
  });
});
