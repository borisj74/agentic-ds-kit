/**
 * SettingsFormPattern: the SaveBar names the unsaved fields, Save with a bad VAT number shows a summary Alert
 * that takes focus and jumps to the field, a good Save stamps "Saved at", Discard asks first in an AlertDialog,
 * and leaving through the page header with changes asks first.
 * The pattern is copy-in source (not in dist): this transpiles it with TypeScript into a temp folder and points
 * its kit imports at the built kit (dist), so `npm test` builds first.
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { after, before, describe, test } from "node:test";
import ts from "typescript";

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

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "../patterns/SettingsFormPattern");
const kitUi = pathToFileURL(join(here, "../dist/ui/")).href;
const out = mkdtempSync(join(tmpdir(), "settings-form-"));

let dom;
let h;
let act;
let createRoot;
let Pattern;
const mounted = [];

function transpile(file, target) {
  const source = readFileSync(join(dir, file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, verbatimModuleSyntax: false },
  });
  const code = outputText
    .replace(/^import "\.\/[\w-]+\.css";$/m, "")
    .replace(/from "\.\.\/\.\.\/ui\/(\w+)"/g, (_, name) => `from "${new URL(`${name}/${name}.js`, kitUi).href}"`)
    .replace(/from "\.\/settings-form-data"/g, 'from "./settings-form-data.mjs"')
    .replace(/from "(react(?:\/jsx-runtime)?)"/g, (_, name) => `from "${import.meta.resolve(name)}"`);
  writeFileSync(join(out, target), code);
}

function installDom() {
  dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost/" });
  const { window } = dom;
  const globals = {
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    HTMLInputElement: window.HTMLInputElement,
    HTMLButtonElement: window.HTMLButtonElement,
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
  transpile("settings-form-data.ts", "settings-form-data.mjs");
  transpile("SettingsFormPattern.tsx", "SettingsFormPattern.mjs");
  ({ SettingsFormPattern: Pattern } = await import(pathToFileURL(join(out, "SettingsFormPattern.mjs")).href));
});

after(async () => {
  rmSync(out, { recursive: true, force: true });
  if (skip) return;
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
  document.body.innerHTML = "";
  dom.window.close();
});

async function render(props) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(h(Pattern, props)));
  return {
    container,
    async unmount() {
      await act(async () => root.unmount());
      mounted.splice(mounted.indexOf(root), 1);
      container.remove();
    },
  };
}

const button = (name) => [...document.querySelectorAll("button")].find((el) => el.textContent.trim() === name);

async function click(el) {
  await act(async () => {
    el.focus();
    el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

async function press(key) {
  await act(async () => {
    (document.activeElement ?? document.body).dispatchEvent(new window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });
}

const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 50)));

async function type(input, value) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

const status = (container) => container.querySelector('[role="region"] [role="status"]')?.textContent ?? "";
const vat = (container) => [...container.querySelectorAll("input")].find((el) => el.value.startsWith("GB"));

describe("SettingsFormPattern", { skip }, () => {
  test("groups are fieldsets with the side layout, and the description is linked", async () => {
    const view = await render({});
    const sets = [...view.container.querySelectorAll("fieldset")];
    assert.deepEqual(sets.map((el) => el.querySelector("legend").textContent), ["Company", "Billing address", "Currency and invoices"]);
    for (const set of sets) {
      assert.ok(set.getAttribute("data-layout") === "side");
      const described = document.getElementById(set.getAttribute("aria-describedby"));
      assert.ok(described && set.contains(described), "description is linked with aria-describedby");
    }
    await view.unmount();
  });

  test("the demo opens dirty: two Edited fields, Was hints, and the bar names them", async () => {
    const view = await render({});
    const text = view.container.textContent;
    assert.match(text, /Was “Northwind Traders Ltd”\./);
    assert.match(text, /Was USD\. Applies from INV-1843/);
    assert.match(status(view.container), /2 unsaved changes/);
    assert.match(text, /Legal name, Invoice currency · last saved Nov 14 by Maya Chen/);
    const solid = [...view.container.querySelectorAll("button")].filter((el) => el.textContent.trim() === "Save changes");
    assert.ok(solid.length === 1, "one Save");
    await view.unmount();
  });

  test("Save with a short VAT number: summary Alert takes focus, its Button moves focus to VAT, the bar says what to fix", async () => {
    let saved = 0;
    const view = await render({ onSave: () => saved++ });
    await type(vat(view.container), "GB12345678");
    await click(button("Save changes"));
    await settle();
    const alert = view.container.querySelector('[role="alert"]');
    assert.ok(alert, "summary Alert renders");
    assert.ok(document.activeElement === alert, "summary Alert has focus");
    assert.match(alert.textContent, /Not saved\. Fix 1 field first/);
    assert.match(view.container.textContent, /Add one more digit\. UK VAT numbers have 9 after GB\./);
    assert.match(view.container.textContent, /GB and 9 digits\. We check it with HMRC when you save\./, "hint stays under the error");
    assert.match(status(view.container), /Not saved · 1 field to fix/);
    assert.ok(saved === 0);
    await click(button("Go to VAT number"));
    assert.ok(document.activeElement === vat(view.container), "focus moved to VAT number");
    // Fixing the field clears the error and the summary.
    await type(vat(view.container), "GB123456789");
    assert.ok(!view.container.querySelector('[role="alert"]'));
    await view.unmount();
  });

  test("a good Save stamps the time and clears the Edited marks", async () => {
    let saved = 0;
    const view = await render({ onSave: () => saved++ });
    await click(button("Save changes"));
    assert.ok(saved === 1);
    assert.match(status(view.container), /^Saved at \d{2}:\d{2}$/);
    assert.doesNotMatch(view.container.textContent, /Edited/);
    assert.ok(!button("Discard"), "Discard hides when saved");
    await view.unmount();
  });

  test("Discard asks first: Escape keeps editing; Discard changes restores the saved values", async () => {
    let cancelled = 0;
    const view = await render({ onCancel: () => cancelled++ });
    await click(button("Discard"));
    await settle();
    let dialog = document.querySelector('[role="alertdialog"]');
    assert.ok(dialog, "AlertDialog opens");
    assert.match(dialog.textContent, /Discard 2 changes\?/);
    assert.ok(document.activeElement?.textContent.trim() === "Keep editing");
    await press("Escape");
    await settle();
    assert.ok(!document.querySelector('[role="alertdialog"]'));
    assert.match(status(view.container), /2 unsaved changes/);
    await click(button("Discard"));
    await settle();
    await click(button("Discard changes"));
    await settle();
    assert.ok(cancelled === 1);
    assert.match(status(view.container), /^Saved at Nov 14$/);
    assert.ok([...view.container.querySelectorAll("input")].some((el) => el.value === "Northwind Traders Ltd"));
    await view.unmount();
  });

  test("leaving through the breadcrumb with changes asks first, then lets the click through", async () => {
    let left = 0;
    const view = await render({ breadcrumbs: [{ label: "Workspace", onClick: () => left++ }, { label: "Billing details" }] });
    const crumb = [...view.container.querySelectorAll("header button, header a")].find((el) => el.textContent.trim() === "Workspace");
    await click(crumb);
    await settle();
    assert.ok(left === 0, "the click is held");
    const dialog = document.querySelector('[role="alertdialog"]');
    assert.match(dialog.textContent, /Leave without saving\?/);
    assert.match(dialog.textContent, /2 changes will be lost: Legal name and Invoice currency\./);
    await click(button("Discard and leave"));
    await settle();
    assert.ok(left === 1, "the held click goes through");
    await view.unmount();
  });
});
