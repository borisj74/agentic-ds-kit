/**
 * SettingsPattern: the settings SideNav (Back to app, Workspace and You groups, the current row marked),
 * the PageHeader with its scope line and no breadcrumb when wide, General's SaveBar and Delete workspace,
 * and below --grid-breakpoint-md the index page of two LinkLists with Back to Settings returning focus to
 * the row you came from. The pattern is copy-in source (not in dist): this transpiles it and the
 * patterns it uses into a temp folder inside the kit, with ui imports pointing at the built kit (dist).
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
const out = mkdtempSync(join(kitDir, ".settings-test-"));
const FOLDERS = ["SettingsPattern", "BillingSchedulePattern", "IntegrationSettingsPattern"];

let h;
let act;
let createRoot;
let dom;
let Pattern;
let narrow = false;
const mounted = [];

/** A ui folder's public names: every built file in dist/ui/<name> but the CSS module maps. */
function shim(name) {
  const target = join(out, "ui", `${name}.mjs`);
  const dir = join(kitDir, `dist/ui/${name}`);
  const files = readdirSync(dir).filter((f) => f.endsWith(".js") && !f.endsWith(".module.js"));
  mkdirSync(join(out, "ui"), { recursive: true });
  writeFileSync(target, files.map((f) => `export * from "${pathToFileURL(join(dir, f)).href}";`).join("\n"));
  return pathToFileURL(target).href;
}

/** Transpiles every source file of a pattern folder into out/<folder>/<file>.mjs. */
function transpileFolder(folder) {
  mkdirSync(join(out, folder), { recursive: true });
  for (const file of readdirSync(join(kitDir, "patterns", folder))) {
    const match = /^(.+)\.(tsx?)$/.exec(file);
    if (!match) continue;
    const source = readFileSync(join(kitDir, "patterns", folder, file), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, verbatimModuleSyntax: false },
    });
    const code = outputText
      .replace(/^import "\.\/[\w-]+\.css";$/gm, "")
      .replace(/from "\.\.\/\.\.\/ui\/(\w+)"/g, (_, name) => `from "${shim(name)}"`)
      .replace(/from "\.\.\/\.\.\/ui\/shared\/(\w+)"/g, (_, name) => `from "${pathToFileURL(join(kitDir, `dist/ui/shared/${name}.js`)).href}"`)
      .replace(/from "\.\.\/(\w+Pattern)"/g, 'from "../$1/index.mjs"')
      .replace(/from "\.\/([\w-]+)"/g, 'from "./$1.mjs"')
      .replace(/from "((?:react|react-dom|lucide-react)(?:\/[\w-]+)?)"/g, (_, name) => `from "${import.meta.resolve(name)}"`);
    writeFileSync(join(out, folder, `${match[1]}.mjs`), code);
  }
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
  // Narrow is the viewport below --grid-breakpoint-md (64rem); the test flips it per case.
  window.matchMedia = (query) => ({
    matches: narrow && query.includes("64rem"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
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
  for (const folder of FOLDERS) transpileFolder(folder);
  ({ SettingsPattern: Pattern } = await import(pathToFileURL(join(out, "SettingsPattern/index.mjs")).href));
});

after(async () => {
  if (!skip) {
    while (mounted.length) {
      const root = mounted.pop();
      await act(async () => root.unmount());
    }
    document.body.innerHTML = "";
    dom.window.close();
  }
  rmSync(out, { recursive: true, force: true });
});

async function render(props = {}) {
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

const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 50)));
const byText = (root, selector, text) => [...root.querySelectorAll(selector)].find((el) => el.textContent.trim().startsWith(text));

async function click(el) {
  await act(async () => {
    el.focus();
    el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

describe("SettingsPattern", { skip }, () => {
  test("wide: Back to app at the very top, then the workspace, the Workspace and You groups (General marked), the user last; no breadcrumb", async () => {
    narrow = false;
    const view = await render();
    const nav = view.container.querySelector('nav[aria-label="Settings"]');
    assert.ok(nav, "the nav is named Settings");
    const side = nav.parentElement;
    const text = side.textContent;
    assert.ok(
      text.indexOf("Back to app") < text.indexOf("Northwind Studio") &&
        text.indexOf("Northwind Studio") < text.indexOf("General") &&
        text.indexOf("Sign-in") < text.indexOf("Priya Shah"),
      "Back to app, workspace, groups, then the user",
    );
    const links = [...side.querySelectorAll("a"), ...nav.querySelectorAll("button")].map((el) => el.textContent.trim());
    assert.deepEqual(links, ["Back to app", "General", "Billing", "Team", "Integrations", "Security", "Profile", "Notifications", "Sign-in"]);
    assert.match(nav.textContent, /Workspace[\s\S]*You/);
    assert.equal(nav.querySelector('[aria-current="page"]').textContent.trim(), "General");
    assert.equal(view.container.querySelector("main h1").textContent, "General");
    assert.match(view.container.querySelector("main").textContent, /Workspace setting · applies to all 12 members · owners and admins can edit/);
    assert.ok(!view.container.querySelector('main nav[aria-label="Breadcrumb"]'), "no breadcrumb when wide");
    assert.match(view.container.querySelector('[role="region"] [role="status"]').textContent, /1 unsaved change/);
    await view.unmount();
  });

  test("picking a nav row switches the section and reports it", async () => {
    narrow = false;
    const picked = [];
    const view = await render({ onSectionChange: (section) => picked.push(section) });
    await click(byText(view.container, 'nav[aria-label="Settings"] a, nav[aria-label="Settings"] button', "Sign-in"));
    assert.deepEqual(picked, ["sign-in"]);
    assert.equal(view.container.querySelector("main h1").textContent, "Sign-in");
    assert.match(view.container.querySelector("main").textContent, /Personal setting · only changes it for you/);
    assert.match(view.container.querySelector("main").textContent, /Password[\s\S]*Two-factor authentication/);
    assert.ok(!view.container.textContent.includes("Delete workspace"), "Delete workspace lives on Security");
    await view.unmount();
  });

  test("sectionHref makes nav rows real links", async () => {
    narrow = false;
    const view = await render({ sectionHref: (section) => `/settings/${section}`, appHref: "/home" });
    const nav = view.container.querySelector('nav[aria-label="Settings"]');
    assert.equal(byText(nav, "a", "Billing").getAttribute("href"), "/settings/billing");
    assert.equal(byText(nav.parentElement, "a", "Back to app").getAttribute("href"), "/home");
    await view.unmount();
  });

  test("General has no Delete workspace", async () => {
    narrow = false;
    const view = await render();
    assert.ok(!byText(view.container, "button", "Delete workspace"), "Delete workspace moved to Security");
    await view.unmount();
  });

  test("Security is a workspace setting: sign-in rules save with the one solid primary, then sessions and a Danger zone", async () => {
    narrow = false;
    const saved = [];
    const view = await render({ section: "security", onSave: (section) => saved.push(section) });
    const main = view.container.querySelector("main");
    assert.match(main.textContent, /Workspace setting · applies to all 12 members · owners can change it/);
    const legend = main.querySelector("legend");
    assert.equal(legend.textContent, "Sign-in rules");
    assert.match(main.textContent, /Okta · northwind\.okta\.example/);
    assert.match(main.querySelector('[role="status"]').textContent, /1 unsaved change/);
    const headings = [...main.querySelectorAll("h2, h3")].map((el) => el.textContent.trim());
    assert.ok(headings.indexOf("Danger zone") > headings.indexOf("Your sessions"), "Danger zone comes after every card that saves");
    const save = byText(main, "button", "Save sign-in rules");
    await click(save);
    assert.deepEqual(saved, ["security"]);
    assert.match(main.querySelector('[role="status"]').textContent, /All changes saved/);
    assert.ok(save.disabled, "Save turns off once saved");
    await view.unmount();
  });

  test("Delete workspace sits in Security's Danger zone, asks for the name, and Cancel returns focus to it", async () => {
    narrow = false;
    const view = await render({ section: "security" });
    const trigger = byText(view.container, "button", "Delete workspace");
    await click(trigger);
    await settle();
    const dialog = document.querySelector('[role="alertdialog"]');
    assert.match(dialog.textContent, /Delete Northwind Studio\?/);
    assert.match(dialog.textContent, /Type Northwind Studio to confirm/);
    assert.ok(byText(dialog, "button", "Delete workspace").disabled, "the action waits for the name");
    await click(byText(dialog, "button", "Cancel"));
    await settle();
    assert.equal(document.activeElement, byText(view.container, "button", "Delete workspace"));
    await view.unmount();
  });

  test("narrow: an index page of two lists, a row opens the section, Back to Settings focuses that row", async () => {
    narrow = true;
    const view = await render({ twoFactor: false });
    assert.equal(view.container.querySelector("main h1").textContent, "Settings");
    assert.ok(!view.container.querySelector('nav[aria-label="Settings"]'), "no settings SideNav");
    const lists = [...view.container.querySelectorAll("main ul[aria-label]")].map((el) => el.getAttribute("aria-label"));
    assert.deepEqual(lists, ["Workspace", "You"]);
    assert.match(view.container.textContent, /Workspace · applies to all 12 members/);
    assert.match(view.container.textContent, /Sign-in\s*Password · two-factor off/);
    assert.match(view.container.textContent, /Workspace · applies[\s\S]*Security[\s\S]*You · only/);

    await click(byText(view.container, "main ul button", "Billing"));
    assert.equal(view.container.querySelector("main h1").textContent, "Billing");
    const back = byText(view.container, "main a, main button", "Settings");
    assert.ok(back, "Back to Settings");
    await click(back);
    await settle();
    assert.equal(view.container.querySelector("main h1").textContent, "Settings");
    assert.equal(document.activeElement, byText(view.container, "main ul button", "Billing"), "focus lands on the row you came from");
    await view.unmount();
    narrow = false;
  });
  test("narrow Billing puts AI credits first; narrow Team has Invite in the header and Jon Dale in the member list", async () => {
    narrow = true;
    const billing = await render({ section: "billing" });
    const headings = [...billing.container.querySelectorAll("main h2, main h3")].map((el) => el.textContent.trim());
    assert.equal(headings[0], "AI credits");
    assert.ok(headings.indexOf("Invoices") < headings.indexOf("Billing schedule"), "Billing schedule stays below Invoices");
    await billing.unmount();

    const team = await render({ section: "team" });
    assert.ok(byText(team.container, "main header button, main .layout-header button", "Invite"), "Invite in the top bar");
    const list = team.container.querySelector('[aria-label="Members"]');
    assert.match(list.textContent, /Jon Dale[\s\S]*Invited/);
    assert.match(team.container.textContent, /12 of 15 seats/);
    await team.unmount();
    narrow = false;
  });
  test("wide Team: seats, role filter, and row menus named per member", async () => {
    narrow = false;
    const view = await render({ section: "team" });
    const main = view.container.querySelector("main");
    assert.match(main.textContent, /12 of 15 seats[\s\S]*3 free · 1 held by a pending invite/);
    assert.match(main.textContent, /11 members · 1 invite/);
    assert.ok(main.querySelector('[aria-label="Actions for Marco Li"]'), "row menu named for the member");
    assert.ok(main.querySelector('[aria-label="Role for Marco Li"]'), "role Select named for the member");
    assert.match(main.textContent, /Showing 5 of 12/);
    await view.unmount();
  });
});
