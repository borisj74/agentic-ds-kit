/**
 * IntegrationSettingsPattern: last sync values, load error as a string and as { title, detail }, and the
 * Disconnect AlertDialog (Escape and Keep connected return focus to Disconnect; confirming calls onDisconnect).
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
const dir = join(here, "../patterns/IntegrationSettingsPattern");
const kitUi = pathToFileURL(join(here, "../dist/ui/")).href;
const out = mkdtempSync(join(tmpdir(), "integration-settings-"));

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
    .replace(/from "\.\/integration-settings-data"/g, 'from "./integration-settings-data.mjs"')
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
  transpile("integration-settings-data.ts", "integration-settings-data.mjs");
  transpile("IntegrationSettingsPattern.tsx", "IntegrationSettingsPattern.mjs");
  ({ IntegrationSettingsPattern: Pattern } = await import(pathToFileURL(join(out, "IntegrationSettingsPattern.mjs")).href));
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

describe("IntegrationSettingsPattern", { skip }, () => {
  test("lastSync shows its time, counts and next run", async () => {
    const view = await render({ lastSync: { at: "Yesterday 18:05", invoices: 12, payments: 7, next: "18:20" } });
    const values = [...view.container.querySelectorAll("dd")].map((dd) => dd.textContent);
    assert.deepEqual(values, ["Yesterday 18:05", "12 invoices, 7 payments", "18:20"]);
    await view.unmount();
  });

  test("provider tile sits in the Section head and the status Badge sits under the Connection title", async () => {
    const view = await render({ status: "error" });
    const head = view.container.querySelector("section > header");
    const tile = head.querySelector('[aria-hidden="true"] svg');
    assert.ok(tile, "Section icon tile renders an svg");
    assert.ok(head.querySelector("h2")?.textContent === "Stripe");
    const card = [...view.container.querySelectorAll("article")].find((el) => el.querySelector("h3")?.textContent === "Connection");
    const heading = card.querySelector("h3");
    assert.match(heading.nextElementSibling?.textContent ?? "", /Sync failed/);
    await view.unmount();
  });

  test("error as a string is the detail under the default title, with Retry inside the Alert", async () => {
    let retried = 0;
    const view = await render({ error: "The ledger timed out.", onRetry: () => retried++ });
    const text = view.container.textContent;
    assert.match(text, /Couldn’t load settings/);
    assert.match(text, /The ledger timed out\./);
    await click(button("Retry"));
    assert.equal(retried, 1);
    await view.unmount();
  });

  test("error as { title, detail } sets both", async () => {
    const view = await render({ error: { title: "Stripe is down", detail: "Try again in a few minutes." } });
    const text = view.container.textContent;
    assert.match(text, /Stripe is down/);
    assert.match(text, /Try again in a few minutes\./);
    assert.doesNotMatch(text, /Couldn’t load settings/);
    await view.unmount();
  });

  test("sync error: View N invoices matches the failed invoices in the detail", async () => {
    const view = await render({ status: "error", onViewErrors() {}, onRetry() {} });
    const text = view.container.textContent;
    const ids = text.match(/INV-\d+/g) ?? [];
    assert.ok(ids.length > 0);
    assert.ok(button(`View ${ids.length} invoices`), `expected "View ${ids.length} invoices"`);
    await view.unmount();
  });

  test("Disconnect: Escape and Keep connected return focus to Disconnect; confirming calls onDisconnect", async () => {
    let disconnected = 0;
    const view = await render({ onDisconnect: () => disconnected++ });
    const trigger = button("Disconnect…");
    assert.ok(trigger);

    await click(trigger);
    await settle();
    assert.equal(document.activeElement?.textContent.trim(), "Keep connected");
    await press("Escape");
    await settle();
    assert.equal(document.activeElement, trigger, "Escape returns focus to Disconnect");

    await click(trigger);
    await settle();
    await click(button("Keep connected"));
    await settle();
    assert.equal(document.activeElement, trigger, "Keep connected returns focus to Disconnect");
    assert.equal(disconnected, 0);

    await click(trigger);
    await settle();
    await click(button("Disconnect"));
    await settle();
    assert.equal(disconnected, 1);
    await view.unmount();
  });

  test("Disconnect stays usable while access is expired", async () => {
    const view = await render({ status: "needsReauth", onDisconnect() {}, onReconnect() {} });
    const trigger = button("Disconnect…");
    assert.ok(trigger);
    assert.equal(trigger.disabled, false);
    await view.unmount();
  });
});
