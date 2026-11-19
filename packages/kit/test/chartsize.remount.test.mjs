/**
 * Charts measure their plot with useChartSize. ChartFrame swaps the plot out for the table and back,
 * so the plot div remounts: the new node must be measured, or the chart stays blank. Uses jsdom
 * (kit devDependency) with a stub ResizeObserver and a clientWidth that is 0 once a node is detached,
 * like a browser. Runs against the built kit (dist); `npm test` builds first.
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import { after, before, describe, test } from "node:test";

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

const PLOT_WIDTH = 600;
const observers = new Set();

class StubResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.nodes = new Set();
  }
  observe(node) {
    this.nodes.add(node);
    observers.add(this);
  }
  unobserve(node) {
    this.nodes.delete(node);
  }
  disconnect() {
    this.nodes.clear();
    observers.delete(this);
  }
}

/** Fire every live observer, as a browser does when an observed node's box changes (or it is detached). */
function flushObservers() {
  for (const observer of [...observers]) {
    const entries = [...observer.nodes].map((target) => ({ target }));
    if (entries.length) observer.callback(entries, observer);
  }
}

let dom;
let h;
let act;
let createRoot;
let kit;
let root;
let container;

before(async () => {
  if (skip) return;
  dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost/" });
  const { window } = dom;
  Object.defineProperty(window.HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return this.isConnected ? PLOT_WIDTH : 0;
    },
  });
  window.ResizeObserver = StubResizeObserver;
  for (const [key, value] of Object.entries({
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    Node: window.Node,
    Element: window.Element,
    Event: window.Event,
    MouseEvent: window.MouseEvent,
    PointerEvent: window.PointerEvent ?? window.MouseEvent,
    ResizeObserver: StubResizeObserver,
    getComputedStyle: window.getComputedStyle.bind(window),
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  })) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  globalThis.matchMedia = window.matchMedia;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const React = await import("react");
  h = React.createElement;
  act = React.act;
  ({ createRoot } = await import("react-dom/client"));
  kit = {
    ...(await import("../dist/ui/LineChart/LineChart.js")),
    ...(await import("../dist/ui/BarChart/BarChart.js")),
  };
});

after(async () => {
  if (skip) return;
  if (root) await act(async () => root.unmount());
  dom.window.close();
});

const toggle = () => container.querySelector("button[aria-controls]");
const marks = () => container.querySelectorAll("svg path, svg rect").length;

async function roundTrip(element) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(element));
  await act(async () => flushObservers());
  const drawn = marks();

  await act(async () => toggle().dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
  assert.ok(container.querySelector("table"), "table view shows");
  await act(async () => toggle().dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
  // The detached plot reports 0 wide; only the remounted one should be listened to.
  await act(async () => flushObservers());

  assert.equal(container.querySelector("table"), null, "chart view is back");
  assert.equal(marks(), drawn, "the chart redraws after Table → Chart");
  await act(async () => root.unmount());
  root = null;
  container.remove();
}

describe("useChartSize remount", { skip }, () => {
  test("LineChart redraws after the table round trip", async () => {
    await roundTrip(
      h(kit.LineChart, {
        title: "Runs",
        labels: ["Jan", "Feb", "Mar", "Apr"],
        series: [
          { label: "Free", data: [10, 14, 12, 18], color: "var(--chart-1)" },
          { label: "Pro", data: [4, 6, 9, 8], color: "var(--chart-2)" },
        ],
      }),
    );
  });

  test("BarChart redraws after the table round trip", async () => {
    await roundTrip(
      h(kit.BarChart, {
        title: "Spend",
        data: [
          { label: "North", value: 2 },
          { label: "South", value: 4 },
        ],
      }),
    );
  });
});
