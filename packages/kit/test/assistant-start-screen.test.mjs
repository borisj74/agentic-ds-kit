/**
 * Assistant start screen (Paper p-A-1, 4GX4-0): Chat `loading` and the assistant-start pattern.
 * Chat runs from the built kit (dist). The pattern and the app-shell example are copy-in source,
 * so they are transpiled into a temp folder with ui imports pointed at dist, as in
 * empty-first-run-pattern.test.mjs. Renders with SSR and jsdom; `npm test` builds first.
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
const out = mkdtempSync(join(kitDir, ".assistant-start-test-"));

let h;
let act;
let useState;
let render;
let createRoot;
let dom;
let AssistantStartPattern;
let Chat;
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
  useState = React.useState;
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
  ({ AssistantStartPattern } = await import(pathToFileURL(transpile("AssistantStartPattern", "AssistantStartPattern")).href));
  ({ Chat } = await import(dist("Chat/Chat")));
});

after(async () => {
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
  dom?.window.close();
  rmSync(out, { recursive: true, force: true });
});

async function mount(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(element));
  return container;
}

async function click(element) {
  await act(async () => element.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })));
}

async function type(input, text) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  await act(async () => {
    setter.call(input, text);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

const sendButton = (scope) => scope.querySelector('button[type="submit"]');
const suggestions = [{ label: "Why did MRR drop 3.1% in October?", hint: "Looks at MRR movements", icon: "TrendingDown" }];

describe("Chat loading", () => {
  test("keeps greeting and intro, shows Skeletons for the suggestions, disables the composer and is aria-busy", () => {
    const html = render(h(Chat, { title: "Billing assistant", embedded: true, loading: true, greeting: "Good morning, Maya", intro: "Reading Stripe and QuickBooks", suggestions }));
    assert.match(html, /^<section[^>]*aria-busy="true"/);
    assert.match(html, /Good morning, Maya/);
    assert.match(html, /Reading Stripe and QuickBooks/);
    assert.doesNotMatch(html, /Why did MRR drop/, "no suggestion rows while loading");
    assert.match(html, /placeholder="Available when your data loads"/);
    assert.match(html, /<input[^>]*disabled=""/);
    assert.match(html, /<button type="submit"[^>]*disabled=""/);
  });

  test("a set placeholder wins over the loading one; without loading the section is not busy", () => {
    const busy = render(h(Chat, { loading: true, greeting: "Hi", placeholder: "Ask about revenue" }));
    assert.match(busy, /placeholder="Ask about revenue"/);
    const idle = render(h(Chat, { greeting: "Hi", suggestions }));
    assert.doesNotMatch(idle.match(/^<section[^>]*>/)[0], /aria-busy/);
    assert.match(idle, /placeholder="How can we help you\?"/);
    assert.match(idle, /Why did MRR drop/);
  });

  test("while loading, typing and pressing Send sends nothing; once loaded, Send sends", { skip }, async () => {
    const sent = [];
    const props = { greeting: "Hi", suggestions, onSend: (m) => sent.push(m) };
    const container = await mount(h(Chat, { ...props, loading: true }));
    const input = container.querySelector("input");
    assert.equal(input.disabled, true);
    await click(sendButton(container));
    assert.deepEqual(sent, []);
    const root = mounted[mounted.length - 1];
    await act(async () => root.render(h(Chat, { ...props, loading: false })));
    await type(container.querySelector("input"), "Which invoices are late?");
    assert.equal(sendButton(container).disabled, false);
    await click(sendButton(container));
    assert.deepEqual(sent, ["Which invoices are late?"]);
  });
});

describe("Chat suggestionLayout, summary and composerLabel", () => {
  test("grid: md outline Buttons with icons in a group, no hint, plain caption label", () => {
    const html = render(h(Chat, { greeting: "Hi", suggestions, suggestionLayout: "grid" }));
    const group = html.match(/<div class="_suggestionGrid_\w+" role="group" aria-label="Suggested prompts">[\s\S]*?<\/div>/)[0];
    assert.match(group, /<button type="button"[^>]*_outline_[^>]*_neutral_/);
    assert.match(group, /lucide-trending-down/);
    assert.doesNotMatch(html, /Looks at MRR movements/);
    assert.match(html, /_groupLabelGrid_\w+" aria-hidden="true">Suggested</);
  });

  test("grid while loading: four Skeletons in the grid", () => {
    const html = render(h(Chat, { greeting: "Hi", suggestions, suggestionLayout: "grid", loading: true }));
    const grid = html.slice(html.indexOf("_suggestionGrid_"), html.indexOf("<form"));
    assert.equal((grid.match(/_bone_/g) ?? []).length, 4);
    assert.doesNotMatch(grid, /<button/);
  });

  test("composerLabel names the input and puts the composer above the suggestions; summary is mono under the intro", () => {
    const html = render(h(Chat, { greeting: "Hi", intro: "Ask about revenue.", summary: "MRR $184,320", composerLabel: "Ask the billing assistant", suggestions, suggestionLayout: "grid" }));
    const id = html.match(/<label for="([^"]+)"/)[1];
    assert.match(html, new RegExp(`<input id="${id}"`));
    assert.doesNotMatch(html.match(/<input[^>]*>/)[0], /aria-label=/);
    assert.ok(html.indexOf("Ask about revenue.") < html.indexOf("MRR $184,320"));
    assert.ok(html.indexOf("<form") < html.indexOf('aria-label="Suggested prompts"'));
  });

  test("once the thread has messages, the labelled composer is at the foot", () => {
    const html = render(h(Chat, { composerLabel: "Ask", greeting: "Hi", messages: [{ role: "user", content: "Hello" }] }));
    assert.ok(html.indexOf("Hello") < html.indexOf("<form"));
  });

  test("grid suggestion is a real click that sends", { skip }, async () => {
    const sent = [];
    const container = await mount(h(Chat, { greeting: "Hi", suggestions, suggestionLayout: "grid", onSend: (m) => sent.push(m) }));
    const button = [...container.querySelectorAll("button")].find((b) => b.textContent.includes("Why did MRR drop"));
    await click(button);
    assert.deepEqual(sent, ["Why did MRR drop 3.1% in October?"]);
  });
});

describe("Chat focus after a send from the top composer", () => {
  function Thread(props) {
    const [messages, setMessages] = useState([]);
    return h(Chat, {
      greeting: "Hi",
      composerLabel: "Ask the billing assistant",
      suggestions,
      suggestionLayout: "grid",
      ...props,
      messages,
      onSend: (m) => setMessages((list) => [...list, { role: "user", content: m }]),
    });
  }

  test("typing in the top composer and pressing Enter leaves focus on the foot input", { skip }, async () => {
    const container = await mount(h(Thread));
    const input = container.querySelector("input");
    input.focus();
    await type(input, "Which invoices are late?");
    await act(async () => {
      const enter = new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      if (input.dispatchEvent(enter)) input.form.requestSubmit();
    });
    assert.match(container.textContent, /Which invoices are late\?/);
    const foot = container.querySelector("form input");
    assert.ok(container.innerHTML.indexOf("Which invoices") < container.innerHTML.indexOf("<form"), "composer moved to the foot");
    assert.equal(document.activeElement, foot);
  });

  test("clicking a grid suggestion leaves focus on the foot input", { skip }, async () => {
    const container = await mount(h(Thread));
    const button = [...container.querySelectorAll("button")].find((b) => b.textContent.includes("Why did MRR drop"));
    button.focus();
    await click(button);
    assert.match(container.textContent, /Why did MRR drop/);
    assert.equal(container.querySelector('[role="group"][aria-label="Suggested prompts"]'), null);
    assert.equal(document.activeElement, container.querySelector("form input"));
  });
});

describe("AssistantStartPattern", () => {
  test("ready: main holds Chat (embedded, guided) and the Connected apps Card with status words", () => {
    const html = render(h(AssistantStartPattern));
    const main = html.slice(html.indexOf("<main"));
    assert.match(main, /aria-label="Billing assistant"/);
    assert.match(main, /Good morning, Maya/);
    assert.match(main, /Ask about invoices, customers and revenue\. Answers link the invoice or report they use\./);
    assert.match(main, /class="_summary_\w+">October\u00a0MRR\u00a0\$184,320  -3\.1%\u00a0vs\u00a0September  Overdue\u00a07\u00a0·\u00a0\$23,480  Next\u00a0run\u00a0Dec\u00a01</);
    assert.match(main, /<label for="([^"]+)"[^>]*>Ask the billing assistant<\/label>/);
    // Composer before the suggestions, which are a 2x2 grid of Buttons.
    assert.ok(main.indexOf("Ask the billing assistant") < main.indexOf("Why did MRR drop"));
    assert.match(main, /role="group" aria-label="Suggested prompts"/);
    for (const label of ["Why did MRR drop 3.1% in October?", "Draft dunning for 7 overdue invoices", "Growth renewals due in December", "Explain the $1,240 credit on INV-1842"]) {
      assert.ok(main.includes(label), label);
    }
    assert.match(main, /placeholder="e\.g\. Which invoices are over 30 days late\?"/);
    assert.match(main, /Connected apps/);
    assert.match(main, /Sources for every answer/);
    assert.match(main, /Stripe[\s\S]*Connected/);
    assert.match(main, /QuickBooks[\s\S]*Sign-in expired/);
    assert.match(main, />Reconnect<\/span><\/button><span[^>]*>Reconnect QuickBooks</);
    assert.doesNotMatch(main, /aria-busy="true"/);
  });

  test("one solid primary per view: only Chat's Send", () => {
    const html = render(h(AssistantStartPattern));
    const solids = html.match(/class="[^"]*_solid_\w+ _primary_\w+[^"]*"/g) ?? [];
    assert.equal(solids.length, 1);
    assert.match(solids[0], /_iconOnly_/, "the one solid primary is the icon-only Send");
  });

  test("loading: Chat and the Card are aria-busy, the composer reads Available when your data loads", () => {
    const html = render(h(AssistantStartPattern, { state: "loading" }));
    const main = html.slice(html.indexOf("<main"));
    assert.equal((main.match(/aria-busy="true"/g) ?? []).length >= 2, true);
    assert.match(main, /<article[^>]*aria-busy="true"/);
    assert.match(main, /placeholder="Available when your data loads"/);
    assert.match(main, /Reading Stripe and QuickBooks/);
    assert.doesNotMatch(main, /Sign-in expired/);
  });

  test("reconnect-error: the QuickBooks row says in words what answers skip", () => {
    const html = render(h(AssistantStartPattern, { state: "reconnect-error" }));
    assert.match(html, /Not connected\. Answers skip ledger and tax data\./);
    assert.match(html, /lucide-circle-x/);
  });

  test("Reconnect and a suggestion are real clicks: onReconnect gets the app, the prompt is sent and the thread replaces the Card", { skip }, async () => {
    const reconnects = [];
    const sent = [];
    const container = await mount(h(AssistantStartPattern, { onReconnect: (id) => reconnects.push(id), onSend: (m) => sent.push(m) }));
    const reconnect = [...container.querySelectorAll("button[aria-labelledby]")].find(
      (button) => document.getElementById(button.getAttribute("aria-labelledby"))?.textContent === "Reconnect QuickBooks",
    );
    await click(reconnect);
    assert.deepEqual(reconnects, ["quickbooks"]);
    const prompt = [...container.querySelectorAll("button, a")].find((el) => el.textContent.includes("Why did MRR drop 3.1% in October?"));
    await click(prompt);
    assert.deepEqual(sent, ["Why did MRR drop 3.1% in October?"]);
    assert.doesNotMatch(container.innerHTML, /Connected apps/);
    assert.match(container.querySelector("main").className, /assistant-start-pattern--thread/);
  });
});

describe("ListView primaryAction lane", () => {
  let ListView;
  before(async () => {
    ({ ListView } = await import(dist("ListView/ListView")));
  });

  test("once one row has a primaryAction, rows without one keep an empty lane", () => {
    const html = render(
      h(ListView, {
        label: "Apps",
        items: [
          { id: "a", primary: "Stripe", badge: "Connected", badgeTone: "success" },
          { id: "b", primary: "QuickBooks", badge: "Sign-in expired", badgeTone: "warning", primaryAction: { id: "r", label: "Reconnect" } },
        ],
      }),
    );
    const stripe = html.slice(html.indexOf("Stripe"), html.indexOf("QuickBooks"));
    assert.match(stripe, /Connected<\/span><span class="_actions_\w+"><span class="_primaryActionSlot_\w+" aria-hidden="true"><\/span>/);
  });

  test("with no primaryAction in the list, no empty lane is added", () => {
    const html = render(h(ListView, { label: "Apps", items: [{ id: "a", primary: "Stripe", badge: "Connected" }] }));
    assert.doesNotMatch(html, /_primaryActionSlot_/);
  });
});
