/**
 * BillingSchedulePattern: the Card header, one kit Table with the next charge highlighted, pill status
 * Badges, the failure Alert, the nextOnly panel, the edit Drawer and the Skip AlertDialog, with focus moves. The pattern is
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

/** Upcoming charges with a split fee, for the edit flow (the demo data has one scheduled charge). */
const EDIT_CHARGES = [
  { id: "dec", date: "2026-12-01", label: "Pro plan · monthly", amount: "$480.00", value: 480, status: "scheduled", invoice: "INV-0118" },
  {
    id: "onboarding-2",
    date: "2026-12-15",
    label: "Onboarding · part 2 of 3",
    amount: "$1,500.00",
    value: 1500,
    status: "scheduled",
    invoice: "INV-0120",
    splitLabel: "This and part 3 on 15 Jan 2027",
  },
  { id: "jan", date: "2027-01-01", label: "Pro plan · monthly", amount: "$480.00", value: 480, status: "scheduled", invoice: "INV-0121" },
  { id: "retry", date: "2026-11-24", label: "Retry of INV-0109", amount: "$480.00", value: 480, status: "retrying", invoice: "INV-0109" },
  { id: "nov", date: "2026-11-01", label: "Pro plan · monthly", amount: "$480.00", value: 480, status: "paid", invoice: "INV-0117" },
];

describe("BillingSchedulePattern", () => {
  test("a Card with the header: Calendar icon, Billing schedule, the plan and Download all", () => {
    const html = ssr({ onDownloadAll: () => {} });
    assert.match(html, /<article[^>]*billing-schedule-pattern__card/);
    assert.match(html, /<svg[^>]*billing-schedule-pattern__head-icon[^>]*aria-hidden="true"/);
    assert.match(html, /<h2[^>]*>Billing schedule<\/h2>/);
    assert.match(html, /billing-schedule-pattern__plan">Pro plan</);
    assert.match(html, />Download all</);
  });

  test("one Table: Date, Description, Status, Amount; upcoming first, then billed newest first", () => {
    const html = ssr();
    assert.equal((html.match(/<table/g) ?? []).length, 1, "one table");
    assert.match(html, /aria-label="Charges"/);
    const headers = [...html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => m[1].replace(/<[^>]+>/g, ""));
    assert.deepEqual(headers, ["Date", "Description", "Status", "Amount"]);
    const order = ["01 Dec 2026", "01 Nov 2026", "18 Oct 2026", "01 Oct 2026", "01 Sep 2026"].map((d) => html.indexOf(`>${d}<`));
    assert.deepEqual([...order].sort((a, b) => a - b), order, "01 Dec, then newest first");
    assert.ok(!html.includes("Total,"), "no total row");
  });

  test("the next charge is highlighted by its marker; a space before it; one marker only", () => {
    const html = ssr();
    assert.equal((html.match(/>Next charge</g) ?? []).length, 1);
    assert.match(html, /Pro plan · monthly(?:<!-- -->)? <span[^>]*billing-schedule-pattern__next-marker[^>]*>Next charge</);
    assert.match(html, /billing-schedule-pattern__date billing-schedule-pattern__date--next">01 Dec 2026</);
  });

  test("status is a word in a pill Badge with no icon; notes are muted, Card declined is danger", () => {
    const html = ssr();
    for (const word of ["Upcoming", "Paid", "Invoiced", "Failed", "Waived"]) assert.match(html, new RegExp(`>${word}<`));
    const statuses = [...html.matchAll(/billing-schedule-pattern__status">([\s\S]*?)<\/span><\/span>/g)].map((m) => m[1]);
    assert.equal(statuses.length, 5);
    assert.ok(statuses.every((badge) => !badge.includes("<svg")), "no icons in the Badges");
    assert.match(html, /billing-schedule-pattern__note">Prorated for 14 days</);
    assert.match(html, /billing-schedule-pattern__note">Credit applied</);
    assert.match(html, /billing-schedule-pattern__note billing-schedule-pattern__note--danger">Card declined</);
  });

  test("no row actions without handlers; pencil on scheduled rows with onSaveCharge, Download on billed rows with onDownloadInvoice", () => {
    assert.ok(!/aria-label="(Edit|Download) /.test(ssr()), "the board has no row actions");
    const html = ssr({ charges: EDIT_CHARGES, onSaveCharge: () => {}, onDownloadInvoice: () => {} });
    assert.equal((html.match(/aria-label="Edit [^"]+"/g) ?? []).length, 3, "three scheduled rows, no pencil on the retry");
    assert.match(html, /aria-label="Edit Onboarding part 2 of 3, 15 Dec 2026"/);
    assert.ok(!html.includes('aria-label="Edit Retry'));
    assert.match(html, /aria-label="Download INV-0117"/);
  });

  test("an open failed payment: Alert with amount and date, the retry sentence and Update card; Download all hides", () => {
    const html = ssr({ charges: [EDIT_CHARGES[4], ...ssrFailed()], onUpdateCard: () => {}, onDownloadAll: () => {} });
    assert.ok(!html.includes('role="alert"'), "a paid charge after the failure closes it");
    const failed = ssr({ charges: ssrFailed(), onUpdateCard: () => {}, onDownloadAll: () => {} });
    assert.match(failed, /role="alert"/);
    assert.match(failed, /\$480\.00 failed on 01 Oct 2026/);
    assert.match(failed, /We retry on 04 Oct 2026, so update it before then to keep the plan active\./);
    assert.match(failed, />Update card</);
    assert.ok(!failed.includes(">Download all<"), "Download all hides while the Alert shows");
    assert.ok(failed.indexOf('role="alert"') < failed.indexOf("<table"), "the Alert sits above the table");
  });

  test("nextOnly: the panel with Next charge on the date, the figure, Pays with and Change card; no table", () => {
    const html = ssr({ nextOnly: true, onChangeCard: () => {}, onDownloadAll: () => {} });
    assert.match(html, /aria-label="Next charge"/);
    assert.match(html, /Next charge on 01 Dec 2026/);
    assert.match(html, />\$480\.00</);
    assert.match(html, />Pays with</);
    assert.match(html, />Visa ending 4242</);
    assert.match(html, />Change card</);
    assert.ok(!html.includes("<table"), "no table in nextOnly");
    assert.ok(!html.includes(">Download all<"));
  });

  test("empty, loading and error", () => {
    const empty = ssr({ charges: [] });
    assert.match(empty, /No charges yet/);
    assert.match(empty, /Your first charge shows here when the trial ends on 14 Dec 2026/);
    const loading = ssr({ loading: true });
    assert.match(loading, /aria-busy="true"/);
    assert.match(loading, /<th[^>]*>Date<\/th>/);
    const error = ssr({ error: "Check your connection, then try again", onRetry: () => {} });
    assert.match(error, /role="alert"/);
    assert.match(error, /Couldn’t load the billing schedule/);
    assert.match(error, /<button[^>]*>(?:(?!<\/button>)[\s\S])*lucide-rotate-ccw(?:(?!<\/button>)[\s\S])*Retry<\/span><\/button>/, "Retry has the RotateCcw icon");
  });

  test("summary mode still renders two columns and View all for the Settings Billing page", () => {
    const html = ssr({ summary: true, onViewAll: () => {} });
    assert.match(html, />View all</);
    assert.ok(!html.includes("Next charge on"));
    assert.match(html, />01 Dec 2026</);
  });
});

function ssrFailed() {
  return [
    { id: "seat", date: "2026-10-18", label: "Seat added", amount: "$22.40", value: 22.4, status: "invoiced", note: "Prorated for 14 days" },
    { id: "oct", date: "2026-10-01", label: "Pro plan · monthly", amount: "$480.00", value: 480, status: "failed", note: "Card declined" },
  ];
}

describe("BillingSchedulePattern edit", { skip }, () => {
  test("pencil opens the Drawer on Charge date; Save sends the edit, closes, says so and focuses the row's pencil", async () => {
    const saved = [];
    const container = await mount({ charges: EDIT_CHARGES, onSaveCharge: (id, edit) => saved.push({ id, edit }) });
    const pencil = byLabel(container, "Edit Onboarding part 2 of 3, 15 Dec 2026");
    pencil.focus();
    await click(pencil);
    const dialog = document.querySelector('[role="dialog"]');
    assert.ok(dialog, "Drawer opens");
    assert.match(dialog.textContent, /Onboarding · part 2 of 3/);
    assert.match(dialog.textContent, /INV-0120 · was 15 Dec 2026/);
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
    const container = await mount({ charges: EDIT_CHARGES, onSaveCharge: () => {} });
    const pencil = byLabel(container, "Edit Pro plan monthly, 01 Dec 2026");
    pencil.focus();
    await click(pencil);
    const esc = new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    await act(async () => document.activeElement.dispatchEvent(esc));
    assert.ok(!document.querySelector('[role="dialog"]'), "Drawer closes");
    assert.ok(document.activeElement === byLabel(container, "Edit Pro plan monthly, 01 Dec 2026"), "focus: " + document.activeElement?.getAttribute("aria-label"));
  });

  test("Skip this month asks once in an AlertDialog, then drops the row and calls onSkipCharge", async () => {
    const skipped = [];
    const container = await mount({ charges: EDIT_CHARGES, onSaveCharge: () => {}, onSkipCharge: (id) => skipped.push(id) });
    const pencil = byLabel(container, "Edit Pro plan monthly, 01 Jan 2027");
    pencil.focus();
    await click(pencil);
    await click(byText(document.body, "Skip this month"));
    const alert = document.querySelector('[role="alertdialog"]');
    assert.ok(alert, "AlertDialog opens");
    assert.match(alert.textContent, /Skip the 01 Jan 2027 charge\?/);
    assert.equal(skipped.length, 0, "nothing skipped before the confirm");
    await click(byText(document.body, "Skip charge"));
    await frame();
    assert.deepEqual(skipped, ["jan"]);
    assert.ok(!document.querySelector('[role="alertdialog"]'));
    assert.ok(!byLabel(container, "Edit Pro plan monthly, 01 Jan 2027"), "the row is gone");
    assert.match(container.querySelector('[role="status"]').textContent, /Skipped Pro plan · monthly, 01 Jan 2027/);
    assert.ok(document.activeElement === container.querySelector('[data-charge-table="schedule"]'), "focus: " + document.activeElement?.getAttribute("aria-label"));
  });
});
