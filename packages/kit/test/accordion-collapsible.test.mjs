/**
 * Accordion and Collapsible: type single/multiple, meta, count, disabled items, slot content,
 * arrow keys between headers, and Collapsible's whole-row header button.
 * Uses jsdom (kit devDependency) for keyboard checks. Runs against the built kit (dist); `npm test` builds first.
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
let renderToStaticMarkup;
let Accordion;
let Collapsible;
const mounted = [];

const items = [
  { id: "contact", title: "Billing contact", meta: "Updated 2 days ago", content: "billing@northwind.com" },
  { id: "invoices", title: "Invoices", count: 12, content: "INV-1842 was $1,240.00." },
  { id: "sso", title: "Single sign-on", disabled: true, content: "Enterprise plan only." },
  { id: "seats", title: "Team seats", content: "Eight of ten seats in use." },
];

before(async () => {
  const React = await import("react");
  h = React.createElement;
  act = React.act;
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ Accordion } = await import("../dist/ui/Accordion/Accordion.js"));
  ({ Collapsible } = await import("../dist/ui/Collapsible/Collapsible.js"));
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
    KeyboardEvent: window.KeyboardEvent,
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

async function press(key) {
  await act(async () => {
    document.activeElement.dispatchEvent(new window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });
}

const expanded = (container) =>
  [...container.querySelectorAll("button[aria-expanded]")].map((b) => b.getAttribute("aria-expanded"));

describe("Accordion markup", () => {
  test("chevron comes before the title; meta and count render in the header", () => {
    const html = renderToStaticMarkup(h(Accordion, { items }));
    const button = html.match(/<button[^>]*>.*?<\/button>/)[0];
    assert.ok(button.indexOf("lucide-chevron-right") < button.indexOf("Billing contact"));
    assert.match(html, /Updated 2 days ago/);
    assert.match(html, /data-nistha="count"|>12</);
  });

  test("count and meta sit together at the end of the header, count first", () => {
    const html = renderToStaticMarkup(
      h(Accordion, { items: [{ id: "a", title: "Invoices", count: 12, meta: "Updated today", content: "x" }, items[3]] }),
    );
    const button = html.match(/<button[^>]*>.*?<\/button>/)[0];
    const title = button.indexOf("Invoices");
    const count = button.indexOf(">12<");
    const meta = button.indexOf("Updated today");
    assert.ok(title < count && count < meta, "title, then count, then meta");
    const end = button.match(/<span class="[^"]*end[^"]*">(.*)<\/span><\/button>/);
    assert.ok(end && end[1].includes(">12<") && end[1].includes("Updated today"), "one trailing group holds both");
  });

  test("disabled item sets aria-disabled and leaves the tab order", () => {
    const html = renderToStaticMarkup(h(Accordion, { items }));
    assert.match(html, /aria-disabled="true"[^>]*tabindex="-1"|tabindex="-1"[^>]*aria-disabled="true"/);
  });

  test("content is a slot", () => {
    const html = renderToStaticMarkup(
      h(Accordion, { items: [{ id: "a", title: "A", content: h("table", null) }, items[1]], defaultOpen: "a" }),
    );
    assert.match(html, /<table><\/table>/);
  });

  test("type single opens only the first id; multiple opens all", () => {
    const single = renderToStaticMarkup(h(Accordion, { items, defaultOpen: ["contact", "invoices"] }));
    assert.equal((single.match(/aria-expanded="true"/g) ?? []).length, 1);
    const multiple = renderToStaticMarkup(h(Accordion, { items, type: "multiple", defaultOpen: ["contact", "invoices"] }));
    assert.equal((multiple.match(/aria-expanded="true"/g) ?? []).length, 2);
  });
});

describe("Accordion behaviour", { skip }, () => {
  test("single closes the open item when another opens; multiple keeps both", async () => {
    const one = await mount(h(Accordion, { items, defaultOpen: "contact" }));
    await act(async () => one.querySelectorAll("button")[1].click());
    assert.deepEqual(expanded(one), ["false", "true", "false", "false"]);

    const many = await mount(h(Accordion, { items, type: "multiple", defaultOpen: "contact" }));
    await act(async () => many.querySelectorAll("button")[1].click());
    assert.deepEqual(expanded(many), ["true", "true", "false", "false"]);
  });

  test("a disabled item does not toggle on click", async () => {
    const container = await mount(h(Accordion, { items }));
    await act(async () => container.querySelectorAll("button")[2].click());
    assert.equal(expanded(container)[2], "false");
  });

  test("Down and Up move between headers and skip disabled; Right opens, Left closes", async () => {
    const container = await mount(h(Accordion, { items }));
    const buttons = container.querySelectorAll("button");
    buttons[1].focus();
    await press("ArrowDown");
    assert.equal(document.activeElement, buttons[3]);
    await press("ArrowDown");
    assert.equal(document.activeElement, buttons[0]);
    await press("ArrowUp");
    assert.equal(document.activeElement, buttons[3]);
    await press("ArrowRight");
    assert.equal(expanded(container)[3], "true");
    await press("ArrowLeft");
    assert.equal(expanded(container)[3], "false");
    await press("Home");
    assert.equal(document.activeElement, buttons[0]);
  });
});

describe("Collapsible", () => {
  test("the header row is one button named by the title; the panel is labelled by it", () => {
    const html = renderToStaticMarkup(h(Collapsible, { trigger: "Order #4189" }, "Shipped"));
    assert.equal((html.match(/<button/g) ?? []).length, 1);
    assert.doesNotMatch(html, /aria-label="Toggle/);
    const buttonId = html.match(/<button[^>]*id="([^"]+)"/)[1];
    assert.match(html, new RegExp(`aria-labelledby="${buttonId}"`));
    assert.match(html, /<button[^>]*>.*Order #4189.*<\/button>/);
    assert.match(html, /hidden=""/);
  });

  test("clicking the header toggles the panel", { skip }, async () => {
    const container = await mount(h(Collapsible, { trigger: "Order #4189" }, "Shipped"));
    const button = container.querySelector("button");
    await act(async () => button.click());
    assert.equal(button.getAttribute("aria-expanded"), "true");
    assert.equal(container.querySelector('[role="region"]').hidden, false);
  });
});
