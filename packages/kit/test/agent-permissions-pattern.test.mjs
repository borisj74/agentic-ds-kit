/**
 * AgentPermissionsPattern (Paper p-A-1, 4KTJ-0): the pending PermissionRequest, the actions Table
 * (ListView below 640), the Switch and AutonomyDial, and the Edit Drawer. The pattern is copy-in
 * source (not in dist), so this transpiles it into a temp folder inside the kit and points its
 * ../../ui imports at the built kit (dist). `npm test` builds first.
 */
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { after, afterEach, before, describe, test } from "node:test";
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
const out = mkdtempSync(join(kitDir, ".agent-permissions-test-"));

let h;
let act;
let render;
let createRoot;
let dom;
let AgentPermissionsPattern;
let narrow = false;
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
    window.matchMedia = () => ({ matches: narrow, addEventListener() {}, removeEventListener() {} });
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
  transpile("AgentPermissionsPattern", "agent-permissions-data", "ts");
  ({ AgentPermissionsPattern } = await import(pathToFileURL(transpile("AgentPermissionsPattern", "AgentPermissionsPattern")).href));
});

after(async () => {
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
  dom?.window.close();
  rmSync(out, { recursive: true, force: true });
});

// One page at a time: an open Drawer left mounted would trap focus against the next test's Drawer.
afterEach(async () => {
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
  globalThis.document?.body.replaceChildren();
});

const ssr = (props = {}) => render(h(AgentPermissionsPattern, { viewport: false, ...props }));

async function mount(props = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(h(AgentPermissionsPattern, { viewport: false, ...props })));
  return container;
}

const label = (button) => button.getAttribute("aria-label") ?? button.textContent.trim();
const button = (root, name) => [...root.querySelectorAll("button")].find((b) => label(b) === name);
const solidPrimary = (html) => (html.match(/<button[^>]*class="[^"]*_solid_[^"]*_primary_[^"]*"/g) ?? []).length;
/** The row's Edit Button: named Edit, described by the action name. */
const edit = (root, name) =>
  [...root.querySelectorAll("button")].find(
    (b) => b.textContent.trim() === "Edit" && document.getElementById(b.getAttribute("aria-describedby") ?? "")?.textContent.trim() === name,
  );

async function click(target) {
  await act(async () => target.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })));
}

async function key(target, name, init = {}) {
  await act(async () => target.dispatchEvent(new window.KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...init })));
}

/** The table row (or list row) for an action, by its name. */
const row = (root, name) => [...root.querySelectorAll("tr")].find((tr) => tr.textContent.includes(name));

describe("agent-permissions page", () => {
  test("request first, then the table: title, scope, requestedAt, one solid primary (Grant)", () => {
    const html = ssr();
    assert.match(html, /<main[^>]*class="layout-content agent-permissions-pattern__content"/);
    assert.match(html, />Agent permissions</);
    assert.match(html, /What each billing agent may do on its own · 1 request waiting/);
    assert.ok(html.indexOf("Refund up to $500 without asking") < html.indexOf("What agents may do"), "request before the table");
    assert.match(html, />Refunds</);
    assert.match(html, />Write</);
    assert.match(html, /Limit: \$500 per refund/);
    assert.match(html, /30 days, until 22 Dec/);
    assert.match(html, /Collections agent · requested 09:41/);
    assert.match(html, />Grant</);
    assert.doesNotMatch(html, /Approve|Needs you/);
    assert.equal(solidPrimary(html), 1);
  });

  test("the table: four actions, level as an icon and a word, $500 requested, no Edit on the locked row", () => {
    const html = ssr();
    assert.match(html, /4 actions · 2 agents/);
    for (const word of ["On its own", "Up to $250", "Asks first", "Never on its own"]) assert.ok(html.includes(`>${word}<`), word);
    assert.match(html, />\$500 requested</);
    assert.equal((html.match(/>Edit</g) ?? []).length, 3);
    const prices = html.slice(html.indexOf(">Change prices<"));
    assert.doesNotMatch(prices.slice(0, prices.indexOf("</tr>")), />Edit</, "no Edit on the locked row");
    assert.match(html, /set by workspace policy/);
  });

  test("the Switch and the AutonomyDial with the four default levels, Asks first marked default", () => {
    const html = ssr();
    assert.match(html, /role="switch"[^>]*aria-checked="true"|aria-checked="true"[^>]*role="switch"/);
    assert.match(html, />Agents can act on their own</);
    assert.match(html, />Default for new actions</);
    for (const stop of ["Never on its own", "Asks first", "Up to a limit", "On its own"]) assert.ok(html.includes(stop));
    assert.match(html, /A new action asks every time until you set its level in the table\./);
  });
});

describe("agent-permissions request", { skip }, () => {
  test("Grant: one Granted line, the refunds row goes to Up to $500, no request waiting", async () => {
    const container = await mount();
    await click(button(container, "Grant"));
    assert.ok(container.querySelector('[aria-label="Granted: Refund up to $500 without asking"]'));
    assert.match(row(container, "Issue refunds").textContent, /Up to \$500/);
    assert.match(container.querySelector('[aria-label="Granted: Refund up to $500 without asking"]').textContent, /09:52/);
    assert.doesNotMatch(container.textContent, /\$500 requested/);
    assert.match(container.textContent, /No requests waiting/);
  });

  test("Escape in the card denies: Denied line, the limit stays $250", async () => {
    const container = await mount();
    const card = container.querySelector("section[aria-labelledby]");
    await key(card, "Escape");
    assert.ok(container.querySelector('[aria-label="Denied: Refund up to $500 without asking"]'));
    assert.match(row(container, "Issue refunds").textContent, /Up to \$250/);
  });

  test("a failed grant shows the error with Retry; Retry grants", async () => {
    let fail = true;
    const container = await mount({ onGrant: () => (fail ? ((fail = false), Promise.reject(new Error("x"))) : Promise.resolve()) });
    await click(button(container, "Grant"));
    assert.match(container.querySelector('[role="alert"]').textContent, /Stripe didn't answer\. The limit is still \$250\./);
    await click(button(container, "Retry"));
    assert.ok(container.querySelector('[aria-label="Granted: Refund up to $500 without asking"]'));
  });
});

describe("agent-permissions Edit Drawer", { skip }, () => {
  test("Edit opens a Drawer named for the action; Up to an amount shows the CurrencyInput under the group", async () => {
    const container = await mount();
    await click(edit(container, "Issue refunds"));
    const dialog = document.querySelector('[role="dialog"]');
    assert.ok(dialog, "Drawer is open");
    assert.match(dialog.textContent, /Issue refunds/);
    assert.match(dialog.textContent, /Collections agent/);
    const group = dialog.querySelector("fieldset");
    assert.match(group.textContent, /What may it do\?/);
    assert.equal(group.querySelectorAll('input[type="radio"]').length, 3);
    const amount = dialog.querySelector("input:not([type=radio])");
    assert.ok(amount && !group.contains(amount), "CurrencyInput sits under the group, not in an option");
    assert.match(dialog.textContent, /USD per refund/);
    assert.equal(solidPrimary(dialog.outerHTML), 1, "Save level is the Drawer's one primary");
  });

  test("pick Asks first and Save level: the amount goes, the row reads Asks first, onSaveLevel gets it", async () => {
    const saved = [];
    const container = await mount({ onSaveLevel: (...args) => saved.push(args) });
    await click(edit(container, "Issue refunds"));
    const dialog = document.querySelector('[role="dialog"]');
    const ask = [...dialog.querySelectorAll('input[type="radio"]')].find((input) => input.value === "ask");
    await click(ask);
    assert.equal(dialog.querySelector("input:not([type=radio])"), null);
    await click(button(dialog, "Save level"));
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.match(row(container, "Issue refunds").textContent, /Asks first/);
    assert.deepEqual(saved, [["refunds", "ask", undefined]]);
  });

  test("Escape closes the Drawer without saving", async () => {
    const container = await mount();
    await click(edit(container, "Send payment reminders"));
    const dialog = document.querySelector('[role="dialog"]');
    assert.equal(dialog.querySelectorAll('input[type="radio"]').length, 2, "no amount option for a non-money action");
    await key(dialog, "Escape");
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.match(row(container, "Send payment reminders").textContent, /On its own/);
  });
});

describe("agent-permissions below 640", { skip }, () => {
  test("ListView with drill rows, the locked row without a drill, and the nav behind Open navigation", async () => {
    narrow = true;
    try {
      const container = await mount();
      assert.equal(container.querySelector("table"), null, "no Table");
      assert.match(container.textContent, /\$500 asked/);
      assert.doesNotMatch(container.textContent, /Today 08:05/, "Last used drops");
      assert.doesNotMatch(container.textContent, /Default for new actions/, "no dial below 640");
      assert.match(container.textContent, /Collections · \$500 asked/);
      const rows = [...container.querySelectorAll('[role="listitem"]')];
      const locked = rows.find((li) => li.textContent.includes("Change prices"));
      assert.equal(locked.querySelector("button"), null, "locked row can't be opened");
      assert.match(locked.textContent, /Workspace policy/);
      const refunds = rows.find((li) => li.textContent.includes("Issue refunds")).querySelector("button");
      await click(refunds);
      assert.match(document.querySelector('[role="dialog"]').textContent, /What may it do\?/);
      await key(document.querySelector('[role="dialog"]'), "Escape");
      await click(button(container, "Open navigation"));
      const nav = document.querySelector('[role="dialog"]');
      assert.match(nav.textContent, /Agent runs/);
    } finally {
      narrow = false;
    }
  });
});

describe("agent-permissions contract", () => {
  const contract = JSON.parse(readFileSync(join(kitDir, "contracts/patterns/agent-permissions.json"), "utf8"));
  const source = readFileSync(join(kitDir, "patterns/AgentPermissionsPattern/AgentPermissionsPattern.tsx"), "utf8");

  test("index entry and copy-in delivery", () => {
    const index = JSON.parse(readFileSync(join(kitDir, "contracts/index.json"), "utf8"));
    const entry = index.find((item) => item.id === "agent-permissions");
    assert.ok(entry && entry.group === "pattern" && entry.path === "contracts/patterns/agent-permissions.json");
    assert.equal(contract.delivery, "copy-in");
    assert.equal(entry.intent, contract.intent);
  });

  test("contains lists every kit piece the pattern imports", () => {
    const used = [...source.matchAll(/from "\.\.\/\.\.\/ui\/(\w+)"/g)].map((m) => m[1].toLowerCase());
    for (const id of new Set(used)) {
      if (id === "field") continue;
      assert.ok(contract.contains.includes(id), id);
    }
  });
});
