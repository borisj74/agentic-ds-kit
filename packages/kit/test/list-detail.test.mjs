/**
 * ListDetailPattern: single selection beside the detail, Empty when nothing is open, one URL per record (hash),
 * filter and search counts, and below 640 the drill to a full-page detail whose Back returns focus to the row.
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
const dir = join(here, "../patterns/ListDetailPattern");
const kitUi = pathToFileURL(join(here, "../dist/ui/")).href;
const out = mkdtempSync(join(tmpdir(), "list-detail-"));

let dom;
let h;
let act;
let createRoot;
let Pattern;
let narrow = false;
const mounted = [];

function transpile(file, target) {
  const source = readFileSync(join(dir, file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, verbatimModuleSyntax: false },
  });
  const code = outputText
    .replace(/^import "\.\/[\w-]+\.css";$/m, "")
    .replace(/from "\.\.\/\.\.\/ui\/(\w+)"/g, (_, name) => `from "${new URL(`${name}/${name}.js`, kitUi).href}"`)
    .replace(/from "\.\/list-detail-data"/g, 'from "./list-detail-data.mjs"')
    .replace(/from "(react(?:\/jsx-runtime)?|lucide-react)"/g, (_, name) => `from "${import.meta.resolve(name)}"`);
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
  // Narrow (below --grid-breakpoint-sm) follows the `narrow` flag the tests set before each render.
  window.matchMedia = () => ({ matches: narrow, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  globalThis.matchMedia = window.matchMedia;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}


before(async () => {
  if (skip) return;
  installDom();
  globalThis.CSS = { escape: (value) => String(value).replace(/[^\w-]/g, (c) => `\\${c}`) };
  const React = await import("react");
  h = React.createElement;
  act = React.act;
  ({ createRoot } = await import("react-dom/client"));
  transpile("list-detail-data.ts", "list-detail-data.mjs");
  transpile("ListDetailPattern.tsx", "ListDetailPattern.mjs");
  ({ ListDetailPattern: Pattern } = await import(pathToFileURL(join(out, "ListDetailPattern.mjs")).href));
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

async function render(props = {}, { phone = false, hash = "" } = {}) {
  narrow = phone;
  window.history.replaceState(null, "", `/${hash}`);
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
const rows = (container) => [...container.querySelectorAll('[aria-label="Invoices"] [role="option"], [aria-label="Invoices"] [role="listitem"]')];
const row = (container, customer) => rows(container).find((el) => el.getAttribute("aria-label").includes(customer));

async function click(el) {
  await act(async () => {
    el.focus();
    el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

async function goToHash(hash) {
  await act(async () => {
    window.history.pushState(null, "", hash ? `/${hash}` : "/");
    window.dispatchEvent(new window.HashChangeEvent("hashchange"));
  });
}

describe("ListDetailPattern", { skip }, () => {
  test("at 640 and up: a single-select listbox beside the open invoice", async () => {
    const view = await render({ selectedId: "INV-1842" });
    const list = view.container.querySelector('[role="listbox"][aria-label="Invoices"]');
    assert.ok(list, "list is a listbox named Invoices");
    const selected = [...list.querySelectorAll('[aria-selected="true"]')];
    assert.equal(selected.length, 1);
    assert.match(selected[0].getAttribute("aria-label"), /Northwind Traders/);
    assert.match(selected[0].getAttribute("aria-label"), /\$2,418\.00/);
    assert.equal(view.container.querySelector("h2")?.textContent, "INV-1842");
    assert.ok(button("Retry payment"), "the overdue invoice offers Retry payment");
    assert.match(view.container.textContent, /Total due\s*\$2,418\.00/);
    await view.unmount();
  });

  test("nothing open: Empty says so with the overdue count, and its button opens the oldest overdue", async () => {
    const view = await render();
    assert.match(view.container.textContent, /No invoice open/);
    assert.match(view.container.textContent, /Pick one from the list\. 14 of 48 are overdue\./);
    assert.equal(view.container.querySelector('[aria-selected="true"]'), null);
    await click(button("Open oldest overdue"));
    assert.equal(window.location.hash, "#INV-1821");
    assert.equal(view.container.querySelector("h2")?.textContent, "INV-1821");
    assert.equal(view.container.querySelector('[role="status"]')?.textContent, "INV-1821 open");
    await view.unmount();
  });

  test("one URL per record: clicking a row sets the hash, and a hash on load wins over selectedId", async () => {
    const view = await render({ selectedId: "INV-1842" });
    await click(row(view.container, "Kettle Analytics"));
    assert.equal(window.location.hash, "#INV-1838");
    assert.equal(view.container.querySelector("h2")?.textContent, "INV-1838");
    await view.unmount();
    const loaded = await render({ selectedId: "INV-1842" }, { hash: "#INV-1850" });
    assert.equal(loaded.container.querySelector("h2")?.textContent, "INV-1850");
    await goToHash("");
    assert.match(loaded.container.textContent, /No invoice open/);
    await loaded.unmount();
  });

  test("filter and search: counts in the segments and the Showing line match the rows", async () => {
    const view = await render();
    assert.equal(rows(view.container).length, 6);
    assert.match(view.container.textContent, /Showing 6 of 14 overdue/);
    await click(button("Paid 13"));
    assert.equal(rows(view.container).length, 2);
    assert.match(view.container.textContent, /Showing 2 of 13 paid/);
    await click(button("All 48"));
    const input = view.container.querySelector('input[type="search"]');
    await act(async () => {
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      set.call(input, "inv-186");
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    assert.equal(rows(view.container).length, 3);
    assert.match(view.container.textContent, /Showing 3 of 11/);
    await view.unmount();
  });

  test("below 640: rows drill to a full-page detail; Back goes to the list and focuses the row that was open", async () => {
    const view = await render({}, { phone: true });
    assert.equal(view.container.querySelector('[role="listbox"]'), null, "no selection on the phone list");
    const northwind = row(view.container, "Northwind Traders");
    await click(northwind.querySelector("button"));
    assert.equal(window.location.hash, "#INV-1842");
    assert.equal(rows(view.container).length, 0, "the list is gone");
    assert.equal(view.container.querySelector("h1")?.textContent, "INV-1842");
    const back = [...view.container.querySelectorAll("button")].find((b) => b.textContent.trim() === "Invoices");
    assert.ok(back, "a back button to Invoices");
    assert.equal(back.querySelector("svg") !== null, true, "with a chevron");
    await act(async () => {
      back.click();
      window.dispatchEvent(new window.HashChangeEvent("hashchange"));
    });
    const again = row(view.container, "Northwind Traders");
    assert.ok(again, "the list is back");
    assert.ok(document.activeElement === again, `focus is on ${document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.tagName}`);
    await view.unmount();
  });
});
