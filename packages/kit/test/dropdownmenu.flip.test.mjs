/**
 * DropdownMenu placement: a menu whose trigger sits near the viewport bottom (e.g. an account
 * menu at the foot of a side nav) opens above the trigger instead of running off-screen.
 * Uses jsdom (kit devDependency). Runs against the built kit (dist); `npm test` builds first.
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
  kit.DropdownMenu = (await import("../dist/ui/DropdownMenu/DropdownMenu.js")).DropdownMenu;
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

/** Fakes layout: the trigger at `triggerTop` (32px tall), the menu panel 160px tall, an 800px viewport. */
function fakeLayout(triggerTop) {
  const original = window.HTMLElement.prototype.getBoundingClientRect;
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    const isPanel = this.getAttribute("role") === "menu";
    const top = isPanel ? 0 : triggerTop;
    const height = isPanel ? 160 : 32;
    return { top, bottom: top + height, left: 20, right: 60, width: 40, height, x: 20, y: top, toJSON() {} };
  };
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  return () => {
    window.HTMLElement.prototype.getBoundingClientRect = original;
  };
}

async function openMenu() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () =>
    root.render(
      h(kit.DropdownMenu, {
        ariaLabel: "Account menu",
        iconStart: "ChevronsUpDown",
        groups: [{ items: [{ id: "settings", label: "Settings" }, { id: "out", label: "Sign out" }] }],
      }),
    ),
  );
  const trigger = container.querySelector('button[aria-label="Account menu"]');
  await act(async () => trigger.click());
  return [...document.querySelectorAll('[role="menu"]')].pop();
}

describe("DropdownMenu flips above the trigger near the viewport bottom", { skip }, () => {
  test("opens below when there is room", async () => {
    const restore = fakeLayout(100);
    try {
      const panel = await openMenu();
      assert.ok(panel, "menu open");
      assert.equal(panel.style.top, "136px");
      assert.equal(panel.style.bottom, "");
    } finally {
      restore();
    }
  });

  test("opens above when the space below is too small", async () => {
    const restore = fakeLayout(740);
    try {
      const panel = await openMenu();
      assert.ok(panel, "menu open");
      assert.equal(panel.style.top, "auto");
      assert.equal(panel.style.bottom, "64px");
    } finally {
      restore();
    }
  });
});
