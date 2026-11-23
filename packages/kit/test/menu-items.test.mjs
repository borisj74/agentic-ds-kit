/**
 * Shared menu item part (Command + DropdownMenu): keycap parsing and aria-keyshortcuts, Command
 * keywords / description search, loading, onAsk, key footer and live count; DropdownMenu radio
 * groups, keycaps and typeahead. Runs against the built kit (dist); `npm test` builds first.
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

let h;
let act;
let createRoot;
let renderToStaticMarkup;
let shortcut;
let Command;
let DropdownMenu;
let dom;
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
  window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  globalThis.matchMedia = window.matchMedia;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}

before(async () => {
  const React = await import("react");
  h = React.createElement;
  act = React.act;
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  shortcut = await import("../dist/ui/shared/shortcut.js");
  ({ Command } = await import("../dist/ui/Command/Command.js"));
  ({ DropdownMenu } = await import("../dist/ui/DropdownMenu/DropdownMenu.js"));
  if (!skip) {
    installDom();
    ({ createRoot } = await import("react-dom/client"));
  }
});

after(async () => {
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
  dom?.window.close();
});

async function mount(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(element));
  return container;
}

describe("shortcut parsing", () => {
  test("splits chords, words, sequences and named keys", () => {
    assert.deepEqual(shortcut.parseShortcut("⇧⌘P"), { keys: ["⇧", "⌘", "P"], sequence: false });
    assert.deepEqual(shortcut.parseShortcut("Ctrl K"), { keys: ["Ctrl", "K"], sequence: false });
    assert.deepEqual(shortcut.parseShortcut("Ctrl+K"), { keys: ["Ctrl", "K"], sequence: false });
    assert.deepEqual(shortcut.parseShortcut("G I"), { keys: ["G", "I"], sequence: true });
    assert.deepEqual(shortcut.parseShortcut("Esc"), { keys: ["Esc"], sequence: false });
    assert.deepEqual(shortcut.parseShortcut("⌘,"), { keys: ["⌘", ","], sequence: false });
  });

  test("aria-keyshortcuts for chords only", () => {
    assert.equal(shortcut.ariaKeyShortcuts("⇧⌘P"), "Shift+Meta+P");
    assert.equal(shortcut.ariaKeyShortcuts("Ctrl K"), "Control+K");
    assert.equal(shortcut.ariaKeyShortcuts("Esc"), "Escape");
    assert.equal(shortcut.ariaKeyShortcuts("G I"), undefined);
    assert.equal(shortcut.ariaKeyShortcuts(undefined), undefined);
  });
});

const GROUPS = [
  { heading: "Recent", items: [{ id: "inv", label: "INV-1842", description: "Northwind Labs" }] },
  {
    heading: "Go to",
    items: [
      { id: "profile", label: "Profile", icon: "User", shortcut: "⇧⌘P" },
      { id: "invoices", label: "Invoices", description: "Billing", shortcut: "G I", keywords: ["payment"] },
    ],
  },
];

describe("Command server HTML", () => {
  test("keycaps are aria-hidden and the option carries aria-keyshortcuts", () => {
    const html = renderToStaticMarkup(h(Command, { groups: GROUPS }));
    assert.match(html, /aria-keyshortcuts="Shift\+Meta\+P"/);
    assert.match(html, /<kbd[^>]*>⇧<\/kbd>/);
    assert.match(html, />G then I</);
    assert.match(html, />Billing</);
  });

  test("loading sets aria-busy and shows a Spinner", () => {
    const html = renderToStaticMarkup(h(Command, { groups: [], loading: true }));
    assert.match(html, /role="listbox"[^>]*aria-busy="true"|aria-busy="true"[^>]*role="listbox"/);
    assert.match(html, /Loading results/);
    assert.doesNotMatch(html, /No results found/);
  });

  test("onAsk adds an Ask Chat option, also when empty", () => {
    const html = renderToStaticMarkup(h(Command, { groups: [], onAsk() {} }));
    assert.match(html, /No results found/);
    assert.match(html, /role="option"[^>]*>.*Ask Chat/s);
    assert.match(html, /Ask about your workspace/);
  });
});

describe("Command in the DOM", { skip }, () => {
  async function type(input, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    await act(async () => {
      setter.call(input, value);
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
  }

  test("keywords match, the count is announced and Enter on Ask passes the query", async () => {
    let asked = null;
    const container = await mount(h(Command, { groups: GROUPS, onAsk: (q) => (asked = q) }));
    const input = container.querySelector('[role="combobox"]');
    await type(input, "payment");
    const options = [...container.querySelectorAll('[role="option"]')].map((el) => el.textContent);
    assert.equal(options.length, 2, "Invoices plus the Ask row");
    assert.match(options[0], /Invoices/);
    assert.equal(container.querySelector('[role="status"]').textContent, "1 result");
    await type(input, "zzz");
    assert.equal(container.querySelector('[role="status"]').textContent, "0 results");
    await act(async () => {
      input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    assert.equal(asked, "zzz");
  });
});

describe("DropdownMenu radio groups, keycaps and typeahead", { skip }, () => {
  async function openMenu(groups) {
    const container = await mount(h(DropdownMenu, { trigger: "Account", groups }));
    const trigger = container.querySelector("button");
    await act(async () => trigger.click());
    return [...document.querySelectorAll('[role="menu"]')].pop();
  }

  test("selection=radio renders menuitemradio with aria-checked", async () => {
    const panel = await openMenu([
      {
        heading: "Workspaces",
        selection: "radio",
        items: [
          { id: "a", label: "Agentix", selected: true },
          { id: "n", label: "Northwind Labs", selected: false },
        ],
      },
    ]);
    const radios = panel.querySelectorAll('[role="menuitemradio"]');
    assert.equal(radios.length, 2);
    assert.equal(radios[0].getAttribute("aria-checked"), "true");
    assert.equal(radios[1].getAttribute("aria-checked"), "false");
  });

  test("shortcut chips and aria-keyshortcuts on menu items", async () => {
    const panel = await openMenu([{ items: [{ id: "p", label: "Profile", shortcut: "⇧⌘P" }] }]);
    const item = panel.querySelector('[role="menuitem"]');
    assert.equal(item.getAttribute("aria-keyshortcuts"), "Shift+Meta+P");
    assert.equal(item.querySelectorAll("kbd").length, 3);
  });

  test("typing a letter moves focus to the next matching item", async () => {
    const panel = await openMenu([
      {
        items: [
          { id: "edit", label: "Edit" },
          { id: "share", label: "Share" },
          { id: "delete", label: "Delete" },
          { id: "send", label: "Send reminder" },
        ],
      },
    ]);
    const press = (key, timeStamp) =>
      act(async () => {
        const target = document.activeElement ?? panel;
        const event = new window.KeyboardEvent("keydown", { key, bubbles: true });
        Object.defineProperty(event, "timeStamp", { value: timeStamp });
        target.dispatchEvent(event);
      });
    await press("s", 1000);
    assert.equal(document.activeElement?.dataset.id, "share");
    await press("e", 1100);
    assert.equal(document.activeElement?.dataset.id, "send", "prefix 'se'");
    await press("d", 3000);
    assert.equal(document.activeElement?.dataset.id, "delete");
  });
});
