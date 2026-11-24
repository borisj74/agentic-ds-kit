/**
 * Empty kind and size, public LoadError (sizes, reference, Try again via KitLabels tryAgain) and the
 * retry refocus. SSR for markup, jsdom for focus. Runs against the built kit (dist); `npm test` builds first.
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

let JSDOM = null;
try {
  ({ JSDOM } = await import("jsdom"));
} catch {
  JSDOM = null;
}

let h;
let render;
let kit;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  kit = {
    ...(await import("../dist/ui/Empty/Empty.js")),
    ...(await import("../dist/ui/LoadError/LoadError.js")),
    ...(await import("../dist/ui/shared/labels.js")),
  };
});

describe("Empty", () => {
  test("no kind: no role, md heading (unchanged API)", () => {
    const html = render(h(kit.Empty, { title: "No comments yet" }));
    assert.doesNotMatch(html, /role=/);
    assert.match(html, /<h3[^>]*>No comments yet<\/h3>/);
    assert.match(html, /data-size="md"/);
  });

  for (const kind of ["no-data", "no-results", "permission"]) {
    test(`${kind} is role=status with an aria-hidden kind icon`, () => {
      const html = render(h(kit.Empty, { kind, title: "x" }));
      assert.match(html, /role="status"/);
      assert.match(html, /aria-hidden="true"[^>]*><svg/);
      assert.match(html, /stroke-width="1.5"/);
    });
  }

  test("first-use has no role", () => {
    const html = render(h(kit.Empty, { kind: "first-use", title: "Connect billing" }));
    assert.doesNotMatch(html, /role=/);
    assert.match(html, /data-kind="first-use"/);
  });

  test("size sm drops the heading", () => {
    const html = render(h(kit.Empty, { size: "sm", kind: "no-data", title: "No revenue in 30 days." }));
    assert.doesNotMatch(html, /<h\d/);
    assert.match(html, /<p[^>]*>No revenue in 30 days\.<\/p>/);
  });

  test("an explicit icon overrides the kind icon; media hides both", () => {
    const withMedia = render(h(kit.Empty, { kind: "no-data", title: "x", media: h("span", { id: "m" }) }));
    assert.doesNotMatch(withMedia, /<svg/);
  });
});

describe("LoadError", () => {
  test("role=alert, message, mono reference and Try again", () => {
    const html = render(h(kit.LoadError, { message: "Couldn’t load invoices.", reference: "Ref 7F3A-91C2", onRetry() {} }));
    assert.match(html, /role="alert"/);
    assert.match(html, /Couldn’t load invoices\./);
    assert.match(html, />Ref 7F3A-91C2</);
    assert.match(html, /<button[^>]*>.*Try again<\/span><\/button>/);
    assert.match(html, /data-size="sm"/);
  });

  test("no onRetry, no button", () => {
    assert.doesNotMatch(render(h(kit.LoadError, { message: "x" })), /<button/);
  });

  test("Try again comes from KitLabels tryAgain", () => {
    const html = render(
      h(kit.KitLabelsProvider, { labels: { tryAgain: "Erneut versuchen" } }, h(kit.LoadError, { message: "x", onRetry() {} })),
    );
    assert.match(html, /Erneut versuchen/);
  });
});

describe("LoadError focus", { skip: JSDOM ? false : "jsdom is not installed" }, () => {
  test("focus stays put on first show; returns to Try again after a retry that fails again", async () => {
    const dom = new JSDOM("<!doctype html><html><body><button id='outside'>x</button></body></html>", { url: "http://localhost/" });
    const { window } = dom;
    for (const [k, v] of Object.entries({ window, document: window.document, navigator: window.navigator, HTMLElement: window.HTMLElement, Node: window.Node })) {
      Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
    }
    window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const React = await import("react");
    const { createRoot } = await import("react-dom/client");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    let show;
    function Host() {
      const [state, setState] = React.useState("error");
      show = setState;
      return state === "error"
        ? h(kit.LoadError, { message: "Couldn’t load revenue.", onRetry: () => setState("loading") })
        : h("div", { "aria-busy": "true" });
    }
    const outside = document.getElementById("outside");
    outside.focus();
    await React.act(async () => root.render(h(Host)));
    assert.equal(document.activeElement, outside, "first error does not steal focus");

    const button = container.querySelector("button");
    button.focus();
    await React.act(async () => button.click());
    assert.equal(container.querySelector("button"), null, "loading replaced the error");
    await React.act(async () => show("error"));
    assert.equal(document.activeElement?.textContent, "Try again", "focus is back on Try again");

    // A retry on one error must not pull focus into a different error.
    container.querySelector("button").click();
    await React.act(async () => {});
    document.activeElement?.blur();
    const other = document.createElement("div");
    document.body.appendChild(other);
    const otherRoot = createRoot(other);
    await React.act(async () => otherRoot.render(h(kit.LoadError, { message: "Couldn’t load invoices.", onRetry() {} })));
    assert.notEqual(document.activeElement, other.querySelector("button"), "a different error does not take focus");
    await React.act(async () => otherRoot.unmount());
    await React.act(async () => root.unmount());
    dom.window.close();
  });
});
