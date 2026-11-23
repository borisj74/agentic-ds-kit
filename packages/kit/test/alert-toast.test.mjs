/**
 * Alert and Toast: the shared header (eyebrow, timestamp, Dismiss), Alert placement and actions,
 * Toast size, progress and the danger default (stays open). Alert renders on the server; Toast
 * portals, so it runs in jsdom (kit devDependency). Runs against the built kit (dist); `npm test`
 * builds first. CSS imports are stubbed.
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

const noop = () => {};
let h;
let renderToStaticMarkup;
let Alert;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ Alert } = await import("../dist/ui/Alert/Alert.js"));
});

describe("Alert", () => {
  test("defaults to the page placement with no header, as before", () => {
    const html = renderToStaticMarkup(h(Alert, { variant: "success", title: "Saved" }, "Your changes are live."));
    assert.match(html, /role="status"/);
    assert.doesNotMatch(html, /Dismiss/);
    assert.doesNotMatch(html, /<button/);
  });

  test("header shows eyebrow, timestamp and a Dismiss Button", () => {
    const html = renderToStaticMarkup(
      h(
        Alert,
        { variant: "warning", placement: "inline", eyebrow: "Billing", timestamp: "Nov 20", title: "Card expires on Dec 12", onDismiss: noop },
        "Update the card before then or the workspace pauses.",
      ),
    );
    assert.match(html, /role="alert"/);
    assert.match(html, />Billing</);
    assert.match(html, />Nov 20</);
    assert.match(html, /aria-label="Dismiss"/);
  });

  test("renders action then secondaryAction as kit Buttons", () => {
    const html = renderToStaticMarkup(
      h(
        Alert,
        {
          variant: "danger",
          placement: "inline",
          title: "Export failed",
          action: { label: "Try again", onClick: noop },
          secondaryAction: { label: "View log", onClick: noop },
        },
        "The file store did not answer. Your data is safe.",
      ),
    );
    const buttons = html.match(/<button[^>]*>/g) ?? [];
    assert.equal(buttons.length, 2);
    assert.ok(html.indexOf("Try again") < html.indexOf("View log"));
  });
});

describe("Toast", { skip }, () => {
  let dom;
  let act;
  let createRoot;
  let Toast;
  let root;

  before(async () => {
    dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost/" });
    const { window } = dom;
    for (const [key, value] of Object.entries({
      window,
      document: window.document,
      navigator: window.navigator,
      HTMLElement: window.HTMLElement,
      Node: window.Node,
      Element: window.Element,
      Event: window.Event,
      MouseEvent: window.MouseEvent,
      getComputedStyle: window.getComputedStyle.bind(window),
      requestAnimationFrame: window.requestAnimationFrame.bind(window),
      cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
    })) {
      Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    }
    window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    act = (await import("react")).act;
    ({ createRoot } = await import("react-dom/client"));
    ({ Toast } = await import("../dist/ui/Toast/Toast.js"));
    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  after(async () => {
    if (root) await act(async () => root.unmount());
    dom?.window.close();
  });

  const card = () => document.querySelector("#agentic-ds-kit-toasts [aria-labelledby]");

  test("danger stays open by default: no countdown bar", async () => {
    await act(async () => root.render(h(Toast, { open: true, onClose: noop, status: "danger", title: "Couldn't send reminders" })));
    assert.equal(card().getAttribute("role"), "alert");
    assert.equal(card().querySelector('[aria-hidden="true"] > span[style*="animation-duration"]'), null);
  });

  test("success counts down by default", async () => {
    await act(async () => root.render(h(Toast, { open: true, onClose: noop, status: "success", title: "3 invoices archived" })));
    assert.ok(card().querySelector('span[style*="animation-duration: 5000ms"]'));
  });

  test("progress shows a named progressbar instead of the countdown", async () => {
    await act(async () =>
      root.render(h(Toast, { open: true, onClose: noop, title: "Exporting invoices", progress: 42.4, timestamp: "Now", size: "lg" })),
    );
    const bar = card().querySelector('[role="progressbar"]');
    assert.ok(bar);
    assert.equal(bar.getAttribute("aria-valuenow"), "42");
    assert.equal(bar.getAttribute("aria-labelledby"), card().getAttribute("aria-labelledby"));
    assert.equal(card().querySelector('span[style*="animation-duration"]'), null);
    assert.match(card().textContent, /Now/);
  });
});
