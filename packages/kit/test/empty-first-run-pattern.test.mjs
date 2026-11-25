/**
 * EmptyFirstRunPattern: Empty first-use with Create invoice (the one primary) and Try sample data,
 * the setup line, the create Modal and the sample-data Alert, with focus moves. The pattern and the
 * app-shell example are copy-in source (not in dist), so this transpiles both with TypeScript into a
 * temp folder inside the kit, points their ../../ui imports at the built kit (dist), and renders with
 * SSR and jsdom. `npm test` builds first.
 */
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { register } from "node:module";
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

const kitDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = mkdtempSync(join(kitDir, ".empty-first-run-test-"));

let h;
let act;
let render;
let createRoot;
let dom;
let EmptyFirstRunPattern;
const mounted = [];

const dist = (path) => pathToFileURL(join(kitDir, `dist/ui/${path}.js`)).href;

/** A ui folder's public names: every built file in dist/ui/<name> but the CSS module maps. */
function shim(name) {
  const dir = join(kitDir, `dist/ui/${name}`);
  const files = readdirSync(dir).filter((f) => f.endsWith(".js") && !f.endsWith(".module.js"));
  mkdirSync(join(out, "ui"), { recursive: true });
  const target = join(out, "ui", `${name}.mjs`);
  writeFileSync(target, files.map((f) => `export * from "${pathToFileURL(join(dir, f)).href}";`).join("\n"));
  return pathToFileURL(target).href;
}

/** Transpiles one pattern file into out/<folder>/index.mjs, with ui imports pointing at dist. */
function transpile(folder, file) {
  const source = readFileSync(join(kitDir, `patterns/${folder}/${file}.tsx`), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      verbatimModuleSyntax: false,
    },
  });
  const code = outputText
    .replace(/import\s+"\.\/\w+\.css";?/, "")
    .replace(/from "\.\.\/\.\.\/ui\/shared\/(\w+)"/g, (_, name) => `from "${dist(`shared/${name}`)}"`)
    .replace(/from "\.\.\/\.\.\/ui\/(\w+)"/g, (_, name) => `from "${shim(name)}"`)
    .replace(/from "\.\.\/(\w+Pattern)"/g, (_, name) => `from "../${name}/index.mjs"`);
  mkdirSync(join(out, folder), { recursive: true });
  const target = join(out, folder, "index.mjs");
  writeFileSync(target, code);
  return target;
}

before(async () => {
  const React = await import("react");
  h = React.createElement;
  act = React.act;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  if (!skip) {
    dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost/" });
    const { window } = dom;
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    window.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    for (const [key, value] of Object.entries({
      window,
      document: window.document,
      navigator: window.navigator,
      HTMLElement: window.HTMLElement,
      Node: window.Node,
      Element: window.Element,
      Event: window.Event,
      MouseEvent: window.MouseEvent,
      KeyboardEvent: window.KeyboardEvent,
      MutationObserver: window.MutationObserver,
      HTMLInputElement: window.HTMLInputElement,
      ResizeObserver: window.ResizeObserver,
      getComputedStyle: window.getComputedStyle.bind(window),
    })) {
      Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    }
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    ({ createRoot } = await import("react-dom/client"));
  }
  transpile("AppShellPattern", "AppShellPattern");
  ({ EmptyFirstRunPattern } = await import(pathToFileURL(transpile("EmptyFirstRunPattern", "EmptyFirstRunPattern")).href));
});

async function unmountAll() {
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
}


after(async () => {
  await unmountAll();
  dom?.window.close();
  rmSync(out, { recursive: true, force: true });
});

const ssr = (props = {}) => render(h(EmptyFirstRunPattern, props));

async function mount(props = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(h(EmptyFirstRunPattern, props)));
  return container;
}

const byText = (root, text) => [...root.querySelectorAll("button")].find((button) => button.textContent.trim() === text);

async function click(button) {
  await act(async () => button.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
}

describe("EmptyFirstRunPattern first run", () => {
  test("renders in main inside the shell nav: Invoices h1, Empty first-use, Create invoice then Try sample data", () => {
    const html = ssr();
    assert.match(html, /<nav/);
    assert.match(html, /<main[^>]*>/);
    assert.match(html, /<h1[^>]*>Invoices<\/h1>/);
    assert.match(html, />Northwind · billed in USD</);
    assert.match(html, />No invoices yet</);
    const create = html.indexOf(">Create invoice<");
    const sample = html.indexOf(">Try sample data<");
    const setup = html.indexOf(">Open setup<");
    assert.ok(create > 0 && create < sample && sample < setup, "Create invoice, Try sample data, Open setup");
    assert.ok(!html.includes("Sample data</p>"), "no sample Alert before it is asked for");
  });

  test("setup line: count and what's left, Open setup described by it; setup={null} hides it", () => {
    const html = ssr();
    assert.match(html, /Setup 3 of 5/);
    assert.match(html, />Tax rates and payments left</);
    const id = html.match(/<p id="([^"]+)" class="empty-first-run-pattern__setup-text"/)?.[1];
    assert.ok(id, "setup line has an id");
    assert.match(html, new RegExp(`aria-describedby="${id}"[^>]*>|aria-describedby="${id}"`));
    const done = ssr({ setup: null });
    assert.ok(!done.includes("Open setup"));
    assert.ok(!done.includes("Setup 3 of 5"));
  });
});

describe("EmptyFirstRunPattern interactions", { skip }, () => {
  test("Try sample data shows the Alert and Table, moves Create invoice to the header and focuses it; Clear goes back", async () => {
    const container = await mount();
    await click(byText(container, "Try sample data"));
    assert.match(container.innerHTML, /Sample data/);
    assert.match(container.innerHTML, /3 invoices, never sent or counted\./);
    assert.match(container.innerHTML, /Cobalt Labs/);
    assert.match(container.innerHTML, /Overdue · 6 days late/);
    assert.ok(!container.innerHTML.includes("No invoices yet"));
    const create = byText(container, "Create invoice");
    assert.ok(create.closest("header, [class*=pageHeader], .layout-header"), "Create invoice sits in the page header");
    assert.equal(document.activeElement, create);
    await click(byText(container, "Clear sample data"));
    assert.match(container.innerHTML, /No invoices yet/);
    assert.equal(document.activeElement, byText(container, "Create invoice"));
  });

  test("Create draft with no customer shows a Field error; with a typed name it calls onCreate and lists the draft", async () => {
    const created = [];
    const container = await mount({ onCreate: (invoice) => created.push(invoice) });
    await click(byText(container, "Create invoice"));
    const dialog = document.querySelector('[role="dialog"]');
    assert.ok(dialog, "Modal opens");
    assert.match(dialog.textContent, /New invoice/);
    assert.match(dialog.textContent, /No customers yet\. Type a name to add one\./);
    await click(byText(document.body, "Create draft"));
    assert.match(document.body.textContent, /Enter a customer name\./);
    assert.equal(created.length, 0);

    const input = document.querySelector('[role="dialog"] input[role="combobox"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    await act(async () => {
      setter.call(input, "Northwind Traders");
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await click(byText(document.body, "Create draft"));
    assert.equal(created.length, 1);
    assert.equal(created[0].customer, "Northwind Traders");
    assert.equal(created[0].plan, "scale-annual");
    assert.equal(created[0].dueDate, "2026-12-21");
    assert.ok(!document.querySelector('[role="dialog"]'), "Modal closes");
    assert.match(container.innerHTML, /Draft · due Dec 21/);
    assert.ok(!container.innerHTML.includes("Sample data"), "a real draft has no sample Alert");
  });

  test("while the Modal is open, Create invoice is outline so Create draft is the only solid primary", async () => {
    const container = await mount();
    const create = byText(container, "Create invoice");
    const before = create.outerHTML;
    await click(create);
    assert.notEqual(byText(container, "Create invoice").outerHTML, before);
    // Close it: an open Modal left behind would take the next test's Escape.
    await click(byText(document.body, "Cancel"));
    assert.ok(!document.querySelector('[role="dialog"]'));
  });

  test("Escape in the closed Customer field closes the Modal and returns focus to Create invoice", async () => {
    const container = await mount();
    // A real click focuses the button first; the Modal returns focus to it.
    byText(container, "Create invoice").focus();
    await click(byText(container, "Create invoice"));
    const input = document.querySelector('[role="dialog"] input[role="combobox"]');
    input.focus();
    const esc = new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    await act(async () => input.dispatchEvent(esc));
    assert.ok(!document.querySelector('[role="dialog"]'), "Modal closes");
    assert.equal(document.activeElement, byText(container, "Create invoice"));
  });
});
