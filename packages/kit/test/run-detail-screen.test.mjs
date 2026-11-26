/**
 * Run detail screen (Paper p-A-1, 4LD6-0): RunDetail without agents, calls="all", trace and onStop;
 * AgentMonitor's collapsed bar with Pause and Stop run behind an AlertDialog; the run-detail pattern.
 * Uses jsdom for the Stop run click flow. Runs against the built kit (dist); `npm test` builds first.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, describe, test } from "node:test";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function load(url, context, next) {
  if (url.endsWith(".css")) return { format: "module", source: "", shortCircuit: true };
  return next(url, context);
}`),
);

const kitDir = join(dirname(fileURLToPath(import.meta.url)), "..");

let JSDOM = null;
try {
  ({ JSDOM } = await import("jsdom"));
} catch {
  JSDOM = null;
}
const skip = JSDOM ? false : "jsdom is not installed";

const steps = [
  { id: "fetch", agentId: "a", tool: "stripe.charges.list", label: "Fetch Stripe charges", status: "done", target: "3 charges since 1 Nov", duration: "1.2s", args: { customer: "cus_1" }, result: ["ch_1 $2,000.00"] },
  { id: "match", agentId: "a", tool: "ledger.match_payments", label: "Match payments", status: "failed", target: "3 charges against INV-1842", duration: "0.6s", error: ["Short by $72.00"], attempt: { n: 1, max: 3 } },
  { id: "post", agentId: "a", tool: "ledger.post_entries", label: "Update ledger", status: "pending" },
];
const failedRun = { name: "Invoice reconciler", status: "failed", headline: "Stopped at Match payments, step 2 of 4", elapsed: "0:04", cost: "$0.02" };
const trace = [
  { id: "m", label: "Plan", kind: "model", startMs: 0, endMs: 600, cost: 0.01 },
  { id: "t", label: "ledger.match_payments", kind: "tool", startMs: 600, endMs: 1200, failed: true },
];

let h;
let act;
let renderToStaticMarkup;
let createRoot;
let RunDetail;
let AgentMonitor;
let dom;
const mounted = [];

before(async () => {
  const React = await import("react");
  h = React.createElement;
  act = React.act;
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ RunDetail } = await import("../dist/ui/RunDetail/RunDetail.js"));
  ({ AgentMonitor } = await import("../dist/ui/AgentMonitor/AgentMonitor.js"));
  if (skip) return;
  dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost/" });
  const { window } = dom;
  for (const [key, value] of Object.entries({
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    Node: window.Node,
    Element: window.Element,
    Event: window.Event,
    KeyboardEvent: window.KeyboardEvent,
    MouseEvent: window.MouseEvent,
    getComputedStyle: window.getComputedStyle.bind(window),
    requestAnimationFrame: (cb) => setTimeout(cb, 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
  })) {
    if (key === "window") value.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  ({ createRoot } = await import("react-dom/client"));
});

after(async () => {
  if (skip) return;
  while (mounted.length) {
    const root = mounted.pop();
    await act(async () => root.unmount());
  }
  dom.window.close();
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
  await act(async () => {
    element.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

const buttonNamed = (scope, name) => [...scope.querySelectorAll("button")].find((b) => b.textContent.trim() === name);

describe("RunDetail calls=\"all\"", () => {
  test("no agents: no AgentTree, and every started step has a ToolCallCard", () => {
    const html = renderToStaticMarkup(h(RunDetail, { run: failedRun, steps, calls: "all", onRetry: () => {} }));
    assert.doesNotMatch(html, />Agents</);
    const calls = html.slice(html.indexOf('aria-label="Tool calls"'));
    assert.equal((calls.match(/aria-expanded=/g) ?? []).length, 2, "fetch and match, not the pending step");
    assert.doesNotMatch(calls, /ledger\.post_entries/);
    assert.match(html, /Attempt 1 of 3/);
  });

  test("Retry shows once, on the failed ToolCallCard, not in the monitor", () => {
    const html = renderToStaticMarkup(h(RunDetail, { run: failedRun, steps, calls: "all", onRetry: () => {} }));
    // One Retry per width: sm beside the attempt, and lg across the card below 25rem (CSS shows one).
    assert.equal((html.match(/>Retry</g) ?? []).length, 2);
    assert.doesNotMatch(html, /Retry step/);
    assert.doesNotMatch(html, /Open failed step/);
  });

  test("the monitor is the collapsed bar: status word and icon, headline, elapsed and cost", () => {
    const html = renderToStaticMarkup(h(RunDetail, { run: failedRun, steps, calls: "all" }));
    const monitor = html.match(/<section class="_collapsed_[\s\S]*?<\/section>/)[0];
    assert.match(monitor, />failed</);
    assert.match(monitor, /lucide-circle-x/);
    assert.match(monitor, /Stopped at Match payments, step 2 of 4/);
    assert.match(monitor, /0:04/);
    assert.match(monitor, /\$0\.02/);
  });

  test("the trail shows the tool alone; calls fold once the run is done", () => {
    const failed = renderToStaticMarkup(h(RunDetail, { run: failedRun, steps, calls: "all" }));
    assert.match(failed, />stripe\.charges\.list</);
    assert.doesNotMatch(failed, /stripe\.charges\.list 3 charges/);
    const doneSteps = steps.map((s) => ({ ...s, status: "done", error: undefined, attempt: undefined }));
    const done = renderToStaticMarkup(h(RunDetail, { run: { ...failedRun, status: "done" }, steps: doneSteps, calls: "all" }));
    assert.doesNotMatch(done, /aria-expanded="true"/);
    assert.match(failed, /aria-expanded="true"/);
  });

  test("trace renders TraceWaterfall compact in place of the step strip", () => {
    const html = renderToStaticMarkup(h(RunDetail, { run: failedRun, steps, trace }));
    assert.match(html, /class="_compact_/);
    assert.match(html, /aria-label="Run trace: /);
    assert.doesNotMatch(html, /Step 1: stripe\.charges\.list/, "no strip tiles");
    const withStrip = renderToStaticMarkup(h(RunDetail, { run: failedRun, steps }));
    assert.match(withStrip, /Step 1: stripe\.charges\.list/);
  });

  test("calls=\"selected\" stays the default and agents stay optional there too", () => {
    const html = renderToStaticMarkup(h(RunDetail, { run: failedRun, steps }));
    assert.match(html, /No step selected/);
    assert.doesNotMatch(html, />Agents</);
  });
});

describe("Run detail looks (approved variants)", () => {
  test("calls=\"all\" uses AgentTrail list: no status line, Failed on the right, counter \"2 of 4\"-style", () => {
    const html = renderToStaticMarkup(h(RunDetail, { run: failedRun, steps, calls: "all" }));
    const trail = html.slice(html.indexOf(">Steps<"), html.indexOf('aria-label="Tool calls"'));
    assert.match(trail, />2 of 3</);
    assert.doesNotMatch(trail, /_line_/, "no rail line");
    assert.doesNotMatch(trail, /_statusBlock_/, "no status line under the label");
    assert.match(trail, /Failed/);
    assert.match(trail, /Queued/);
  });

  test("calls=\"all\" uses ToolCallCard panel: no status Badge, Arguments and Result side by side, arrays on one line", () => {
    const html = renderToStaticMarkup(
      h(RunDetail, { run: failedRun, steps: [{ ...steps[0], args: { charges: ["a", "b"] } }, steps[1]], calls: "all", onRetry: () => {} }),
    );
    const calls = html.slice(html.indexOf('aria-label="Tool calls"'));
    assert.doesNotMatch(calls, /_badge_/);
    assert.match(calls, /_panelPair_/);
    assert.match(calls, /&quot;charges&quot;: \[&quot;a&quot;, &quot;b&quot;\]/);
    assert.ok(calls.indexOf("Attempt 1 of 3") < calls.indexOf(">Retry<"), "attempt before Retry");
  });

  test("the default looks stay: rail trail and Badge card outside calls=\"all\"", async () => {
    const { AgentTrail } = await import("../dist/ui/AgentTrail/AgentTrail.js");
    const { ToolCallCard } = await import("../dist/ui/ToolCallCard/ToolCallCard.js");
    const trail = renderToStaticMarkup(h(AgentTrail, { title: "t", steps: [{ id: "a", label: "A", status: "done" }, { id: "b", label: "B", status: "failed" }] }));
    assert.match(trail, /_line_/);
    assert.match(trail, />2\/2</);
    const card = renderToStaticMarkup(h(ToolCallCard, { name: "x", status: "error", error: "boom" }));
    assert.match(card, /_badge_/);
  });
});

describe("Run detail fixes from check #326", () => {
  const doneSteps = [
    { ...steps[0] },
    { ...steps[1] },
    { id: "match-2", agentId: "a", tool: "ledger.match_payments", label: "Match payments", status: "done", duration: "0.5s" },
    { ...steps[2], status: "done", duration: "0.4s" },
    { id: "mark", agentId: "a", tool: "billing.invoices.update", label: "Mark INV-1842 paid", status: "done", duration: "0.3s" },
  ];

  test("done run with a retried step: the counter reads 5 of 5 and the old failed attempt is not current", () => {
    const html = renderToStaticMarkup(h(RunDetail, { run: { ...failedRun, status: "done", headline: "INV-1842 marked paid" }, steps: doneSteps, calls: "all" }));
    assert.match(html, />5 of 5</);
    assert.doesNotMatch(html, /aria-current="step"/);
  });

  test("a failed step with no later done step is still open and current", () => {
    const html = renderToStaticMarkup(h(RunDetail, { run: failedRun, steps, calls: "all" }));
    assert.match(html, />2 of 3</);
    assert.equal((html.match(/aria-current="step"/g) ?? []).length, 1);
  });

  test("panel at phone width: folded Arguments under the error and an lg full-width Retry", () => {
    const html = renderToStaticMarkup(h(RunDetail, { run: failedRun, steps: [steps[0], { ...steps[1], args: { invoice: "INV-1842" } }], calls: "all", onRetry: () => {} }));
    assert.match(html, /<button type="button" class="[^"]*panelFoldHead[^"]*" aria-expanded="false"[^>]*><span>Arguments<\/span>/);
    assert.match(html, /<pre id="[^"]+" class="[^"]*panelFoldCode[^"]*" aria-label="Arguments" hidden="">/);
    assert.match(html, /class="[^"]*lg[^"]*block[^"]*"[^>]*>(?:(?!<\/button>).)*Retry/s);
  });

  test("the running bar puts Stop run and Pause on a row of their own", () => {
    const html = renderToStaticMarkup(h(AgentMonitor, { name: "x", status: "running", elapsed: "0:03", collapsed: true, onPause: () => {}, onStop: () => {} }));
    assert.match(html, /class="_barActions_[^"]*"[\s\S]*Stop run[\s\S]*Pause/);
  });
});

describe("AgentMonitor Stop run", () => {
  test("running: Stop run (outline danger) beside Pause in the card and the bar", () => {
    for (const collapsed of [false, true]) {
      const html = renderToStaticMarkup(h(AgentMonitor, { name: "Invoice reconciler", status: "running", elapsed: "0:03", onPause: () => {}, onStop: () => {}, collapsed }));
      assert.match(html, />Pause</);
      assert.match(html, />Stop run</);
    }
    const idle = renderToStaticMarkup(h(AgentMonitor, { name: "x", status: "failed", onStop: () => {}, collapsed: true }));
    assert.doesNotMatch(idle, /Stop run/, "only while running");
  });

  test("Stop run asks once in an AlertDialog; Keep running cancels, Stop run calls onStop", { skip }, async () => {
    let stopped = 0;
    const container = await mount(h(AgentMonitor, { name: "Invoice reconciler", status: "running", elapsed: "0:03", collapsed: true, onPause: () => {}, onStop: () => stopped++ }));
    await click(buttonNamed(container, "Stop run"));
    let dialog = document.querySelector('[role="alertdialog"]');
    assert.ok(dialog, "dialog opens");
    assert.match(dialog.textContent, /Stop this run\?/);
    await click(buttonNamed(dialog, "Keep running"));
    assert.equal(stopped, 0);
    assert.equal(document.querySelector('[role="alertdialog"]'), null);
    await click(buttonNamed(container, "Stop run"));
    dialog = document.querySelector('[role="alertdialog"]');
    await click(buttonNamed(dialog, "Stop run"));
    assert.equal(stopped, 1);
  });

  test("Escape closes the AlertDialog without stopping, and focus returns to Stop run", { skip }, async () => {
    let stopped = 0;
    const container = await mount(h(AgentMonitor, { name: "Invoice reconciler", status: "running", elapsed: "0:03", collapsed: true, onPause: () => {}, onStop: () => stopped++ }));
    const stop = buttonNamed(container, "Stop run");
    stop.focus();
    await click(stop);
    const dialog = document.querySelector('[role="alertdialog"]');
    assert.ok(dialog, "dialog opens");
    await act(async () => {
      (document.activeElement ?? dialog).dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    });
    await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
    assert.equal(document.querySelector('[role="alertdialog"]'), null, "dialog closes");
    assert.equal(stopped, 0);
    assert.equal(document.activeElement, buttonNamed(container, "Stop run"), "focus is back on Stop run");
  });

  test("RunDetail passes onStop through to the bar", () => {
    const html = renderToStaticMarkup(h(RunDetail, { run: { ...failedRun, status: "running" }, steps, calls: "all", onStop: () => {}, onPause: () => {} }));
    assert.match(html, />Stop run</);
  });
});

describe("run-detail pattern", () => {
  const source = readFileSync(join(kitDir, "patterns/RunDetailPattern/RunDetailPattern.tsx"), "utf8");
  const contract = JSON.parse(readFileSync(join(kitDir, "contracts/patterns/run-detail.json"), "utf8"));
  const index = JSON.parse(readFileSync(join(kitDir, "contracts/index.json"), "utf8"));

  test("composes AppHeader, PageHeader with a Runs breadcrumb, and RunDetail calls=\"all\" without agents", () => {
    assert.match(source, /<AppHeader/);
    assert.match(source, /<PageHeader/);
    assert.match(source, /label: RUN_PAGE\.runs/);
    assert.match(source, /calls="all"/);
    assert.doesNotMatch(source, /agents=/);
    assert.doesNotMatch(source, /messages=/);
  });

  test("copy-in contract is in the index", () => {
    assert.equal(contract.delivery, "copy-in");
    const entry = index.find((item) => item.id === "run-detail");
    assert.ok(entry && entry.group === "pattern" && entry.path === "contracts/patterns/run-detail.json");
  });
});
