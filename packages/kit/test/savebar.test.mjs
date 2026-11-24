/**
 * SaveBar (saved / dirty / error, changes, savedAt, message, Discard / Save, saving) and Field `changed`
 * with the KitLabels `edited` key. SSR plus jsdom clicks against the built kit (dist); `npm test` builds first.
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
let render;
let kit;
const mounted = [];

const CHANGES = ["Legal name", "Invoice currency"];

before(async () => {
  const React = await import("react");
  h = React.createElement;
  act = React.act;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  kit = {
    ...(await import("../dist/ui/SaveBar/SaveBar.js")),
    ...(await import("../dist/ui/Field/Field.js")),
    ...(await import("../dist/ui/Input/Input.js")),
    ...(await import("../dist/ui/shared/labels.js")),
  };
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
  })) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  ({ createRoot } = await import("react-dom/client"));
});

after(async () => {
  if (skip) return;
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
  dom.window.close();
});

async function mount(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(element));
  return container;
}

const bar = (props) => render(h(kit.SaveBar, { onSave() {}, ...props }));
const buttons = (html) => [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[0]);

describe("SaveBar status", () => {
  test("default text per state", () => {
    assert.equal(kit.saveBarStatus("dirty", 2), "2 unsaved changes");
    assert.equal(kit.saveBarStatus("dirty", 1), "1 unsaved change");
    assert.equal(kit.saveBarStatus("dirty", 0), "Unsaved changes");
    assert.equal(kit.saveBarStatus("saved", 0, "10:42"), "Saved at 10:42");
    assert.equal(kit.saveBarStatus("saved", 0), "All changes saved");
    assert.equal(kit.saveBarStatus("error", 2), "Not saved");
  });

  test("dirty: count in a polite status, then the field names and last saved", () => {
    const html = bar({ changes: CHANGES, savedAt: "Nov 14 by Maya Chen", onDiscard() {} });
    assert.match(html, /role="region"/);
    assert.match(html, /aria-label="Save changes"/);
    assert.match(html, /data-state="dirty"/);
    assert.match(html, /<p[^>]*role="status"[^>]*aria-live="polite"[^>]*>2 unsaved changes<\/p>/);
    assert.match(html, />Legal name, Invoice currency · last saved Nov 14 by Maya Chen</);
    assert.ok(!html.includes('role="alert"'));
  });

  test("message replaces the status line; error keeps the changes line", () => {
    const html = bar({ state: "error", message: "Not saved · 1 field to fix", changes: CHANGES, onDiscard() {} });
    assert.match(html, /data-state="error"/);
    assert.match(html, /role="status"[^>]*>Not saved · 1 field to fix</);
    assert.match(html, />Legal name, Invoice currency</);
  });

  test("saved: no detail line, no Discard, Save disabled", () => {
    const html = bar({ state: "saved", savedAt: "10:42", changes: CHANGES, onDiscard() {} });
    assert.match(html, />Saved at 10:42</);
    assert.ok(!html.includes("Legal name"));
    const found = buttons(html);
    assert.equal(found.length, 1);
    assert.match(found[0], /disabled=""/);
    assert.match(found[0], /Save changes/);
  });
});

describe("SaveBar buttons", () => {
  test("Discard is outline, Save is the one solid primary, after the status; labels are props", () => {
    const html = bar({ changes: CHANGES, onDiscard() {}, discardLabel: "Cancel", saveLabel: "Save billing details" });
    const found = buttons(html);
    assert.equal(found.length, 2);
    assert.match(found[0], /Cancel/);
    assert.match(found[1], /Save billing details/);
    assert.ok(html.indexOf("role=\"status\"") < html.indexOf("<button"));
    assert.match(html, /aria-label="Save billing details"/);
  });

  test("no onDiscard, no Discard button; aria-label passed in wins", () => {
    const html = bar({ changes: CHANGES, "aria-label": "Billing details" });
    assert.equal(buttons(html).length, 1);
    assert.match(html, /aria-label="Billing details"/);
  });

  test("saving: Save is busy and Discard is disabled", () => {
    const found = buttons(bar({ changes: CHANGES, saving: true, onDiscard() {} }));
    assert.match(found[0], /disabled=""/);
    assert.match(found[1], /aria-busy="true"/);
  });

  test("clicking Discard and Save calls the handlers", { skip }, async () => {
    const calls = [];
    const container = await mount(
      h(kit.SaveBar, { changes: CHANGES, onDiscard: () => calls.push("discard"), onSave: () => calls.push("save") }),
    );
    const [discard, save] = container.querySelectorAll("button");
    await act(async () => discard.click());
    await act(async () => save.click());
    assert.deepEqual(calls, ["discard", "save"]);
  });

  test("saved: clicking the disabled Save does nothing", { skip }, async () => {
    const calls = [];
    const container = await mount(h(kit.SaveBar, { state: "saved", onSave: () => calls.push("save") }));
    await act(async () => container.querySelector("button").click());
    assert.deepEqual(calls, []);
  });
});

describe("Field changed", () => {
  const field = (props) =>
    render(h(kit.Field, { label: "Legal name", htmlFor: "legal", ...props }, h(kit.Input, { id: "legal" })));

  test("Edited sits beside the label, outside it, and leads describedBy", () => {
    const html = field({ changed: true, hint: "Was “Northwind Traders Ltd”." });
    assert.match(html, /data-changed="true"/);
    assert.match(html, /<label[^>]*>Legal name<\/label><span id="legal-changed"[^>]*>.*Edited<\/span>/);
    assert.match(html, /aria-describedby="legal-changed legal-hint"/);
  });

  test("off by default", () => {
    const html = field({ hint: "Use the registered name." });
    assert.ok(!html.includes("Edited"));
    assert.ok(!html.includes("data-changed"));
    assert.match(html, /aria-describedby="legal-hint"/);
  });

  test("the word comes from KitLabels edited", () => {
    assert.equal(kit.DEFAULT_KIT_LABELS.edited, "Edited");
    const html = render(
      h(kit.KitLabelsProvider, { labels: { edited: "Bearbeitet" } }, h(kit.Field, { label: "Name", htmlFor: "n", changed: true }, h(kit.Input, { id: "n" }))),
    );
    assert.match(html, /Bearbeitet/);
  });
});
