/**
 * DatePicker redesign: lg size, weekStart, isDateDisabled (struck through and named unavailable),
 * the shared overlay header with Close, typed start and end in DateRangePicker, the bottom sheet
 * below 40rem, DateTimePicker minDate/maxDate, and DatePicker on the shared Escape stack.
 * Runs against the built kit (dist); `npm test` builds first.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  for (const name of ["Modal", "DatePicker", "DateRangePicker", "DateTimePicker"]) {
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


const dialog = (label) => document.querySelector(`[role="dialog"][aria-label="${label}"]`);
const day = (label) => [...document.querySelectorAll("[role=gridcell] button")].find((b) => b.getAttribute("aria-label").startsWith(label));

async function type(input, text) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  await act(async () => {
    setter.call(input, text);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

describe("DatePicker redesign", { skip }, () => {
  test("lg trigger uses the lg control height class", async () => {
    const view = await render(h(kit.DatePicker, { id: "lg", size: "lg", "aria-label": "Due" }));
    assert.match(document.getElementById("lg").className, /controlLg/);
    await view.unmount();
  });

  test("header has the title and a Close button; opening focuses the picked day, not Close", async () => {
    const view = await render(h(kit.DatePicker, { id: "due", defaultValue: "2026-11-13" }));
    await click(document.getElementById("due"));
    const panel = dialog("Choose date");
    assert.ok(panel, "dialog open");
    assert.equal(panel.querySelector("h2").textContent, "Choose date");
    assert.ok(panel.querySelector('button[aria-label="Close"]'), "Close button");
    assert.match(document.activeElement.getAttribute("aria-label"), /^Friday, November 13, 2026/);
    await click(panel.querySelector('button[aria-label="Close"]'));
    assert.equal(dialog("Choose date"), null);
    assert.equal(document.activeElement, document.getElementById("due"));
    await view.unmount();
  });

  test("weekStart=1 puts Monday first; isDateDisabled days are named unavailable and cannot be picked", async () => {
    const picks = [];
    const view = await render(
      h(kit.DatePicker, {
        id: "w",
        defaultValue: "2026-11-13",
        weekStart: 1,
        isDateDisabled: (iso) => iso === "2026-11-26",
        onValueChange: (iso) => picks.push(iso),
      }),
    );
    await click(document.getElementById("w"));
    assert.equal(document.querySelector("[role=columnheader]").textContent, "Mo");
    const thanksgiving = day("Thursday, November 26, 2026");
    assert.match(thanksgiving.getAttribute("aria-label"), /unavailable$/);
    assert.equal(thanksgiving.getAttribute("aria-disabled"), "true");
    assert.ok(thanksgiving.hasAttribute("data-unavailable"));
    await click(thanksgiving);
    assert.deepEqual(picks, []);
    await view.unmount();
  });

  test("Escape inside a Modal closes only the DatePicker (shared Escape stack)", async () => {
    let closes = 0;
    function Harness() {
      const [open, setOpen] = useState(true);
      return h(kit.Modal, { open, title: "Dialog", onClose: () => { closes += 1; setOpen(false); } }, h(kit.DatePicker, { id: "inner", defaultValue: "2026-11-13" }));
    }
    const view = await render(h(Harness));
    await click(document.getElementById("inner"));
    const event = await press("Escape");
    assert.ok(event.defaultPrevented);
    assert.equal(dialog("Choose date"), null);
    assert.equal(closes, 0);
    await view.unmount();
  });

  test("mode=range still works and warns once in development", async () => {
    const warnings = [];
    const original = console.warn;
    console.warn = (message) => warnings.push(String(message));
    const view = await render(h(kit.DatePicker, { id: "r", mode: "range" }));
    console.warn = original;
    assert.ok(warnings.some((w) => /deprecated/.test(w)));
    await view.unmount();
  });
});

describe("DateRangePicker redesign", { skip }, () => {
  test("typed start and end set the pending range; Apply commits it", async () => {
    const picks = [];
    const view = await render(h(kit.DateRangePicker, { id: "p", presets: [], onValueChange: (r) => picks.push(r) }));
    await click(document.getElementById("p"));
    const panel = dialog("Choose dates");
    const start = panel.querySelector('input[aria-label="Start date"]');
    const end = panel.querySelector('input[aria-label="End date"]');
    assert.ok(start && end, "typed fields");
    assert.match(panel.textContent, /to/);
    await type(start, "2026-10-01");
    await type(end, "2026-10-31");
    const apply = [...panel.querySelectorAll("button")].find((b) => b.textContent === "Apply");
    assert.equal(apply.disabled, false);
    await click(apply);
    assert.deepEqual(picks, [{ start: "2026-10-01", end: "2026-10-31" }]);
    await view.unmount();
  });

  test("a typed day outside maxDate is refused", async () => {
    const view = await render(h(kit.DateRangePicker, { id: "q", presets: [], maxDate: "2026-11-20" }));
    await click(document.getElementById("q"));
    const panel = dialog("Choose dates");
    await type(panel.querySelector('input[aria-label="Start date"]'), "2026-11-01");
    await type(panel.querySelector('input[aria-label="End date"]'), "2026-12-01");
    const apply = [...panel.querySelectorAll("button")].find((b) => b.textContent === "Apply");
    assert.equal(apply.disabled, true);
    await view.unmount();
  });

  test("below 40rem it opens as the Drawer bottom sheet", async () => {
    const original = window.matchMedia;
    window.matchMedia = (query) => ({ matches: query.includes("40rem"), media: query, addEventListener() {}, removeEventListener() {} });
    const view = await render(h(kit.DateRangePicker, { id: "s" }));
    await click(document.getElementById("s"));
    const sheet = document.querySelector('[data-nistha="drawer"], [role="dialog"][aria-modal="true"]');
    assert.ok(sheet, "sheet open");
    assert.equal(document.querySelectorAll("[role=grid]").length, 1, "one month");
    assert.ok(document.body.querySelector('input[aria-label="Start date"]'));
    const event = await press("Escape");
    assert.ok(event.defaultPrevented);
    assert.equal(document.querySelectorAll("[role=grid]").length, 0, "closed");
    await view.unmount();
    window.matchMedia = original;
  });
});

describe("DateTimePicker redesign", { skip }, () => {
  test("minDate and maxDate reach the month grid", async () => {
    const view = await render(h(kit.DateTimePicker, { id: "t", defaultValue: { date: "2026-11-13" }, minDate: "2026-11-10", maxDate: "2026-11-20" }));
    await click(document.getElementById("t"));
    assert.match(day("Monday, November 9, 2026").getAttribute("aria-label"), /unavailable$/);
    assert.doesNotMatch(day("Tuesday, November 10, 2026").getAttribute("aria-label"), /unavailable/);
    assert.match(day("Saturday, November 21, 2026").getAttribute("aria-label"), /unavailable$/);
    await view.unmount();
  });
});

describe("contracts", () => {
  const read = (name) => JSON.parse(readFileSync(new URL(`../contracts/${name}.json`, import.meta.url), "utf8"));
  test("all three pickers offer sm, md and lg", () => {
    for (const name of ["datepicker", "daterangepicker", "datetimepicker"]) {
      assert.deepEqual([...read(name).props.size.values].sort(), ["lg", "md", "sm"], name);
    }
  });
  test("DatePicker mode=range is deprecated and points at DateRangePicker", () => {
    const contract = read("datepicker");
    assert.match(contract.props.mode.note, /deprecated/);
    assert.ok(contract.doNot.some((line) => /mode=range/.test(line) && /DateRangePicker/.test(line)));
  });
});
