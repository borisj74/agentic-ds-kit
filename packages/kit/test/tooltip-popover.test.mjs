/**
 * Tooltip, HelpPopover and Popover: shared placement (flip and clamp), portaled Tooltip with
 * touch pin and hide grace, HelpPopover on the Escape stack, Popover header/footer parts and Tab trap.
 * Uses jsdom (kit devDependency) for a DOM. Runs against the built kit (dist); `npm test` builds first.
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
let kit = {};
let placeFloating;
const mounted = [];

function installDom() {
  dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost/" });
  const { window } = dom;
  const globals = {
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    HTMLInputElement: window.HTMLInputElement,
    Node: window.Node,
    Element: window.Element,
    Event: window.Event,
    KeyboardEvent: window.KeyboardEvent,
    MouseEvent: window.MouseEvent,
    PointerEvent: window.PointerEvent ?? window.MouseEvent,
    getComputedStyle: window.getComputedStyle.bind(window),
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  };
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverStub;
  globalThis.ResizeObserver = ResizeObserverStub;
  window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  globalThis.matchMedia = window.matchMedia;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}

before(async () => {
  if (skip) return;
  installDom();
  const React = await import("react");
  h = React.createElement;
  act = React.act;
  ({ createRoot } = await import("react-dom/client"));
  for (const name of ["Modal", "Tooltip", "HelpPopover", "Popover"]) {
    kit[name] = (await import(`../dist/ui/${name}/${name}.js`))[name];
  }
  ({ placeFloating } = await import("../dist/ui/shared/placeFloating.js"));
});

after(async () => {
  if (skip) return;
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
  document.body.innerHTML = "";
  dom.window.close();
});

async function render(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(element));
  return {
    container,
    async unmount() {
      await act(async () => root.unmount());
      mounted.splice(mounted.indexOf(root), 1);
      container.remove();
    },
  };
}

async function press(key, options = {}) {
  const target = document.activeElement ?? document.body;
  let event;
  await act(async () => {
    event = new window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...options });
    target.dispatchEvent(event);
  });
  return event;
}

async function click(element) {
  await act(async () => element.click());
}


function pointer(type, element, pointerType) {
  const Ctor = window.PointerEvent ?? window.MouseEvent;
  const event = new Ctor(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  element.dispatchEvent(event);
}

const rect = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height });
const viewport = { width: 400, height: 300 };

describe("placeFloating", { skip }, () => {
  test("keeps the preferred side when it fits and centres on the trigger", () => {
    const box = placeFloating("top", rect(180, 150, 40, 20), { width: 100, height: 30 }, { viewport });
    assert.equal(box.placement, "top");
    assert.equal(box.top, 150 - 8 - 30);
    assert.equal(box.left, 150);
    assert.equal(box.arrow, 50);
  });

  test("flips to the other side when the preferred side has no room", () => {
    const box = placeFloating("top", rect(180, 4, 40, 20), { width: 100, height: 30 }, { viewport });
    assert.equal(box.placement, "bottom");
    assert.equal(box.top, 24 + 8);
  });

  test("clamps inside the viewport and keeps the arrow on the trigger", () => {
    const box = placeFloating("bottom", rect(370, 100, 24, 20), { width: 200, height: 30 }, { viewport });
    assert.equal(box.left, 400 - 200 - 8);
    assert.equal(box.arrow, 370 + 12 - box.left);
  });

  test("start align lines up with the trigger's left edge", () => {
    const box = placeFloating("bottom", rect(40, 100, 80, 20), { width: 200, height: 30 }, { viewport, align: "start" });
    assert.equal(box.left, 40);
  });
});

describe("Tooltip", { skip }, () => {
  test("bubble is portaled to body and named by aria-describedby", async () => {
    const view = await render(h(kit.Tooltip, { content: "Copies the link" }, h("button", { id: "copy", type: "button" }, "Copy")));
    const button = document.getElementById("copy");
    assert.equal(document.querySelector('[role="tooltip"]'), null, "nothing mounted while closed");
    await act(async () => button.focus());
    const bubble = document.querySelector('[role="tooltip"]');
    assert.ok(bubble, "open on focus at once");
    assert.equal(bubble.parentElement, document.body, "portaled to body");
    assert.equal(button.getAttribute("aria-describedby"), bubble.id);
    await act(async () => button.blur());
    assert.equal(document.querySelector('[role="tooltip"]'), null);
    await view.unmount();
  });

  test("a tap pins it on touch and a tap outside closes it", async () => {
    const view = await render(
      h("div", null, h(kit.Tooltip, { content: "Copies the link" }, h("button", { id: "copy", type: "button" }, "Copy")), h("p", { id: "away" }, "Away")),
    );
    const button = document.getElementById("copy");
    await act(async () => pointer("pointerdown", button, "touch"));
    await act(async () => pointer("pointerout", button, "touch"));
    assert.ok(document.querySelector('[role="tooltip"]'), "pinned after tap");
    await act(async () => pointer("pointerdown", document.getElementById("away"), "touch"));
    assert.equal(document.querySelector('[role="tooltip"]'), null, "tap outside closes");
    await view.unmount();
  });

  test("mouse leave waits a short grace before hiding", async () => {
    const view = await render(h(kit.Tooltip, { content: "Copies the link", delay: 0 }, h("button", { id: "copy", type: "button" }, "Copy")));
    const wrapper = document.getElementById("copy").parentElement;
    await act(async () => pointer("pointerover", wrapper, "mouse"));
    assert.ok(document.querySelector('[role="tooltip"]'), "open on hover");
    await act(async () => pointer("pointerout", wrapper, "mouse"));
    assert.ok(document.querySelector('[role="tooltip"]'), "still open during the grace");
    await act(async () => new Promise((resolve) => setTimeout(resolve, 150)));
    assert.equal(document.querySelector('[role="tooltip"]'), null, "hidden after the grace");
    await view.unmount();
  });
});

describe("HelpPopover on the Escape stack", { skip }, () => {
  test("inside a Popover, Escape closes the help panel first and leaves the Popover open", async () => {
    const help = h(
      kit.HelpPopover,
      { title: "Invoice date", content: "We use this date on the PDF." },
      h("button", { id: "help", type: "button", "aria-label": "Help" }, "?"),
    );
    const view = await render(
      h(kit.Popover, { label: "Filters", trigger: h("button", { id: "open", type: "button" }, "Filters") }, help),
    );
    await click(document.getElementById("open"));
    const popover = () => document.querySelector('[role="dialog"][aria-label="Filters"]');
    assert.ok(popover(), "Popover open");
    await click(document.getElementById("help"));
    const panel = () => [...document.body.children].some((node) => node.textContent.includes("We use this date on the PDF.") && node.getAttribute("aria-hidden") === "true");
    assert.ok(panel(), "help panel open");
    const event = await press("Escape");
    assert.ok(event.defaultPrevented);
    assert.ok(!panel(), "help panel closed");
    assert.ok(popover(), "Popover still open");
    await press("Escape");
    assert.equal(popover(), null, "second Escape closes the Popover");
    await view.unmount();
  });
});

describe("Popover parts and Tab trap", { skip }, () => {
  test("renders eyebrow, tone word, title and footer; Tab wraps inside the panel", async () => {
    const view = await render(
      h(
        kit.Popover,
        {
          label: "Share invoice",
          title: "Share INV-1842",
          eyebrow: "Billing",
          tone: "warning",
          trigger: h("button", { id: "open", type: "button" }, "Share"),
          footerStart: h("span", null, "2 people"),
          footer: h("button", { id: "send", type: "button" }, "Send"),
        },
        h("input", { id: "email", "aria-label": "Email" }),
      ),
    );
    await click(document.getElementById("open"));
    const dialog = document.querySelector('[role="dialog"][aria-label="Share invoice"]');
    assert.ok(dialog);
    assert.equal(dialog.querySelector("h2").textContent, "Share INV-1842");
    assert.match(dialog.textContent, /Warning · Billing/);
    assert.ok(dialog.querySelector('[data-part="footer-start"]').textContent.includes("2 people"));
    assert.equal(document.activeElement, document.getElementById("email"), "first field focused");
    document.getElementById("send").focus();
    const tab = await press("Tab");
    assert.ok(tab.defaultPrevented, "Tab is trapped");
    assert.equal(document.activeElement, document.getElementById("email"));
    const back = await press("Tab", { shiftKey: true });
    assert.ok(back.defaultPrevented);
    assert.equal(document.activeElement, document.getElementById("send"));
    await view.unmount();
  });

  test("no title: no header, children only", async () => {
    const view = await render(h(kit.Popover, { label: "Note", trigger: h("button", { id: "open", type: "button" }, "Note") }, "Body"));
    await click(document.getElementById("open"));
    const dialog = document.querySelector('[role="dialog"][aria-label="Note"]');
    assert.equal(dialog.querySelector("h2"), null);
    assert.equal(dialog.querySelector('[data-part="footer"]'), null);
    await view.unmount();
  });
});
