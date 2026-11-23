/**
 * FilterBar, FilterButton, Combobox and MultiSelect on the shared control scale: one ChevronDown
 * on every trigger (the +N overflow, Combobox and the MultiSelect trailing button), the split
 * chip's two buttons, and CSS heights of 32 / 36 / 40. SSR through the CSS stub. Runs against the
 * built kit (dist): build first (npm run build -w agentic-ds-kit).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";
import { before, describe, test } from "node:test";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function load(url, context, next) {
  if (url.endsWith(".css")) return { format: "module", source: "", shortCircuit: true };
  return next(url, context);
}`),
);

const css = (name) => readFileSync(new URL(`../ui/${name}/${name}.module.css`, import.meta.url), "utf8");

let h;
let render;
let FilterBar;
let FilterButton;
let Combobox;
let MultiSelect;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  ({ FilterBar } = await import("../dist/ui/FilterBar/FilterBar.js"));
  ({ FilterButton } = await import("../dist/ui/FilterButton/FilterButton.js"));
  ({ Combobox } = await import("../dist/ui/Combobox/Combobox.js"));
  ({ MultiSelect } = await import("../dist/ui/MultiSelect/MultiSelect.js"));
});

const options = [
  { value: "open", label: "Open" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
];

describe("FilterBar", () => {
  test("the +N overflow is a DropdownMenu trigger with a ChevronDown, like the chips", () => {
    const html = render(
      h(FilterBar, {
        filters: [
          { id: "status", label: "Status", value: "Overdue" },
          { id: "plan", label: "Plan" },
          { id: "owner", label: "Owner", count: 2 },
          { id: "amount", label: "Amount" },
        ],
        maxVisible: 2,
      }),
    );
    // DropdownMenu adds aria-haspopup and aria-expanded to its trigger on the client.
    const overflow = html.slice(html.lastIndexOf("<button"));
    assert.match(overflow, /<span>\+2<\/span>/);
    assert.match(overflow, /lucide-chevron-down/);
    assert.doesNotMatch(html, /chevrons-up-down/);
  });
});

describe("FilterButton", () => {
  test("a set filter with onToggle splits into a pressed toggle and an options button", () => {
    const html = render(h(FilterButton, { value: "Overdue", onToggle: () => {}, onClick: () => {} }, "Status"));
    assert.match(html, /aria-pressed="true"/);
    assert.match(html, /aria-label="Status options"/);
    assert.match(html, /aria-expanded="false"/);
  });

  test("heights sit on the shared scale: sm 32, md 36, lg 40", () => {
    const source = css("FilterButton");
    assert.match(source, /\.sm \{\s*--h: var\(--space-8\);/);
    assert.match(source, /\.md \{\s*--h: calc\(var\(--space-8\) \+ var\(--space-1\)\);/);
    assert.match(source, /\.lg \{\s*--h: var\(--space-10\);/);
  });

  test("off uses the page canvas fill and disabled uses surface-disabled, not opacity", () => {
    const source = css("FilterButton");
    assert.match(source, /\.off \{[^}]*background: var\(--surface-page\);/);
    assert.match(source, /background: var\(--surface-disabled\);/);
    assert.doesNotMatch(source, /opacity-disabled/);
    assert.doesNotMatch(source, /background: transparent;\s*\}\s*\.off \.chevron/);
  });
});

describe("Combobox", () => {
  test("one ChevronDown toggle, no up-down chevrons", () => {
    const html = render(h(Combobox, { id: "customer", options, ariaLabel: "Customer" }));
    assert.match(html, /role="combobox"/);
    assert.match(html, /aria-label="Show suggestions"/);
    assert.match(html, /lucide-chevron-down/);
    assert.doesNotMatch(html, /chevrons-up-down/);
  });

  test("md is 36 and sm is 32 tall", () => {
    const source = css("Combobox");
    assert.match(source, /\.shellSm \{\s*height: var\(--space-8\);/);
    assert.match(source, /\.shellMd \{\s*height: calc\(var\(--space-8\) \+ var\(--space-1\)\);/);
  });
});

describe("MultiSelect", () => {
  test("a trailing ChevronDown button opens the list, after the tags", () => {
    const html = render(
      h(MultiSelect, { id: "status", options, defaultValue: ["open", "overdue"], ariaLabel: "Status" }),
    );
    assert.match(html, /aria-label="Show options"/);
    assert.match(html, /lucide-chevron-down/);
    const tagAt = html.indexOf("Overdue");
    const chevronAt = html.indexOf("Show options");
    assert.ok(tagAt > -1 && chevronAt > tagAt, "chevron comes after the tags");
  });

  test("a disabled MultiSelect disables its chevron button too", () => {
    const html = render(h(MultiSelect, { id: "status", options, disabled: true, ariaLabel: "Status" }));
    assert.match(html, /<button[^>]*aria-label="Show options"[^>]*disabled=""|<button[^>]*disabled=""[^>]*aria-label="Show options"/);
  });
});

describe("Sizes and new props (SSR)", () => {
  test("lg renders on FilterBar chips, Combobox and MultiSelect", () => {
    const bar = render(h(FilterBar, { size: "lg", filters: [{ id: "status", label: "Status" }] }));
    assert.match(bar, /width="18"/);
    const combo = render(h(Combobox, { id: "c", size: "lg", options, ariaLabel: "Customer" }));
    assert.match(combo, /width="18"/);
    const multi = render(h(MultiSelect, { id: "m", size: "lg", options, ariaLabel: "Status" }));
    assert.match(multi, /width="18"/);
  });

  test("leading renders first in the row, before the chips", () => {
    const html = render(
      h(FilterBar, {
        leading: h("input", { "aria-label": "Search customers" }),
        filters: [{ id: "status", label: "Status" }],
      }),
    );
    assert.ok(html.indexOf("Search customers") < html.indexOf("Status"));
  });

  test("renderSheet adds a Filters chip with the applied count that opens a dialog", () => {
    const html = render(
      h(FilterBar, {
        filters: [
          { id: "status", label: "Status", value: "Overdue" },
          { id: "owner", label: "Owner", count: 2 },
          { id: "plan", label: "Plan" },
        ],
        renderSheet: () => h("p", null, "fields"),
      }),
    );
    const compact = html.slice(html.lastIndexOf("<button"));
    assert.match(compact, /aria-haspopup="dialog"/);
    assert.match(compact, />Filters</);
    assert.match(compact, /2 filters applied/);
  });
});

let JSDOM = null;
try {
  ({ JSDOM } = await import("jsdom"));
} catch {
  JSDOM = null;
}

describe("Combobox popup states", { skip: JSDOM ? false : "jsdom is not installed" }, () => {
  let dom;
  let act;
  let root;
  let container;

  before(async () => {
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
      MouseEvent: window.MouseEvent,
      getComputedStyle: window.getComputedStyle.bind(window),
    })) {
      Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    }
    window.HTMLElement.prototype.scrollIntoView ??= () => {};
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    act = (await import("react")).act;
    const { createRoot } = await import("react-dom/client");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  async function openWith(props) {
    await act(async () => root.render(h(Combobox, { id: "c", ariaLabel: "Customer", options: [], ...props })));
    await act(async () => container.querySelector("input[role=combobox]").click());
    return container;
  }

  test("start hint before any query, and no list", async () => {
    const el = await openWith({ startLabel: "Start typing to find a customer", onQueryChange: () => {} });
    assert.equal(el.querySelector("[role=status]").textContent, "Start typing to find a customer");
    assert.equal(el.querySelector("[role=listbox]").hidden, true);
  });

  test("loading shows a kit Spinner with loadingLabel", async () => {
    const el = await openWith({ loading: true, loadingLabel: "Loading customers", onQueryChange: () => {} });
    const status = el.querySelectorAll("[role=status]");
    assert.equal(status.length, 1);
    assert.equal(status[0].textContent, "Loading customers");
  });

  test("no results shows emptyLabel; a list hides the status", async () => {
    let el = await openWith({ emptyLabel: "No customer matches" });
    assert.equal(el.querySelector("[role=status]").textContent, "No customer matches");
    el = await openWith({ options });
    assert.equal(el.querySelector("[role=status]"), null);
    assert.equal(el.querySelector("[role=listbox]").hidden, false);
    assert.equal(el.querySelectorAll("[role=option]").length, 3);
  });
});
