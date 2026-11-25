/**
 * SignInPattern: SSO above the form, Card h1, error as { title, detail } or a string, the code step
 * (step + onVerifyCode) and focus moves. The pattern is copy-in source (not in dist), so this
 * transpiles it with TypeScript into a temp folder inside the kit, points its ../../ui imports at the
 * built kit (dist), and renders it with SSR and jsdom. `npm test` builds first.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
const out = mkdtempSync(join(kitDir, ".sign-in-test-"));

let h;
let act;
let render;
let createRoot;
let dom;
let SignInPattern;
let errorText;
const mounted = [];

function transpile() {
  const source = readFileSync(join(kitDir, "patterns/SignInPattern/SignInPattern.tsx"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      verbatimModuleSyntax: false,
    },
  });
  const code = outputText
    .replace(/import\s+"\.\/SignInPattern\.css";?/, "")
    .replace(/from "\.\.\/\.\.\/ui\/(\w+)"/g, (_, name) => `from "${pathToFileURL(join(kitDir, `dist/ui/${name}/${name}.js`)).href}"`);
  const file = join(out, "SignInPattern.mjs");
  writeFileSync(file, code);
  return file;
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
    for (const [key, value] of Object.entries({
      window,
      document: window.document,
      navigator: window.navigator,
      HTMLElement: window.HTMLElement,
      Node: window.Node,
      Element: window.Element,
      Event: window.Event,
      MouseEvent: window.MouseEvent,
      getComputedStyle: window.getComputedStyle.bind(window),
    })) {
      Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    }
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    ({ createRoot } = await import("react-dom/client"));
  }
  ({ SignInPattern, errorText } = await import(pathToFileURL(transpile()).href));
});

after(async () => {
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
  dom?.window.close();
  rmSync(out, { recursive: true, force: true });
});

const PROVIDERS = [{ id: "sso", label: "Continue with company SSO" }];
const WRONG = { title: "Email or password is wrong", detail: "4 tries left before a 15-minute lock." };

const ssr = (props) => render(h(SignInPattern, props));

async function mount(props) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(h(SignInPattern, props)));
  return {
    container,
    rerender: (next) => act(async () => root.render(h(SignInPattern, next))),
  };
}

/** Sets a React-controlled input's value the way typing does. */
function type(input, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, value);
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
}

describe("SignInPattern credentials step", () => {
  test("Card title is the h1; SSO sits above the email form under Divider 'or use email'", () => {
    const html = ssr({ providers: PROVIDERS });
    assert.match(html, /<h1[^>]*>Sign in<\/h1>/);
    assert.ok(!html.includes("<h2"));
    const sso = html.indexOf("Continue with company SSO");
    const divider = html.indexOf("or use email");
    const form = html.indexOf("<form");
    assert.ok(sso > 0 && sso < divider && divider < form, "SSO, then Divider, then the form");
    assert.match(html, /autoComplete="username"|autocomplete="username"/i);
    assert.match(html, /autocomplete="current-password"/i);
    assert.match(html, />Stay signed in 30 days</);
  });

  test("one solid primary; invite line instead of Sign up when onSwitchMode is left out", () => {
    const html = ssr({ providers: PROVIDERS, onForgotPassword() {} });
    assert.equal((html.match(/type="submit"/g) ?? []).length, 1);
    assert.match(html, /No account\? Ask your admin for an invite\./);
    assert.ok(!html.includes(">Sign up<"));
    const withSwitch = ssr({ onSwitchMode() {} });
    assert.match(withSwitch, />Sign up</);
    assert.ok(!withSwitch.includes("Ask your admin"));
  });

  test("error { title, detail }: Alert title plus detail, description hidden", () => {
    const html = ssr({ error: WRONG });
    assert.match(html, /role="alert"/);
    assert.match(html, />Email or password is wrong</);
    assert.match(html, />4 tries left before a 15-minute lock\.</);
    assert.ok(!html.includes("Use your work account."));
  });

  test("error as a plain string still renders the Alert", () => {
    const html = ssr({ error: "Something went wrong. Try again." });
    assert.match(html, /role="alert"/);
    assert.match(html, />Something went wrong\. Try again\.</);
  });

  test("errorText joins title and detail, and passes strings through", () => {
    assert.equal(errorText(undefined), "");
    assert.equal(errorText("Plain"), "Plain");
    assert.equal(errorText({ title: "That code expired." }), "That code expired.");
    assert.equal(errorText({ title: "That code expired.", detail: "Enter the new one." }), "That code expired. Enter the new one.");
  });

  test("a new server error clears the password, keeps the email and focuses Password", { skip }, async () => {
    const { container, rerender } = await mount({ onSubmit() {} });
    const [email, password] = container.querySelectorAll("input[type=email], input[type=password]");
    await act(async () => type(email, "maya.chen@northwind.com"));
    await act(async () => type(password, "hunter22"));
    await rerender({ onSubmit() {}, error: WRONG });
    assert.equal(email.value, "maya.chen@northwind.com");
    assert.equal(password.value, "");
    assert.equal(document.activeElement, password);
  });

  test("Enter with an empty form shows Field errors and focuses the email", { skip }, async () => {
    let submitted = false;
    const { container } = await mount({ onSubmit: () => (submitted = true) });
    const form = container.querySelector("form");
    await act(async () => form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
    assert.equal(submitted, false);
    assert.match(container.innerHTML, /Enter your work email\./);
    assert.equal(document.activeElement, container.querySelector("input[type=email]"));
  });
});

describe("SignInPattern code step", () => {
  test("step code: h1 'Enter your code', InputOTP 3+3 one-time-code, Verify is the only primary", () => {
    const html = ssr({ step: "code", providers: PROVIDERS, onSwitchMode() {} });
    assert.match(html, /<h1[^>]*>Enter your code<\/h1>/);
    assert.match(html, />From your authenticator app\.</);
    assert.match(html, />6-digit code</);
    assert.match(html, />The code changes every 30 seconds\.</);
    assert.match(html, /autocomplete="one-time-code"/i);
    assert.match(html, /inputmode="numeric"/i);
    assert.match(html, />Verify</);
    assert.equal((html.match(/type="submit"/g) ?? []).length, 1);
    assert.ok(!html.includes("Continue with company SSO"), "no SSO on the code step");
    assert.ok(!html.includes(">Sign up<"), "no footer on the code step");
  });

  test("Back and Use a backup code show only with their callbacks, as ghost buttons under Verify", () => {
    const none = ssr({ step: "code" });
    assert.ok(!none.includes(">Back<") && !none.includes("Use a backup code"));
    const both = ssr({ step: "code", onBack() {}, onBackupCode() {} });
    const verify = both.indexOf(">Verify<");
    assert.ok(verify > 0 && verify < both.indexOf("Back<") && both.indexOf("Back<") < both.indexOf("Use a backup code"));
    assert.equal((both.match(/type="submit"/g) ?? []).length, 1, "Back and backup code are not submit buttons");
  });

  test("error on the code step is the Field error, not an Alert", () => {
    const html = ssr({ step: "code", error: { title: "That code expired.", detail: "Enter the new one from your app." } });
    assert.ok(!html.includes('role="alert"'), "no Alert on the code step");
    assert.match(html, /That code expired\. Enter the new one from your app\./);
    assert.match(html, /aria-invalid="true"/);
  });

  test("moving to the code step focuses the code; Verify sends the 6 digits", { skip }, async () => {
    const codes = [];
    const props = { onSubmit() {}, onVerifyCode: (code) => codes.push(code) };
    const { container, rerender } = await mount(props);
    await rerender({ ...props, step: "code" });
    const input = container.querySelector('input[autocomplete="one-time-code"]');
    assert.equal(document.activeElement, input);

    const form = container.querySelector("form");
    await act(async () => type(input, "482"));
    await act(async () => form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
    assert.deepEqual(codes, [], "partial code is not sent");
    assert.match(container.innerHTML, /Enter the 6-digit code\./);

    await act(async () => type(input, "482917"));
    await act(async () => form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
    assert.deepEqual(codes, ["482917"]);

    await rerender({ ...props, step: "code", error: "That code expired." });
    assert.equal(input.value, "", "the slots clear on a new error");
    assert.equal(document.activeElement, input);

    let backs = 0;
    await rerender({ ...props, step: "code", onBack: () => backs++ });
    const back = [...container.querySelectorAll("button")].find((b) => b.textContent.includes("Back"));
    await act(async () => back.click());
    assert.equal(backs, 1);
    await rerender({ ...props, step: "credentials" });
    assert.equal(document.activeElement, container.querySelector("input[type=password]"), "back returns to Password");
  });
});
