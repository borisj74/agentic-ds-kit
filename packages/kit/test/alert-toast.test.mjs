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
    // A warning on page load is a polite status, not an interruption.
    assert.match(html, /role="status"/);
    assert.doesNotMatch(html, /role="alert"/);
    // Tone word, then the eyebrow: "Warning · Billing".
    assert.ok(html.indexOf(">Warning<") >= 0, "tone word shows");
    assert.ok(html.indexOf(">Warning<") < html.indexOf(">Billing<"), "tone word comes before the eyebrow");
    assert.match(html, />·</);
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
    assert.match(html, /role="alert"/, "danger stays role=alert");
    assert.match(html, />Error</, "danger reads Error");
    const buttons = html.match(/<button[^>]*>/g) ?? [];
    assert.equal(buttons.length, 2);
    assert.ok(html.indexOf("Try again") < html.indexOf("View log"));
  });

  test("page action with appearance outline matches the inline outline Button; no children renders no body", () => {
    const button = (html) => (html.match(/<button[^>]*>/) ?? [""])[0];
    const solid = renderToStaticMarkup(h(Alert, { variant: "danger", title: "Not saved", action: { label: "Go to VAT number", onClick: noop } }));
    const outline = renderToStaticMarkup(
      h(Alert, { variant: "danger", title: "Not saved", action: { label: "Go to VAT number", onClick: noop, appearance: "outline" } }),
    );
    const inline = renderToStaticMarkup(
      h(Alert, { variant: "danger", placement: "inline", title: "Not saved", action: { label: "Go to VAT number", onClick: noop } }),
    );
    assert.notEqual(button(solid), button(outline), "outline changes the page action");
    assert.equal(button(outline), button(inline), "same outline neutral Button as inline");
    assert.equal((outline.match(/<p/g) ?? []).length, 1, "title only, no empty body paragraph");
  });
});

describe("Alert labels", () => {
  test("the tone word comes from KitLabelsProvider", async () => {
    const { KitLabelsProvider } = await import("../dist/ui/shared/labels.js");
    const html = renderToStaticMarkup(
      h(KitLabelsProvider, { labels: { warning: "Avertissement" } }, h(Alert, { variant: "warning", eyebrow: "Facturation" }, "Mettez la carte à jour.")),
    );
    assert.match(html, />Avertissement</);
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
      MutationObserver: window.MutationObserver,
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

  test("past three, older toasts are hidden, paused and out of the live region", async () => {
    let closed = 0;
    const onClose = () => {
      closed += 1;
    };
    const titles = ["One", "Two", "Three", "Four"];
    await act(async () =>
      root.render(
        h(
          "div",
          null,
          titles.map((title) => h(Toast, { key: title, open: true, onClose, title, duration: 40 })),
        ),
      ),
    );
    const cards = [...document.querySelectorAll("#agentic-ds-kit-toasts [aria-labelledby]")];
    assert.equal(cards.length, 4);
    const oldest = cards.find((card) => card.textContent.includes("One"));
    assert.equal(oldest.hidden, true, "the oldest is hidden");
    assert.equal(oldest.getAttribute("role"), null, "the hidden one has no live role");
    assert.equal(oldest.getAttribute("aria-live"), null);
    for (const card of cards.filter((c) => c !== oldest)) {
      assert.equal(card.hidden, false);
      assert.equal(card.getAttribute("role"), "status");
    }
    await act(async () => new Promise((resolve) => setTimeout(resolve, 120)));
    // The three visible ones timed out; the hidden one was paused, so it is still waiting.
    assert.equal(closed, 3);
    await act(async () => root.render(h("div", null)));
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
