/**
 * Link: inline and standalone variants, external (new tab, rel, hidden hint, aria-hidden icon),
 * linkAs router links, and passthrough. Runs against the built kit (dist); `npm test` builds first.
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
let render;
let Link;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  ({ Link } = await import("../dist/ui/Link/Link.js"));
});

describe("Link", () => {
  test("is exported from the package entry (JS and types)", () => {
    // Importing the whole entry pulls AppNav's next/link, so read the built files instead.
    const js = readFileSync(new URL("../dist/src/index.js", import.meta.url), "utf8");
    const dts = readFileSync(new URL("../dist/src/index.d.ts", import.meta.url), "utf8");
    assert.match(js, /from "\.\.\/ui\/Link\/Link\.js"/);
    assert.match(js, /\bas Link\b/);
    assert.match(dts, /export \* from '\.\.\/ui\/Link';/);
  });

  test("inline by default: a native anchor with href and no target", () => {
    const html = render(h(Link, { href: "/docs/billing" }, "billing guide"));
    assert.match(html, /^<a [^>]*href="\/docs\/billing"/);
    assert.match(html, />billing guide<\/a>$/);
    assert.doesNotMatch(html, /target=/);
    assert.match(html, /class="[^"]*inline/);
  });

  test("standalone variant sets its class", () => {
    const html = render(h(Link, { href: "/team", variant: "standalone" }, "Manage team"));
    assert.match(html, /class="[^"]*standalone/);
  });

  test("external opens a new tab safely and says so to screen readers", () => {
    const html = render(h(Link, { href: "https://example.com", external: true, rel: "author" }, "Status"));
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="author noopener noreferrer"/);
    assert.match(html, /<svg[^>]*aria-hidden="true"/);
    assert.match(html, /<span[^>]*> \(opens in a new tab\)<\/span>/);
  });

  test("linkAs renders the router link; external ignores it", () => {
    const RouterLink = ({ href, className, children }) => h("a", { href, className, "data-router": "" }, children);
    assert.match(render(h(Link, { href: "/a", linkAs: RouterLink }, "A")), /data-router=""/);
    assert.doesNotMatch(render(h(Link, { href: "https://x.example", linkAs: RouterLink, external: true }, "X")), /data-router/);
  });

  test("passes other attributes to the anchor", () => {
    const html = render(h(Link, { href: "/a", id: "l1", "aria-current": "page", className: "extra" }, "A"));
    assert.match(html, /id="l1"/);
    assert.match(html, /aria-current="page"/);
    assert.match(html, /class="[^"]*extra/);
  });
});
