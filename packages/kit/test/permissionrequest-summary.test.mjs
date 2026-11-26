/**
 * PermissionRequest badge, summary strip and the stacked Grant / Deny under 40rem of card width.
 * Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import { after, before, describe, test } from "node:test";

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
const skip = JSDOM ? false : "jsdom is not installed";

let React;
let act;
let renderToStaticMarkup;
let createRoot;
let PermissionRequest;
let dom;
let width = 320;

const props = {
  title: "Refund up to $500 without asking",
  description: "3 refunds this week waited over 6 hours.",
  scopes: [{ id: "refunds", resource: "Refunds", access: "write", limit: "$500 per refund", expiry: "30 days" }],
  warning: "Change it any time in the table.",
  requestedAt: "Collections agent · requested 09:41",
  badge: "Needs you",
  summary: [
    { label: "Changes", value: "Refund limit goes from $250 to $500" },
    { label: "For", value: "30 days, until 22 Dec" },
    { label: "Still asks", value: "Refunds over $500" },
  ],
};

before(async () => {
  React = await import("react");
  act = React.act;
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  if (!skip) {
    dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost/" });
    const { window } = dom;
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    window.HTMLElement.prototype.getBoundingClientRect = function () {
      return { width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0 };
    };
    for (const [key, value] of Object.entries({
      window,
      document: window.document,
      navigator: window.navigator,
      HTMLElement: window.HTMLElement,
      Node: window.Node,
      Element: window.Element,
      ResizeObserver: window.ResizeObserver,
      getComputedStyle: window.getComputedStyle.bind(window),
    })) {
      Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    }
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    ({ createRoot } = await import("react-dom/client"));
  }
  ({ PermissionRequest } = await import("../dist/ui/PermissionRequest/PermissionRequest.js"));
});

after(() => dom?.window.close());

const names = (root) => [...root.querySelectorAll("footer button")].map((b) => b.textContent.trim());

describe("PermissionRequest badge and summary", () => {
  test("badge sits above the title with requestedAt, and the scope count is left out", () => {
    const html = renderToStaticMarkup(React.createElement(PermissionRequest, props));
    assert.ok(html.indexOf(">Needs you<") < html.indexOf("<h3"), "badge before the title");
    assert.match(html, />Collections agent · requested 09:41</);
    assert.doesNotMatch(html, /1 scope/);
    assert.match(html, /Change it any time in the table\./, "the write warning stays");
  });

  test("without badge the header has the scope count Badge and the footer starts with requestedAt", () => {
    const html = renderToStaticMarkup(React.createElement(PermissionRequest, { ...props, badge: undefined }));
    assert.match(html, /<header[\s\S]*_badge_[^>]*>1 scope<\/span><\/header>/);
    assert.match(html, /<footer[\s\S]*>Collections agent · requested 09:41</);
    assert.doesNotMatch(html, /Needs you/);
  });

  test("summary is a dl of label and value pairs, before the scopes", () => {
    const html = renderToStaticMarkup(React.createElement(PermissionRequest, props));
    assert.match(html, /<dl[^>]*>/);
    assert.match(html, /<dt[^>]*>For<\/dt><dd[^>]*>30 days, until 22 Dec<\/dd>/);
    assert.ok(html.indexOf("<dl") < html.indexOf("<ul"), "summary before the scopes");
    const none = renderToStaticMarkup(React.createElement(PermissionRequest, { ...props, summary: undefined }));
    assert.doesNotMatch(none, /<dl/);
  });

  test("wide: Deny then Grant at md, with their key chips", () => {
    const html = renderToStaticMarkup(React.createElement(PermissionRequest, props));
    assert.ok(html.indexOf(">Deny<") < html.indexOf(">Grant<"));
    assert.match(html, />Deny<\/span>[\s\S]*?>Esc</);
    assert.match(html, />Grant<\/span>[\s\S]*?>⌘⏎</);
  });
});

describe("PermissionRequest under 40rem", { skip }, () => {
  async function mount() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(React.createElement(PermissionRequest, props)));
    return { container, root };
  }

  test("Grant first and Deny under it, both full width at lg, no key chips", async () => {
    width = 320;
    const { container, root } = await mount();
    assert.deepEqual(names(container), ["Grant", "Deny"]);
    for (const button of container.querySelectorAll("footer button")) {
      assert.match(button.className, /_lg_/, "size lg");
      assert.match(button.className, /_block_/, "full width");
    }
    assert.doesNotMatch(container.textContent, /⌘⏎|Esc/, "no key chips");
    await act(async () => root.unmount());
  });

  test("a wide card keeps Deny then Grant", async () => {
    width = 900;
    const { container, root } = await mount();
    assert.deepEqual(names(container), ["DenyEsc", "Grant⌘⏎"], "label then key chip");
    await act(async () => root.unmount());
  });
});
