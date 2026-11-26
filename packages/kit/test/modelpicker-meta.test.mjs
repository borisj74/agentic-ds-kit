/**
 * ModelPicker: context window and cost tier are plain text in each item's description,
 * not DropdownMenu key chips (no kbd, no aria-keyshortcuts).
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
let createRoot;
let ModelPicker;
let dom;

const MODELS = [
  { id: "opus", name: "Claude Opus 5.5", vendor: "Anthropic", description: "Deepest reasoning", contextWindow: "200K", costTier: "High" },
  { id: "sonnet", name: "Claude Sonnet 5.5", vendor: "Anthropic", description: "Balanced default", contextWindow: "200K", costTier: "Standard", recommended: true },
  { id: "nw405", name: "Northwind 405B", vendor: "Example vendor", contextWindow: "128K", costTier: "$$$", disabled: true, disabledReason: "Needs the Pro plan" },
];

before(async () => {
  React = await import("react");
  act = React.act;
  if (skip) return;
  dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost/" });
  const { window } = dom;
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
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
    requestAnimationFrame: (cb) => setTimeout(cb, 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
  })) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  ({ createRoot } = await import("react-dom/client"));
  ({ ModelPicker } = await import("../dist/ui/ModelPicker/ModelPicker.js"));
});

after(() => dom?.window.close());

describe("ModelPicker item meta", { skip }, () => {
  test("context window and cost are plain description text, no key chips", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(React.createElement(ModelPicker, { models: MODELS, value: "sonnet" })));
    await act(async () => container.querySelector("button").click());
    const items = [...document.querySelectorAll("[role^=menuitem]")];
    assert.equal(items.length, 3);
    const text = items.map((item) => item.textContent);
    assert.match(text[0], /Deepest reasoning · 200K · High/);
    assert.match(text[1], /Recommended · Balanced default · 200K · Standard/);
    assert.match(text[2], /Needs the Pro plan · 128K · High/);
    for (const item of items) {
      assert.equal(item.querySelector("kbd"), null, "no key chips");
      assert.equal(item.getAttribute("aria-keyshortcuts"), null, "no aria-keyshortcuts");
    }
    await act(async () => root.unmount());
  });
});
