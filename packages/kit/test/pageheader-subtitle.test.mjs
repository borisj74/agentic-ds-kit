/**
 * PageHeader subtitle: a string renders as before; inline nodes (an icon plus text) render in the
 * same subtitle paragraph; no subtitle, no paragraph. SSR through the CSS stub against dist.
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
let render;

before(async () => {
  React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { PageHeader } = await import("../dist/ui/PageHeader/PageHeader.js");
  render = (props) => renderToStaticMarkup(React.createElement(PageHeader, { title: "General", ...props }));
});

const subtitleP = (html) => html.match(/<h1[^>]*>General<\/h1><p class="([^"]*)">(.*?)<\/p>/);

describe("PageHeader subtitle", () => {
  test("string subtitle renders as text in a p under the h1", () => {
    const m = subtitleP(render({ subtitle: "Applies to everyone in Northwind" }));
    assert.ok(m, "expected a subtitle p right after the h1");
    assert.equal(m[2], "Applies to everyone in Northwind");
  });

  test("node subtitle renders the icon and text in the same p, with the same class", () => {
    const icon = React.createElement("svg", { "aria-hidden": "true", "data-icon": "users" });
    const node = React.createElement(React.Fragment, null, icon, "Applies to everyone in Northwind");
    const asString = subtitleP(render({ subtitle: "x" }));
    const m = subtitleP(render({ subtitle: node }));
    assert.ok(m, "expected a subtitle p right after the h1");
    assert.equal(m[1], asString[1], "same subtitle class (and so the same look)");
    assert.match(m[2], /^<svg aria-hidden="true" data-icon="users"><\/svg>Applies to everyone in Northwind$/);
  });

  test("no subtitle, no p", () => {
    assert.doesNotMatch(render({}), /<p/);
  });
});
