/**
 * Modal and Drawer redesign: the shared ModalCard header and footer (eyebrow, tone word, footerStart),
 * focus on the first field (not Close), AlertDialog confirmText and consequences, the inert page,
 * and focus restore when the opener is gone. Runs against the built kit (dist); `npm test` builds first.
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
  for (const name of ["Modal", "Drawer", "AlertDialog", "ModalCard", "Button"]) {
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

function Open({ kind, props, children }) {
  const [open, setOpen] = useState(true);
  const close = () => setOpen(false);
  if (kind === "AlertDialog") return h(kit.AlertDialog, { open, onCancel: close, onAction: close, ...props });
  return h(kit[kind], { open, onClose: close, ...props }, children);
}

const fields = () => [h("label", { key: "l", htmlFor: "due" }, "Due date"), h("input", { key: "i", id: "due" })];
const ask = () => h(kit.Button, { appearance: "outline", mode: "neutral", size: "sm", iconStart: "MessageCircle" }, "Ask about this");

describe("shared header and footer", { skip }, () => {
  for (const kind of ["Modal", "Drawer"]) {
    test(`${kind}: h2 title, eyebrow with tone word, footerStart before the actions, focus on the first field`, async () => {
      const view = await render(
        h(Open, {
          kind,
          props: {
            title: "Edit invoice INV-2042",
            description: "Change the due date or the amount.",
            eyebrow: "Invoices",
            tone: "warning",
            footerStart: ask(),
            footer: h(kit.Button, { size: "sm" }, "Save changes"),
          },
          children: fields(),
        }),
      );
      const dialog = document.querySelector('[role="dialog"]');
      const heading = dialog.querySelector("h2");
      assert.equal(heading.textContent, "Edit invoice INV-2042");
      assert.equal(dialog.getAttribute("aria-labelledby"), heading.id);
      assert.ok(dialog.textContent.includes("Warning · Invoices"), "tone word comes before the eyebrow");
      assert.equal(document.activeElement, dialog.querySelector("#due"), "focus starts on the first field, not Close");
      const buttons = [...dialog.querySelectorAll('[data-part="footer"] button')].map((b) => b.textContent);
      assert.deepEqual(buttons, ["Ask about this", "Save changes"], "footerStart comes first in the footer");
      await view.unmount();
    });
  }

  test("Modal with no field focuses the dialog itself", async () => {
    const view = await render(h(Open, { kind: "Modal", props: { title: "Plan details" }, children: h("p", null, "Pro, $49 a month.") }));
    assert.equal(document.activeElement, document.querySelector('[role="dialog"]'));
    await view.unmount();
  });

  test("standalone ModalCard: neutral eyebrow has no status word", async () => {
    const view = await render(h(kit.ModalCard, { title: "Edit invoice", eyebrow: "Billing · Invoices" }));
    const card = view.container.querySelector('[role="group"]');
    assert.ok(card.textContent.startsWith("Billing · Invoices"));
    assert.ok(!card.textContent.includes("Info"));
    await view.unmount();
  });
});

describe("AlertDialog", { skip }, () => {
  test("composes ModalCard: alertdialog, no Close, focus on Cancel, consequences as text", async () => {
    const view = await render(
      h(Open, {
        kind: "AlertDialog",
        props: {
          title: "Disconnect Stripe?",
          description: "Syncing stops right away.",
          tone: "warning",
          eyebrow: "Integrations",
          consequences: ["Invoices already in the ledger stay.", "You can reconnect later."],
          cancelLabel: "Keep connected",
          actionLabel: "Disconnect",
          actionVariant: "danger",
          size: "sm",
        },
      }),
    );
    const dialog = document.querySelector('[role="alertdialog"]');
    assert.equal(dialog.getAttribute("aria-modal"), "true");
    assert.equal(dialog.querySelector("h2").textContent, "Disconnect Stripe?");
    assert.ok(![...dialog.querySelectorAll("button")].some((b) => b.getAttribute("aria-label") === "Close"), "no Close");
    assert.equal(document.activeElement.textContent, "Keep connected");
    assert.deepEqual([...dialog.querySelectorAll("li")].map((li) => li.textContent), ["Invoices already in the ledger stay.", "You can reconnect later."]);
    assert.ok(dialog.textContent.includes("Warning · Integrations"));
    await view.unmount();
  });

  test("confirmText: focus starts in the field and the action waits for a match", async () => {
    const view = await render(
      h(Open, {
        kind: "AlertDialog",
        props: { title: "Delete workspace?", description: "This cannot be undone.", actionLabel: "Delete workspace", actionVariant: "danger", confirmText: "northwind" },
      }),
    );
    const dialog = document.querySelector('[role="alertdialog"]');
    const input = dialog.querySelector("input");
    const action = [...dialog.querySelectorAll("button")].find((b) => b.textContent === "Delete workspace");
    assert.equal(document.activeElement, input, "focus starts in the type-to-confirm field");
    assert.ok(dialog.querySelector(`label[for="${input.id}"]`).textContent.includes("northwind"), "field is labelled");
    assert.ok(action.disabled, "action is off until it matches");
    const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    await act(async () => {
      setValue.call(input, "northx");
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    assert.equal(input.getAttribute("aria-invalid"), "true", "a typo is invalid");
    assert.ok(action.disabled);
    await act(async () => {
      setValue.call(input, "northwind");
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    assert.ok(!action.disabled, "action turns on when it matches");
    await view.unmount();
  });
});

describe("page lock and focus restore", { skip }, () => {
  test("the page behind is inert while open and comes back on close", async () => {
    const page = document.createElement("main");
    page.innerHTML = "<h1>Invoices</h1>";
    document.body.appendChild(page);
    const view = await render(h(Open, { kind: "Drawer", props: { title: "INV-2042" }, children: fields() }));
    assert.ok(page.hasAttribute("inert"), "page is inert");
    assert.ok(!document.querySelector('[role="dialog"]').closest("[inert]"), "the dialog is not");
    await press("Escape");
    assert.ok(!page.hasAttribute("inert"), "inert is removed");
    await view.unmount();
    page.remove();
  });

  test("focus goes to the page heading when the opener is gone", async () => {
    const page = document.createElement("main");
    page.innerHTML = '<h1>Invoices</h1><button type="button">Edit</button>';
    document.body.appendChild(page);
    const opener = page.querySelector("button");
    opener.focus();
    const view = await render(h(Open, { kind: "Modal", props: { title: "Edit invoice" }, children: fields() }));
    opener.remove();
    await press("Escape");
    assert.equal(document.activeElement, page.querySelector("h1"));
    await view.unmount();
    page.remove();
  });
});
