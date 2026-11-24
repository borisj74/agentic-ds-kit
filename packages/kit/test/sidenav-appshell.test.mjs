/**
 * Sidebar and AppShell nav redesign: SideNav rows render digit badges as Count, parents take no
 * page-active fill, controlled expanded, arrow keys through visible rows, the closed-rail flyout
 * (Escape, Left, outside press, pick), and the app-shell skip link, notifications Count and no dot.
 * Runs against the built kit (dist); `npm test` builds first.
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import { after, before, describe, test } from "node:test";
import { readFileSync as readFile } from "node:fs";

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
  kit = await import("../dist/ui/SideNav/SideNavBlocks.js");
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



function Nav({ open = true, items, footer }) {
  return h(
    kit.SideNavRoot,
    { "aria-label": "Northwind", open },
    h(kit.SideNavNav, null, h(kit.SideNavSection, { label: "Work" }, ...items)),
    footer ? h(kit.SideNavFooter, null, h(kit.SideNavSection, null, footer)) : null,
  );
}

const billing = (props = {}) =>
  h(
    kit.SideNavItem,
    { key: "billing", label: "Billing", icon: "CreditCard", ...props },
    h(kit.SideNavItem, { key: "inv", label: "Invoices", href: "/invoices", badge: "12", active: true }),
    h(kit.SideNavItem, { key: "pay", label: "Payments", href: "/payments" }),
    h(kit.SideNavItem, { key: "plans", label: "Plans", href: "/plans", disabled: true }),
  );

const home = () => h(kit.SideNavItem, { key: "home", label: "Home", icon: "House", href: "/" });
const notify = () => h(kit.SideNavItem, { key: "notify", label: "Notifications", icon: "Bell", badge: "3", onClick() {} });
const settings = () => h(kit.SideNavItem, { key: "settings", label: "Settings", icon: "Settings", href: "/settings" });

const byText = (root, text) =>
  Array.from(root.querySelectorAll("a, button")).find((node) => node.textContent.includes(text));

describe("SideNav rows", { skip }, () => {
  test("digit badges render as a kit Count, words keep the pill", async () => {
    const view = await render(
      h(Nav, {
        items: [notify(), h(kit.SideNavItem, { key: "beta", label: "Reports", href: "/r", badge: "Beta" })],
      }),
    );
    const isCount = (node) => /_count_/.test(node.className);
    const row = byText(view.container, "Notifications");
    const count = Array.from(row.querySelectorAll("span")).find(isCount);
    assert.ok(count, "Notifications row has a Count");
    assert.match(count.className, /_neutral_/);
    assert.match(count.className, /_subtle_/);
    assert.match(count.textContent, /3/);
    const reports = byText(view.container, "Reports");
    assert.equal(Array.from(reports.querySelectorAll("span")).some(isCount), false, "words are not a Count");
    assert.match(reports.textContent, /Beta/);
    await view.unmount();
  });

  test("a parent row never takes the page-active fill; the active leaf keeps aria-current", async () => {
    const view = await render(h(Nav, { items: [billing({ active: true })] }));
    const parent = byText(view.container, "Billing");
    const leaf = byText(view.container, "Invoices");
    assert.equal(leaf.getAttribute("aria-current"), "page");
    const leafActive = Array.from(leaf.classList).find((name) => /itemActive/.test(name));
    assert.ok(leafActive, "leaf has the active class");
    assert.ok(!parent.classList.contains(leafActive), "parent has no active fill class");
    assert.equal(parent.getAttribute("aria-expanded"), "true");
    await view.unmount();
  });

  test("the closed submenu is inert", async () => {
    const view = await render(h(Nav, { items: [billing({ defaultExpanded: false })] }));
    const leaf = byText(view.container, "Invoices");
    assert.ok(leaf.closest("[inert]"), "closed submenu rows are inert");
    await view.unmount();
  });

  test("controlled expanded follows the prop and reports clicks through onExpandedChange", async () => {
    const calls = [];
    function Controlled() {
      const [expanded, setExpanded] = useState(false);
      return h(Nav, {
        items: [
          billing({
            expanded,
            onExpandedChange(next) {
              calls.push(next);
              setExpanded(next);
            },
          }),
        ],
      });
    }
    const view = await render(h(Controlled));
    const parent = byText(view.container, "Billing");
    assert.equal(parent.getAttribute("aria-expanded"), "false");
    await act(async () => parent.click());
    assert.deepEqual(calls, [true]);
    assert.equal(byText(view.container, "Billing").getAttribute("aria-expanded"), "true");
    await view.unmount();
  });
});

describe("SideNav arrow keys", { skip }, () => {
  test("Down and Up move through visible rows, skipping disabled and closed rows; Home and End jump", async () => {
    const view = await render(h(Nav, { items: [home(), billing(), notify()], footer: settings() }));
    byText(view.container, "Home").focus();
    await press("ArrowDown");
    assert.match(document.activeElement.textContent, /Billing/);
    await press("ArrowDown");
    assert.match(document.activeElement.textContent, /Invoices/);
    await press("ArrowDown");
    assert.match(document.activeElement.textContent, /Payments/);
    await press("ArrowDown");
    assert.match(document.activeElement.textContent, /Notifications/, "disabled Plans is skipped");
    await press("ArrowUp");
    assert.match(document.activeElement.textContent, /Payments/);
    await press("End");
    assert.match(document.activeElement.textContent, /Settings/, "footer rows are included");
    await press("Home");
    assert.match(document.activeElement.textContent, /Home/);
    await view.unmount();
  });

  test("Left closes a parent, Right opens it then moves to its first child, Left on a child goes to the parent", async () => {
    const view = await render(h(Nav, { items: [home(), billing(), notify()] }));
    const parent = byText(view.container, "Billing");
    parent.focus();
    const left = await press("ArrowLeft");
    assert.equal(left.defaultPrevented, true);
    assert.equal(byText(view.container, "Billing").getAttribute("aria-expanded"), "false");
    await press("ArrowDown");
    assert.match(document.activeElement.textContent, /Notifications/, "closed children are skipped");
    await press("ArrowUp");
    await press("ArrowRight");
    assert.equal(byText(view.container, "Billing").getAttribute("aria-expanded"), "true");
    await press("ArrowRight");
    assert.match(document.activeElement.textContent, /Invoices/);
    await press("ArrowLeft");
    assert.match(document.activeElement.textContent, /Billing/);
    await view.unmount();
  });
});

describe("SideNav closed-rail flyout", { skip }, () => {
  const flyout = () => document.body.querySelector('[role="group"][aria-labelledby]');

  test("a parent icon opens a flyout of its children; Escape closes it and returns focus", async () => {
    const view = await render(h(Nav, { open: false, items: [home(), billing()] }));
    const parent = byText(view.container, "Billing");
    assert.equal(parent.getAttribute("aria-expanded"), "false");
    assert.ok(Array.from(parent.classList).some((name) => /itemHoldsCurrent/.test(name)), "parent holds the current page");
    parent.focus();
    await act(async () => parent.click());
    const panel = flyout();
    assert.ok(panel, "flyout is open");
    assert.equal(parent.getAttribute("aria-expanded"), "true");
    assert.equal(parent.getAttribute("aria-controls"), panel.id);
    assert.equal(document.getElementById(panel.getAttribute("aria-labelledby")).textContent, "Billing");
    assert.ok(!view.container.contains(panel), "the flyout is portaled outside the rail");
    assert.match(document.activeElement.textContent, /Invoices/, "focus starts on the first row");
    assert.equal(document.activeElement.getAttribute("aria-current"), "page");
    await press("ArrowDown");
    assert.match(document.activeElement.textContent, /Payments/);
    const escape = await press("Escape");
    assert.equal(escape.defaultPrevented, true);
    assert.equal(flyout(), null);
    assert.equal(document.activeElement, byText(view.container, "Billing"));
    await view.unmount();
  });

  test("Right opens it, Left closes it, an outside press closes it, a pick closes it", async () => {
    const view = await render(h(Nav, { open: false, items: [home(), billing()] }));
    byText(view.container, "Billing").focus();
    await press("ArrowRight");
    assert.ok(flyout());
    await press("ArrowLeft");
    assert.equal(flyout(), null);
    assert.match(document.activeElement.textContent, /Billing/);

    await press("ArrowRight");
    assert.ok(flyout());
    await act(async () => {
      document.body.dispatchEvent(new window.MouseEvent("pointerdown", { bubbles: true }));
    });
    assert.equal(flyout(), null, "outside press closes");

    byText(view.container, "Billing").focus();
    await press("ArrowRight");
    const pick = Array.from(flyout().querySelectorAll("a")).find((a) => a.textContent.includes("Payments"));
    await act(async () => {
      pick.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    assert.equal(flyout(), null, "a pick closes it");
    await view.unmount();
  });

  test("opening the rail closes the flyout", async () => {
    function Toggle() {
      const [open, setOpen] = useState(false);
      return h("div", null, h("button", { id: "open-rail", onClick: () => setOpen(true) }, "open"), h(Nav, { open, items: [billing()] }));
    }
    const view = await render(h(Toggle));
    await act(async () => byText(view.container, "Billing").click());
    assert.ok(flyout());
    await act(async () => view.container.querySelector("#open-rail").click());
    assert.equal(flyout(), null);
    await view.unmount();
  });
});

describe("app-shell pattern source", () => {
  const source = readFile(new URL("../patterns/AppShellPattern/AppShellPattern.tsx", import.meta.url), "utf8");
  const css = readFile(new URL("../patterns/AppShellPattern/AppShellPattern.css", import.meta.url), "utf8");

  test("the skip link comes before the shell and uses the skipToMain label", () => {
    assert.ok(source.indexOf("<SkipToMain") < source.indexOf('className={`layout-shell'));
    assert.match(source, /labels\.skipToMain/);
  });

  test("no unread dot; notifications tabs take a count and unread rows say Unread", () => {
    assert.doesNotMatch(source + css, /nav-dot/);
    assert.match(source, /count: count > 0 \? count : undefined/);
    assert.match(source, /meta: item\.read \? undefined : "Unread"/);
    assert.doesNotMatch(source, /\(\$\{count\}\)/);
  });

  test("quick actions use the Search icon at md", () => {
    assert.match(source, /size="md"\s+iconStart="Search"/);
    assert.doesNotMatch(source, /iconStart="Zap"/);
  });
});
