/**
 * BillingSchedulePattern: next-charge Card, the failure Alert, Upcoming and Billed as two kit Tables
 * with icon row actions, the edit Drawer and the Skip AlertDialog, with focus moves. The pattern is
 * copy-in source (not in dist), so this transpiles it with TypeScript into a temp folder inside the
 * kit, points its ../../ui imports at the built kit (dist), and renders with SSR and jsdom.
 * `npm test` builds first.
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
const out = mkdtempSync(join(kitDir, ".billing-schedule-test-"));

let h;
let act;
let render;
let createRoot;
let dom;
let BillingSchedulePattern;
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
      FocusEvent: window.FocusEvent,
      CSS: window.CSS ?? { escape: (value) => String(value).replace(/["\\]/g, "\\$&") },
      requestAnimationFrame: window.requestAnimationFrame.bind(window),
      cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
    })) {
      Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    }
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    ({ createRoot } = await import("react-dom/client"));
  }
  // The data file is plain TS next to the pattern: transpile it too and point the import at it.
  const data = readFileSync(join(kitDir, "patterns/BillingSchedulePattern/billing-schedule-data.ts"), "utf8");
  mkdirSync(join(out, "BillingSchedulePattern"), { recursive: true });
  writeFileSync(
    join(out, "BillingSchedulePattern", "billing-schedule-data.mjs"),
    ts.transpileModule(data, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText,
  );
  const target = transpile("BillingSchedulePattern", "BillingSchedulePattern");
  writeFileSync(target, readFileSync(target, "utf8").replace('from "./billing-schedule-data"', 'from "./billing-schedule-data.mjs"'));
  ({ BillingSchedulePattern } = await import(pathToFileURL(target).href));
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

const ssr = (props = {}) => render(h(BillingSchedulePattern, props));

async function mount(props = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(h(BillingSchedulePattern, props)));
  return container;
}

const byText = (root, text) => [...root.querySelectorAll("button")].find((button) => button.textContent.trim() === text);
const byLabel = (root, label) => root.querySelector(`button[aria-label="${label}"]`);

async function click(button) {
  await act(async () => button.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
}

/** Lets the pattern's requestAnimationFrame focus move run. */
async function frame() {
  await act(async () => new Promise((resolve) => setTimeout(resolve, 50)));
}

describe("BillingSchedulePattern desktop", () => {
  test("two kit Tables, Upcoming oldest first with its total, Billed newest first", () => {
    const html = ssr();
    assert.match(html, /<h3[^>]*>Upcoming<span[^>]*>next 60 days<\/span><\/h3>/);
    assert.match(html, /<h3[^>]*>Billed<span[^>]*>last 60 days<\/span><\/h3>/);
    assert.match(html, /aria-label="Upcoming"/);
    assert.match(html, /aria-label="Billed"/);
    assert.match(html, /Total, next 60 days, retry included/);
    assert.match(html, /\$8,172\.00/);
    const upcoming = html.slice(html.indexOf('aria-label="Upcoming"'), html.indexOf('aria-label="Billed"'));
    assert.ok(upcoming.indexOf(">24 Nov 2026<") < upcoming.indexOf(">01 Jan 2027<"), "Upcoming is oldest first");
    const billed = html.slice(html.indexOf('aria-label="Billed"'));
    assert.ok(billed.indexOf(">18 Nov 2026<") < billed.indexOf(">15 Oct 2026<"), "Billed is newest first");
    assert.equal((html.match(/>Next charge</g) ?? []).length, 1, "one Next charge marker, on the first scheduled row");
    assert.ok(upcoming.indexOf(">Next charge<") < upcoming.indexOf("API calls over 2M"), "the marker sits on 01 Dec Scale plan");
    assert.match(upcoming, /24 seats(?:<!-- -->)? <span[^>]*>Next charge</, "a space before the marker, so copied text reads \"24 seats Next charge\"");
    assert.ok(!html.includes('aria-label="Next charge"'), "no next-charge Card beside the tables");
    assert.ok(!html.includes(">Invoice<"), "four columns: Date, Description, Status, Amount");
  });

  test("status is a word with an icon; pencil only on scheduled rows, Download names its invoice", () => {
    const html = ssr({ onDownloadInvoice: () => {} });
    for (const word of ["Upcoming", "Retrying", "Invoiced", "Failed", "Paid"]) assert.match(html, new RegExp(`>${word}<`));
    const wide = html.slice(0, html.indexOf("billing-schedule-pattern__narrow"));
    const narrow = html.slice(html.indexOf("billing-schedule-pattern__narrow"));
    assert.equal((wide.match(/aria-label="Edit [^"]+"/g) ?? []).length, 4, "four scheduled rows, no pencil on the retry");
    assert.equal((narrow.match(/aria-label="Edit [^"]+"/g) ?? []).length, 4, "the phone list has the same four pencils");
    assert.match(html, /aria-label="Edit Onboarding part 2 of 3, 15 Dec 2026"/);
    assert.ok(!html.includes('aria-label="Edit Retry'));
    assert.match(html, /aria-label="Download INV-1866"/);
    assert.ok(!html.includes('aria-label="Actions for row'), "rows are named by their date");
  });

  test("failure Alert names invoice, amount and what happens next; Update card is the only solid primary, Change card hides", () => {
    const html = ssr({ onUpdateCard: () => {}, onChangeCard: () => {} });
    assert.match(html, /role="alert"/);
    assert.match(html, /INV-1842 failed on 04 Nov 2026 · \$2,418\.00/);
    assert.match(html, /Next retry is 24 Nov 2026, the last on 01 Dec 2026\. Then the plan pauses\./);
    assert.match(html, />Update card</);
    assert.ok(!html.includes(">Change card<"), "Change card hides while Update card shows");
    const paid = ssr({ charges: [], onChangeCard: () => {} });
    assert.match(paid, /No charges yet/);
  });

  test("below 40rem the same charges are a ListView grouped by month with month totals, then Billed", () => {
    const html = ssr({ onDownloadInvoice: () => {} });
    const narrow = html.slice(html.indexOf("billing-schedule-pattern__narrow"));
    for (const text of ["November", "December", "January", "$2,418.00", "$3,738.00", "15 Dec 2026 · INV-1879", "Retrying"]) {
      assert.ok(narrow.includes(text), text);
    }
    assert.ok(narrow.indexOf(">November<") < narrow.indexOf(">December<"));
    assert.match(narrow, /aria-label="Download INV-1830"/);
  });

  test("nextOnly: the next-charge Card shows the figure, its lines, the draft invoice and Change card", () => {
    const html = ssr({ nextOnly: true, onChangeCard: () => {} });
    assert.match(html, /Next charge on 01 Dec 2026/);
    assert.match(html, />Change card</);
    assert.ok(!html.includes('aria-label="Upcoming"'), "no tables in nextOnly");
    assert.match(html, />\$2,238\.00</);
    assert.match(html, /API calls over 2M · estimate/);
    assert.match(html, /Goes on INV-1871 · draft/);
    assert.match(html, />2 lines</);
  });

  test("summary mode still renders two columns and View all for the Settings Billing page", () => {
    const html = ssr({ summary: true, onViewAll: () => {} });
    assert.match(html, />View all</);
    assert.ok(!html.includes("Next charge on"));
    assert.ok(!/<h3[^>]*>Upcoming/.test(html), "no Upcoming table heading in summary");
    assert.match(html, />24 Nov 2026</);
  });
});

describe("BillingSchedulePattern edit", { skip }, () => {
  test("pencil opens the Drawer on Charge date; Save sends the edit, closes, says so and focuses the row's pencil", async () => {
    const saved = [];
    const container = await mount({ onSaveCharge: (id, edit) => saved.push({ id, edit }) });
    const pencil = byLabel(container, "Edit Onboarding part 2 of 3, 15 Dec 2026");
    pencil.focus();
    await click(pencil);
    const dialog = document.querySelector('[role="dialog"]');
    assert.ok(dialog, "Drawer opens");
    assert.match(dialog.textContent, /Onboarding · part 2 of 3/);
    assert.match(dialog.textContent, /INV-1879 · was 15 Dec 2026/);
    assert.match(dialog.textContent, /This and part 3 on 15 Jan 2027/);
    assert.ok(document.activeElement?.closest("[role=dialog]"), "focus is inside the Drawer");

    const amount = dialog.querySelector('input[role="spinbutton"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    await act(async () => {
      amount.focus();
      setter.call(amount, "1250");
      amount.dispatchEvent(new window.Event("input", { bubbles: true }));
      amount.dispatchEvent(new window.FocusEvent("blur", { bubbles: false }));
      amount.dispatchEvent(new window.FocusEvent("focusout", { bubbles: true }));
    });
    await click(byText(document.body, "Save changes"));
    await frame();
    assert.equal(saved.length, 1);
    assert.equal(saved[0].id, "onboarding-2");
    assert.deepEqual(saved[0].edit, { date: "2026-12-15", amount: 1250, scope: "this" });
    assert.ok(!document.querySelector('[role="dialog"]'), "Drawer closes");
    assert.match(container.innerHTML, /\$1,250\.00/);
    assert.match(container.querySelector('[role="status"]').textContent, /Moved to 15 Dec 2026/);
    assert.ok(document.activeElement === byLabel(container, "Edit Onboarding part 2 of 3, 15 Dec 2026"), "focus: " + document.activeElement?.getAttribute("aria-label"));
  });

  test("Escape closes the Drawer and returns focus to the pencil", async () => {
    const container = await mount();
    const pencil = byLabel(container, "Edit API calls over 2M, 01 Dec 2026");
    pencil.focus();
    await click(pencil);
    const esc = new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    await act(async () => document.activeElement.dispatchEvent(esc));
    assert.ok(!document.querySelector('[role="dialog"]'), "Drawer closes");
    assert.ok(document.activeElement === byLabel(container, "Edit API calls over 2M, 01 Dec 2026"), "focus: " + document.activeElement?.getAttribute("aria-label"));
  });

  test("Skip this month asks once in an AlertDialog, then drops the row and calls onSkipCharge", async () => {
    const skipped = [];
    const container = await mount({ onSkipCharge: (id) => skipped.push(id) });
    const pencil = byLabel(container, "Edit Scale plan 24 seats, 01 Jan 2027");
    pencil.focus();
    await click(pencil);
    await click(byText(document.body, "Skip this month"));
    const alert = document.querySelector('[role="alertdialog"]');
    assert.ok(alert, "AlertDialog opens");
    assert.match(alert.textContent, /Skip the 01 Jan 2027 charge\?/);
    assert.equal(skipped.length, 0, "nothing skipped before the confirm");
    await click(byText(document.body, "Skip charge"));
    await frame();
    assert.deepEqual(skipped, ["jan-plan"]);
    assert.ok(!document.querySelector('[role="alertdialog"]'));
    assert.ok(!byLabel(container, "Edit Scale plan 24 seats, 01 Jan 2027"), "the row is gone");
    assert.match(container.querySelector('[role="status"]').textContent, /Skipped Scale plan · 24 seats, 01 Jan 2027/);
    assert.ok(document.activeElement === container.querySelector('[data-charge-table="upcoming"]'), "focus: " + document.activeElement?.getAttribute("aria-label"));
  });
});
