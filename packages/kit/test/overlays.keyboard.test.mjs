/**
 * Overlays and Tabs, keyboard: Escape closes Modal, Drawer and AlertDialog; Escape closes an open
 * Select or DatePicker panel and returns focus; arrows/Home/End move Tabs. Covers audit B1: Escape
 * in an open Select or DatePicker inside a Modal or Drawer closes only that panel.
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
let useState;
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
  useState = React.useState;
  act = React.act;
  ({ createRoot } = await import("react-dom/client"));
  for (const name of ["Modal", "Drawer", "AlertDialog", "Select", "DatePicker", "Tabs"]) {
    kit[name] = (await import(`../dist/ui/${name}/${name}.js`))[name];
  }
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

const fruit = [
  { value: "apple", label: "Apple" },
  { value: "pear", label: "Pear" },
];

/** A dialog kind with its own open state, a close counter and optional children. */
function harness(kind, children, closes) {
  return function Harness() {
    const [open, setOpen] = useState(true);
    const close = () => {
      closes.count += 1;
      setOpen(false);
    };
    if (kind === "AlertDialog") {
      return h(kit.AlertDialog, {
        open,
        title: "Delete run?",
        description: "This cannot be undone.",
        actionLabel: "Delete",
        onCancel: close,
        onAction: close,
      });
    }
    return h(kit[kind], { open, title: "Dialog", onClose: close }, children);
  };
}

const menuOpen = () => document.querySelector('[role="menu"]') !== null;
const calendarOpen = () => document.querySelector('[role="dialog"][aria-label^="Choose"]') !== null;
const dialogOpen = (title) => [...document.querySelectorAll('[role="dialog"], [role="alertdialog"]')].some((node) => node.textContent.includes(title));

describe("Modal, Drawer, AlertDialog keyboard", { skip }, () => {
  for (const kind of ["Modal", "Drawer", "AlertDialog"]) {
    test(`${kind}: focus moves inside on open and Escape closes it`, async () => {
      const closes = { count: 0 };
      const view = await render(h(harness(kind, h("button", { type: "button" }, "Inside"), closes)));
      const title = kind === "AlertDialog" ? "Delete run?" : "Dialog";
      assert.ok(dialogOpen(title), "dialog is open");
      const dialog = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"]')].find((node) => node.textContent.includes(title));
      assert.ok(dialog.contains(document.activeElement), "focus is inside the dialog");
      await press("Escape");
      assert.equal(closes.count, 1);
      assert.ok(!dialogOpen(title), "dialog closed");
      await view.unmount();
    });
  }

  test("Modal: Tab from the last control wraps to the first", async () => {
    const closes = { count: 0 };
    const view = await render(
      h(harness("Modal", h("div", null, h("button", { type: "button" }, "One"), h("button", { type: "button" }, "Two")), closes)),
    );
    const dialog = document.querySelector('[role="dialog"]');
    const focusable = [...dialog.querySelectorAll("button")];
    focusable.at(-1).focus();
    const event = await press("Tab");
    assert.ok(event.defaultPrevented, "Tab is trapped");
    assert.equal(document.activeElement, focusable[0]);
    await view.unmount();
  });
});

describe("Select keyboard", { skip }, () => {
  test("opens on click; Escape closes the panel and returns focus to the trigger", async () => {
    const view = await render(h(kit.Select, { id: "fruit", ariaLabel: "Fruit", options: fruit }));
    const trigger = document.getElementById("fruit");
    await click(trigger);
    assert.ok(menuOpen(), "panel open");
    const event = await press("Escape");
    assert.ok(event.defaultPrevented, "Select marks its Escape as handled");
    assert.ok(!menuOpen(), "panel closed");
    assert.equal(document.activeElement, trigger);
    await view.unmount();
  });
});

describe("DatePicker keyboard", { skip }, () => {
  test("opens on click; Escape closes the calendar and returns focus to the trigger", async () => {
    const view = await render(h(kit.DatePicker, { id: "due", "aria-label": "Due date", defaultValue: "2026-11-13" }));
    const trigger = document.getElementById("due");
    await click(trigger);
    assert.ok(calendarOpen(), "calendar open");
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    const event = await press("Escape");
    assert.ok(event.defaultPrevented, "DatePicker marks its Escape as handled");
    assert.ok(!calendarOpen(), "calendar closed");
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(document.activeElement, trigger);
    await view.unmount();
  });
});

describe("B1: Escape in a panel inside a dialog closes only the panel", { skip }, () => {
  const panels = {
    Select: {
      element: () => h(kit.Select, { id: "inner", ariaLabel: "Fruit", options: fruit }),
      isOpen: menuOpen,
    },
    DatePicker: {
      element: () => h(kit.DatePicker, { id: "inner", "aria-label": "Due date", defaultValue: "2026-11-13" }),
      isOpen: calendarOpen,
    },
  };

  for (const dialog of ["Modal", "Drawer"]) {
    for (const [name, panel] of Object.entries(panels)) {
      test(`${name} inside ${dialog}: first Escape closes the ${name}, second closes the ${dialog}`, async () => {
        const closes = { count: 0 };
        const view = await render(h(harness(dialog, panel.element(), closes)));
        await click(document.getElementById("inner"));
        assert.ok(panel.isOpen(), `${name} open`);

        await press("Escape");
        assert.ok(!panel.isOpen(), `${name} closed`);
        assert.equal(closes.count, 0, `${dialog} must stay open`);
        assert.ok(dialogOpen("Dialog"), `${dialog} still open`);
        assert.equal(document.activeElement, document.getElementById("inner"), `focus back on the ${name} trigger`);

        await press("Escape");
        assert.equal(closes.count, 1, `second Escape closes the ${dialog}`);
        assert.ok(!dialogOpen("Dialog"));
        await view.unmount();
      });
    }
  }
});

describe("Tabs keyboard", { skip }, () => {
  test("arrows move selection and focus, skip disabled tabs and wrap; Home and End jump", async () => {
    const items = [
      { id: "a", label: "Alpha", content: "Panel A" },
      { id: "b", label: "Beta", content: "Panel B" },
      { id: "c", label: "Gamma", disabled: true },
      { id: "d", label: "Delta", content: "Panel D" },
    ];
    const view = await render(h(kit.Tabs, { ariaLabel: "Sections", items }));
    const tab = (label) => [...document.querySelectorAll('[role="tab"]')].find((node) => node.textContent === label);
    const selected = () => document.querySelector('[role="tab"][aria-selected="true"]').textContent;

    tab("Alpha").focus();
    await press("ArrowRight");
    assert.equal(selected(), "Beta");
    assert.equal(document.activeElement, tab("Beta"));
    assert.equal(tab("Beta").getAttribute("tabindex"), "0");
    assert.equal(tab("Alpha").getAttribute("tabindex"), "-1");

    await press("ArrowRight");
    assert.equal(selected(), "Delta", "disabled Gamma is skipped");
    await press("ArrowRight");
    assert.equal(selected(), "Alpha", "wraps to the first tab");
    await press("ArrowLeft");
    assert.equal(selected(), "Delta", "wraps to the last tab");
    await press("Home");
    assert.equal(selected(), "Alpha");
    await press("End");
    assert.equal(selected(), "Delta");
    assert.match(document.querySelector('[role="tabpanel"]').textContent, /Panel D/);
    await view.unmount();
  });
});
