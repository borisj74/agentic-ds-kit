/**
 * Focus ring on joined controls. Joined pieces (ButtonGroup buttons, SplitButton halves, SegmentedControl
 * segments, the split FilterButton chip) draw the ring inside the focused piece, lifted above its
 * neighbours, so it never bleeds over them. Gapped pieces (InputOTP slots) keep the outside ring, and
 * only the active slot shows it.
 * Uses jsdom (kit devDependency) with the built kit CSS (dist/*.kit.css) loaded into the document, so
 * getComputedStyle reads the real rules. Focus moves by real focus() calls and key events: arrow keys in
 * SegmentedControl and typing in InputOTP go through the components' own handlers. jsdom does not move
 * focus on Tab, so `tab()` fires the Tab keydown and then moves focus to the next tabbable, as a browser
 * does. jsdom's own :focus-visible heuristic only matches the first focus in a document, so the loaded CSS
 * swaps :focus-visible for :focus; every focus in these tests comes from the keyboard, where a browser
 * matches :focus-visible too. Runs against the built kit (dist); `npm test` builds first.
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

const INSIDE_OFFSET = "calc(var(--border-focus-width) * -1)";
const CSS_FROM = ["Button", "ButtonGroup", "SplitButton", "DropdownMenu", "SegmentedControl", "FilterButton", "InputOTP"];

let dom;
let h;
let act;
let createRoot;
const kit = {};
const mounted = [];

function installDom() {
  const css = CSS_FROM.map((name) =>
    readFileSync(new URL(`../dist/ui/${name}/${name}.kit.css`, import.meta.url), "utf8"),
  ).join("\n").replaceAll(":focus-visible", ":focus");
  dom = new JSDOM(`<!doctype html><html><head><style>${css}</style></head><body></body></html>`, {
    pretendToBeVisual: true,
    url: "http://localhost/",
  });
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
  for (const name of ["Button", "ButtonGroup", "SplitButton", "SegmentedControl", "FilterButton", "InputOTP"]) {
    kit[name] = (await import(`../dist/ui/${name}/${name}.js`))[name];
  }
});

after(() => {
  for (const root of mounted.splice(0)) act(() => root.unmount());
  dom?.window.close();
});

async function render(element) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  mounted.push(root);
  await act(async () => root.render(element));
  return host;
}

function key(target, name) {
  const event = new window.KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

const TABBABLE = "button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex='-1'])";

async function tab(host) {
  const from = document.activeElement;
  await act(async () => {
    const event = key(from && from !== document.body ? from : document.body, "Tab");
    if (event.defaultPrevented) return;
    const list = [...host.querySelectorAll(TABBABLE)].filter((el) => el.tabIndex >= 0);
    const next = list[list.indexOf(from) + 1] ?? list[0];
    next.focus();
  });
  return document.activeElement;
}

function ring(el) {
  const cs = getComputedStyle(el);
  return { offset: cs.outlineOffset, z: cs.zIndex, outline: cs.outline };
}

/** The last declared value of `prop` among the loaded rules that match `el` (jsdom drops var() colours). */
function declared(el, prop) {
  let value = "";
  const walk = (rules) => {
    for (const rule of rules) {
      if (rule.cssRules && !rule.selectorText) walk(rule.cssRules);
      else if (rule.selectorText && el.matches(rule.selectorText)) {
        value = rule.style.getPropertyValue(prop) || value;
      }
    }
  };
  for (const sheet of document.styleSheets) walk(sheet.cssRules);
  return value;
}

function assertInsideRing(el, label) {
  assert.equal(document.activeElement, el, `${label} has focus`);
  const r = ring(el);
  assert.equal(r.offset, INSIDE_OFFSET, `${label}: ring sits inside (offset -2px)`);
  assert.equal(r.z, "1", `${label}: lifted above its neighbours`);
  assert.match(r.outline, /var\(--border-focus\)/, `${label}: ring uses --border-focus`);
}

function assertNoRing(el, label) {
  assert.notEqual(document.activeElement, el, `${label} is not focused`);
  assert.notEqual(ring(el).offset, INSIDE_OFFSET, `${label}: no ring`);
}

describe("joined controls: ring inside the focused piece", { skip }, () => {
  test("ButtonGroup: Tab moves the inside ring from button to button, with the focus border", async () => {
    const { Button, ButtonGroup } = kit;
    const host = await render(
      h(ButtonGroup, { ariaLabel: "Period" }, ...["Day", "Week", "Month"].map((label) =>
        h(Button, { key: label, appearance: "outline", mode: "neutral" }, label),
      )),
    );
    const buttons = [...host.querySelectorAll("button")];
    const first = await tab(host);
    assert.equal(first, buttons[0]);
    assertInsideRing(first, "Day");
    assert.equal(declared(first, "border-color"), "var(--border-focus)", "Day: border takes the focus colour");
    for (const other of buttons.slice(1)) assertNoRing(other, other.textContent);

    const second = await tab(host);
    assert.equal(second, buttons[1]);
    assertInsideRing(second, "Week");
    assertNoRing(buttons[0], "Day");
    assertNoRing(buttons[2], "Month");
  });

  test("SplitButton: both halves get the inside ring, one at a time", async () => {
    const { SplitButton } = kit;
    const host = await render(
      h(SplitButton, { groups: [{ items: [{ id: "draft", label: "Save as draft" }] }] }, "Save invoice"),
    );
    const main = await tab(host);
    assert.equal(main.textContent, "Save invoice");
    assertInsideRing(main, "main");
    assert.equal(declared(main, "border-color"), "var(--border-focus)");
    const menu = await tab(host);
    assert.equal(menu.getAttribute("aria-label"), "Save invoice options");
    assertInsideRing(menu, "chevron");
    assertNoRing(main, "main");
  });

  test("SegmentedControl: arrow keys move focus and the inside ring follows", async () => {
    const { SegmentedControl } = kit;
    const host = await render(
      h(SegmentedControl, {
        ariaLabel: "Billing",
        defaultValue: "monthly",
        items: [
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly" },
        ],
      }),
    );
    const [monthly, yearly] = host.querySelectorAll("[role=radio]");
    const start = await tab(host);
    assert.equal(start, monthly);
    assertInsideRing(monthly, "Monthly");
    await act(async () => key(monthly, "ArrowRight"));
    assert.equal(document.activeElement, yearly);
    assertInsideRing(yearly, "Yearly");
    assertNoRing(monthly, "Monthly");
  });

  test("FilterButton split chip: each half gets the inside ring", async () => {
    const { FilterButton } = kit;
    const host = await render(
      h(FilterButton, { toggle: "on", value: "Pending", onToggle() {}, hasDropdown: true }, "Status"),
    );
    const [name, chevron] = host.querySelectorAll("button");
    assert.ok(chevron, "split chip renders two buttons");
    await tab(host);
    assertInsideRing(name, "name half");
    await tab(host);
    assert.equal(document.activeElement, chevron);
    assertInsideRing(chevron, "chevron half");
    assertNoRing(name, "name half");
  });
});

describe("gapped InputOTP slots: outside ring on the active slot only", { skip }, () => {
  test("typing moves the ring to the next slot; slots stay gapped", async () => {
    const { InputOTP } = kit;
    const host = await render(h(InputOTP, { id: "otp", ariaLabel: "Code" }));
    const input = host.querySelector("input");
    const slotsWithRing = () =>
      [...host.querySelectorAll("[aria-hidden] [data-active], [data-active]")].filter(
        (slot) => getComputedStyle(slot).outlineOffset === "var(--space-inset-2xs)",
      );

    assert.equal(slotsWithRing().length, 0, "no ring before focus");
    await tab(host);
    assert.equal(document.activeElement, input);

    const slots = [...host.querySelectorAll("span[aria-hidden]")].filter((el) => !el.querySelector("svg"));
    assert.equal(slots.length, 6);
    assert.equal(slotsWithRing().length, 1, "only the active slot has the ring");
    assert.equal(slotsWithRing()[0], slots[0]);

    const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    for (const digit of ["4", "8"]) {
      await act(async () => {
        key(input, digit);
        setValue.call(input, input.value + digit);
        input.dispatchEvent(new window.Event("input", { bubbles: true }));
      });
    }
    const ringed = slotsWithRing();
    assert.equal(ringed.length, 1, "still one ring after typing");
    assert.equal(ringed[0], slots[2], "ring moved to the third slot");
    assert.equal(declared(ringed[0], "border-color"), "var(--border-focus)");

    const group = slots[0].parentElement;
    assert.equal(getComputedStyle(group).gap, "var(--space-2)", "slots keep a --space-2 gap");

    await act(async () => input.blur());
    assert.equal(slotsWithRing().length, 0, "ring goes when focus leaves");
  });
});
