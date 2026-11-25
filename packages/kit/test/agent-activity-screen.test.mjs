/**
 * Agent activity screen (Paper p-A-1, 4JQS-0): ActivityFeed variant="agent" (Undo with a deadline,
 * Undone, Final, sentence/meta/reason, the rail with Avatar markers, no built-in filters) and the
 * agent-activity pattern. jsdom drives the Undo click. Runs against the built kit (dist).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, describe, mock, test } from "node:test";

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

const NOW = Date.UTC(2026, 10, 21, 14, 14); // Sat 21 Nov 2026, 14:14 UTC
const MIN = 60_000;
const collections = { id: "ca", name: "Collections agent", initials: "CA" };
const invoicing = { id: "ia", name: "Invoicing agent", initials: "IA" };

const steps = (onUndo = () => {}) => [
  {
    id: "s1",
    at: NOW - 2 * MIN,
    actor: collections,
    sentence: "Sent reminder for INV-1842 to Northwind",
    meta: "Collections agent · Gmail · Overdue follow-up · On its own",
    reason: "Allowed 7 days after the due date.",
    undo: { until: NOW + 8 * MIN, onUndo },
  },
  {
    id: "s2",
    at: NOW - 34 * MIN,
    actor: invoicing,
    sentence: "Applied £48.00 credit to INV-1851 for Fernway Tours",
    meta: "Invoicing agent · Stripe · Plan change · Approved by Boris",
    state: "undone",
    note: "Undone by Boris at 13:52.",
  },
  {
    id: "s3",
    at: NOW - 22 * 60 * MIN,
    actor: invoicing,
    sentence: "Issued INV-1856 to Quarry Coffee for £260.00",
    meta: "Invoicing agent · Stripe · November invoices · Approved by Boris",
    reason: "Already with the customer, so void it from the invoice.",
    state: "final",
    note: "Void it from the invoice",
  },
];

let h;
let act;
let useState;
let renderToStaticMarkup;
let createRoot;
let ActivityFeed;
let logic;
let dom;
const mounted = [];

before(async () => {
  const React = await import("react");
  h = React.createElement;
  act = React.act;
  useState = React.useState;
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ActivityFeed } = await import("../dist/ui/ActivityFeed/ActivityFeed.js"));
  logic = await import("../dist/ui/ActivityFeed/activityFeed.logic.js");
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

const render = (props) =>
  renderToStaticMarkup(h(ActivityFeed, { variant: "agent", title: "Agent activity", events: steps(), now: NOW, timeZone: "UTC", ...props }));

describe("ActivityFeed variant=\"agent\"", () => {
  test("day groups, newest first, with a time column, Avatar markers and the rail line", () => {
    const html = render();
    assert.ok(html.indexOf(">Today<") < html.indexOf(">Yesterday<"));
    assert.ok(html.indexOf("INV-1842") < html.indexOf("INV-1851"));
    assert.match(html, /_agentTime_[^>]*>14:12</);
    assert.match(html, />CA</);
    assert.match(html, />IA</);
    assert.equal((html.match(/_railLine_/g) ?? []).length, 1, "only between the two steps of Today");
  });

  test("sentence, meta and reason; no built-in filters or visible heading", () => {
    const html = render();
    assert.match(html, /Collections agent · Gmail · Overdue follow-up · On its own/);
    assert.match(html, /Allowed 7 days after the due date\./);
    assert.doesNotMatch(html, /Filter activity/);
    assert.doesNotMatch(html, />Type</);
    assert.match(html, /<header class="_srOnly_[^"]*"><h2[^>]*>Agent activity<\/h2>/);
  });

  test("undo: an sm Undo Button with the mono deadline, described by the sentence and deadline", () => {
    const html = render();
    assert.match(html, />14:22 · 8 min left</);
    assert.match(html, /<button[^>]*aria-describedby="[^"]*-s1-sentence [^"]*-s1-until"[\s\S]*?Undo[\s\S]*?<\/button>/);
    assert.equal(logic.undoLeft(NOW - MIN, NOW), null, "no Undo after the deadline");
    const late = render({ events: [{ ...steps()[0], undo: { until: NOW - MIN, onUndo() {} } }] });
    assert.doesNotMatch(late, />Undo</);
  });

  test("undone: struck sentence, Undone Badge and the note; final: Lock Badge Final and the note", () => {
    const html = render();
    assert.match(html, /_agentStruck_[^>]*>Applied £48\.00 credit/);
    assert.match(html, /lucide-undo-2[\s\S]*?Undone/);
    assert.match(html, /Undone by Boris at 13:52\./);
    assert.match(html, /lucide-lock[\s\S]*?Final/);
    assert.match(html, />Void it from the invoice</);
  });

  test("Load earlier days with hasMore; empty and error states", () => {
    assert.match(render({ hasMore: true, onLoadMore() {} }), />Load earlier days</);
    assert.doesNotMatch(render({ onLoadMore() {} }), />Load earlier days</);
    assert.match(render({ events: [] }), /No steps yet/);
    assert.match(render({ events: [], error: "Network", onRetry() {} }), /Couldn&#x27;t load activity[\s\S]*Retry/);
  });

  test("feed and history are unchanged", () => {
    const html = renderToStaticMarkup(
      h(ActivityFeed, {
        events: [{ id: "e", type: "comment", actor: { id: "m", name: "Maya" }, verb: "commented on", object: "Pricing", at: NOW }],
        now: NOW,
        timeZone: "UTC",
      }),
    );
    assert.match(html, /Filter activity/);
    assert.doesNotMatch(html, /_agentTime_/);
  });

  test("clicking Undo calls onUndo; the page marks the step undone and focus moves to it", { skip }, async () => {
    let calls = 0;
    function Page() {
      const [undone, setUndone] = useState(false);
      const events = steps(() => {
        calls += 1;
        setUndone(true);
      }).map((step) => (step.id === "s1" && undone ? { ...step, undo: undefined, state: "undone", note: "Undone by you at 14:15." } : step));
      return h(ActivityFeed, { variant: "agent", events, now: NOW, timeZone: "UTC" });
    }
    const root = await mount(h(Page));
    const undo = [...root.querySelectorAll("button")].find((b) => b.textContent.trim() === "Undo");
    undo.focus();
    await act(async () => {
      undo.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    assert.equal(calls, 1);
    assert.equal([...root.querySelectorAll("button")].filter((b) => b.textContent.trim() === "Undo").length, 0);
    const row = root.querySelector("ol li");
    assert.match(row.querySelector("p").className, /_agentStruck_/);
    assert.match(row.textContent, /Undone/);
    assert.match(row.textContent, /Undone by you at 14:15\./);
    assert.equal(document.activeElement, row);
  });

  test("with no now prop, the deadline counts down each minute and Undo goes at its deadline", { skip }, async () => {
    mock.timers.enable({ apis: ["setTimeout", "Date"], now: NOW });
    try {
      const root = await mount(h(ActivityFeed, { variant: "agent", events: steps(), timeZone: "UTC" }));
      const undoButtons = () => [...root.querySelectorAll("button")].filter((b) => b.textContent.trim() === "Undo");
      assert.match(root.textContent, /14:22 · 8 min left/);
      await act(async () => mock.timers.tick(60_000));
      assert.match(root.textContent, /14:22 · 7 min left/);
      assert.equal(undoButtons().length, 1);
      await act(async () => mock.timers.tick(7 * 60_000));
      assert.equal(undoButtons().length, 0, "Undo is gone at its deadline");
      assert.doesNotMatch(root.textContent, /min left/);
      // No Undo left, so no timer is pending: another tick changes nothing.
      await act(async () => mock.timers.tick(10 * 60_000));
      assert.equal(undoButtons().length, 0);
    } finally {
      mock.timers.reset();
    }
  });
});

describe("agent-activity pattern", () => {
  const source = readFileSync(join(kitDir, "patterns/AgentActivityPattern/AgentActivityPattern.tsx"), "utf8");
  const contract = JSON.parse(readFileSync(join(kitDir, "contracts/patterns/agent-activity.json"), "utf8"));
  const index = JSON.parse(readFileSync(join(kitDir, "contracts/index.json"), "utf8"));

  test("composes AppHeader, PageHeader with Ask, FilterBar and ActivityFeed variant=\"agent\" in a Card", () => {
    assert.match(source, /<AppHeader/);
    assert.match(source, /<PageHeader/);
    assert.match(source, /iconStart="MessageCircle"/);
    assert.match(source, /<FilterBar/);
    assert.match(source, /maxVisible=\{narrow \? 2 : undefined\}/);
    assert.match(source, /<Card[\s\S]*<ActivityFeed\s+variant="agent"/);
    assert.match(source, /<Toast/);
    assert.doesNotMatch(source, /appearance="solid"/);
  });

  test("copy-in contract is in the index", () => {
    assert.equal(contract.delivery, "copy-in");
    const entry = index.find((item) => item.id === "agent-activity");
    assert.ok(entry && entry.group === "pattern" && entry.path === "contracts/patterns/agent-activity.json");
  });
});
