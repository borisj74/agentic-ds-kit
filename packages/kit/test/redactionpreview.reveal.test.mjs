/**
 * RedactionPreview reveal state follows the value, not the chip's position: reveal a chip,
 * reorder the data, and the same value stays revealed. Uses jsdom (kit devDependency).
 * Runs against the built kit (dist); `npm test` builds first.
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

let dom;
let h;
let act;
let createRoot;
let RedactionPreview;
let logic;
let root;
let container;

function spansFor(payload, values) {
  return values.map(([value, type]) => {
    const start = payload.indexOf(value);
    return { start, end: start + value.length, type };
  });
}

const values = [
  ["ana@acme.dev", "email"],
  ["bo@acme.dev", "email"],
];
const first = "Mail ana@acme.dev or bo@acme.dev.";
const reordered = "Mail bo@acme.dev or ana@acme.dev.";

before(async () => {
  logic = await import("../dist/ui/RedactionPreview/redactionPreview.logic.js");
  if (skip) return;
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
    PointerEvent: window.PointerEvent ?? window.MouseEvent,
    getComputedStyle: window.getComputedStyle.bind(window),
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  })) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  globalThis.matchMedia = window.matchMedia;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const React = await import("react");
  h = React.createElement;
  act = React.act;
  ({ createRoot } = await import("react-dom/client"));
  ({ RedactionPreview } = await import("../dist/ui/RedactionPreview/RedactionPreview.js"));
});

after(async () => {
  if (skip) return;
  if (root) await act(async () => root.unmount());
  dom.window.close();
});

describe("RedactionPreview segment keys", () => {
  test("a span's key names the value, so it survives reordering", () => {
    const keyOf = (payload, value) =>
      logic.segments(payload, spansFor(payload, values)).find((seg) => seg.kind === "span" && seg.text === value).key;
    assert.equal(keyOf(first, "ana@acme.dev"), keyOf(reordered, "ana@acme.dev"));
    assert.notEqual(keyOf(first, "ana@acme.dev"), keyOf(first, "bo@acme.dev"));
  });

  test("repeated values get distinct keys", () => {
    const payload = "x@a.io and x@a.io";
    const spans = [
      { start: 0, end: 6, type: "email" },
      { start: 11, end: 17, type: "email" },
    ];
    const keys = logic.segments(payload, spans).filter((seg) => seg.kind === "span").map((seg) => seg.key);
    assert.equal(new Set(keys).size, 2);
  });
});

describe("RedactionPreview reveal", { skip }, () => {
  test("a revealed value stays revealed when the data is reordered", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    const draw = (payload, spans) =>
      act(async () => root.render(h(RedactionPreview, { destination: "Claude", payload, spans })));

    await draw(first, spansFor(first, values));
    const chips = () => [...container.querySelectorAll("button[aria-pressed]")];
    assert.equal(chips().length, 2);
    await act(async () => chips()[0].dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
    assert.deepEqual(chips().map((chip) => chip.textContent), ["ana@acme.dev", "[email]"]);

    // Same values, other order in the payload and in the spans array.
    await draw(reordered, spansFor(reordered, values).reverse());
    assert.deepEqual(chips().map((chip) => chip.textContent), ["[email]", "ana@acme.dev"]);
    assert.deepEqual(chips().map((chip) => chip.getAttribute("aria-pressed")), ["false", "true"]);
  });
});
