/**
 * OnboardingPattern: Business, Plan (TileGroup), Billing and Review with Confirm. Checks the one
 * primary per step, the step validation and focus, Confirm gated on every step being valid, the
 * error step in ProgressSteps and the onConfirm values. The pattern is copy-in source (not in
 * dist), so this transpiles it into a temp folder inside the kit and points its ../../ui imports at
 * the built kit (dist). `npm test` builds first.
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
const out = mkdtempSync(join(kitDir, ".onboarding-test-"));

let h;
let act;
let render;
let createRoot;
let dom;
let OnboardingPattern;
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
function transpile(folder, file, ext = "tsx") {
  const source = readFileSync(join(kitDir, `patterns/${folder}/${file}.${ext}`), "utf8");
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
    .replace(/from "\.\/([\w-]+)"/g, (_, name) => `from "./${name}.mjs"`);
  mkdirSync(join(out, folder), { recursive: true });
  const target = join(out, folder, ext === "ts" ? `${file}.mjs` : "index.mjs");
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
  transpile("OnboardingPattern", "onboarding-data", "ts");
  ({ OnboardingPattern } = await import(pathToFileURL(transpile("OnboardingPattern", "OnboardingPattern")).href));
});

after(async () => {
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
  dom?.window.close();
  rmSync(out, { recursive: true, force: true });
});

const ssr = (props = {}) => render(h(OnboardingPattern, { viewport: false, ...props }));

async function mount(props = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(h(OnboardingPattern, { viewport: false, ...props })));
  return container;
}

const byText = (root, text) => [...root.querySelectorAll("button")].find((button) => button.textContent.trim() === text);
/** A button by its accessible name: aria-label, aria-labelledby text, or its own text. */
const accessibleName = (button) => {
  const by = button.getAttribute("aria-labelledby");
  if (by) return by.split(" ").map((id) => document.getElementById(id)?.textContent ?? "").join(" ").trim();
  return button.getAttribute("aria-label") ?? button.textContent.trim();
};
const byName = (root, name) => [...root.querySelectorAll("button")].find((button) => accessibleName(button) === name);

async function click(button) {
  await act(async () => button.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
}

async function submit(container) {
  const form = container.querySelector("form");
  await act(async () => form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
}

async function type(input, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

const primary = (container) => container.querySelector('button[type="submit"]');

describe("OnboardingPattern steps", () => {
  test("four steps: Business, Plan, Billing, Review, in a vertical ProgressSteps and <main>", () => {
    const html = ssr();
    assert.match(html, /<main[^>]*aria-label="Setup, step 1 of 4: Business"/);
    for (const label of ["Business", "Plan", "Billing", "Review"]) assert.match(html, new RegExp(`>${label}<`));
    assert.ok(!/Welcome|Workspace|Skip for now|Setup guide/.test(html), "old steps and Skip are gone");
    assert.match(html, />Step 1 of 4</);
    assert.match(html, />Tell us about your business</);
  });

  test("one solid primary per step: Continue, then Confirm on Review; Back and Save and exit are ghost", () => {
    for (const step of ["business", "plan", "billing"]) {
      const html = ssr({ step });
      assert.equal((html.match(/type="submit"/g) ?? []).length, 1);
      assert.match(html, />Continue</);
    }
    const review = ssr({ step: "review" });
    assert.match(review, />Confirm</);
    assert.ok(!review.includes(">Continue<"));
    assert.match(review, />Save and exit</);
    assert.match(review, />Back</);
    assert.ok(!ssr({ step: "business" }).includes(">Back<"), "no Back on the first step");
  });

  test("Plan is a TileGroup radiogroup with prices; Review lists each step with Edit and the first invoice", () => {
    const plan = ssr({ step: "plan" });
    assert.match(plan, /role="radiogroup"/);
    assert.match(plan, /£48\.00 a month/);
    const review = ssr({ step: "review" });
    assert.match(review, />Northwind Traders Ltd</);
    assert.match(review, />Growth</);
    assert.match(review, />finance@northwind\.co\.uk</);
    assert.match(review, />INV-1842</);
    assert.match(review, />£48\.00</);
    assert.equal((review.match(/>Edit</g) ?? []).length, 3);
  });

  test("confirmState submitting: Confirm loading with Creating account…, Back and Save and exit disabled", () => {
    const html = ssr({ step: "review", confirmState: "submitting" });
    assert.match(html, /<button form="[^"]+" aria-busy="true" type="submit"[^>]*>[\s\S]*?<span>Creating account…<\/span><\/button>/);
    assert.match(html, /<button type="button" disabled=""[^>]*><span>Back<\/span>/);
    assert.match(html, /<button type="button" disabled=""[^>]*><span>Save and exit<\/span>/);
  });
});

describe("OnboardingPattern interactions", { skip }, () => {
  test("an empty business name blocks Continue, shows the Field error and focuses the input", async () => {
    const steps = [];
    const container = await mount({ onStepChange: (step) => steps.push(step) });
    const name = container.querySelector('input[name="businessName"]');
    await type(name, "  ");
    await submit(container);
    assert.deepEqual(steps, []);
    assert.match(container.textContent, /Enter a business name\./);
    assert.equal(name.getAttribute("aria-invalid"), "true");
    assert.equal(document.activeElement, name);
    await type(name, "Northwind Traders Ltd");
    await submit(container);
    assert.deepEqual(steps, ["plan"]);
  });

  test("a bad billing email blocks Continue with its error", async () => {
    const container = await mount({ defaultStep: "billing" });
    const email = container.querySelector('input[name="billingEmail"]');
    await type(email, "finance");
    await submit(container);
    assert.match(container.textContent, /Enter a billing email/);
    assert.equal(document.activeElement, email);
  });

  test("Confirm calls onConfirm with every step's values, then onFinish", async () => {
    const confirmed = [];
    let finished = 0;
    const container = await mount({ defaultStep: "review", onConfirm: (values) => confirmed.push(values), onFinish: () => finished++ });
    assert.equal(primary(container).disabled, false);
    await submit(container);
    assert.equal(confirmed.length, 1);
    assert.deepEqual(confirmed[0], {
      business: { name: "Northwind Traders Ltd", country: "gb", currency: "gbp", vat: "GB 284 1937 62" },
      plan: "growth",
      billing: { email: "finance@northwind.co.uk", terms: "net30", prefix: "INV-" },
    });
    assert.equal(finished, 1);
  });

  test("Confirm stays disabled while a step is invalid; that step shows error in ProgressSteps and its Field error after Edit", async () => {
    const confirmed = [];
    const container = await mount({ defaultStep: "review", confirmState: "error", onConfirm: (values) => confirmed.push(values) });
    assert.equal(primary(container).disabled, true);
    await submit(container);
    assert.equal(confirmed.length, 0);
    const errorStep = [...container.querySelectorAll("li")].find((li) => li.textContent.includes("Error, step 1 of 4"));
    assert.ok(errorStep, "Business is marked as an error in ProgressSteps");
    assert.match(container.textContent, /No business name/);
    await click(byName(container, "Edit business"));
    assert.match(container.textContent, /Enter a business name\./);
    const name = container.querySelector('input[name="businessName"]');
    assert.equal(name.getAttribute("aria-invalid"), "true");
  });

  test("Edit on a Review row goes back to that step", async () => {
    const steps = [];
    const container = await mount({ defaultStep: "review", onStepChange: (step) => steps.push(step) });
    await click(byName(container, "Edit plan"));
    assert.deepEqual(steps, ["plan"]);
    assert.match(container.innerHTML, /role="radiogroup"/);
  });
});
