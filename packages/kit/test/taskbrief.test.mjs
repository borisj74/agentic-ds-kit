/**
 * TaskBrief: the brief before the plan. Logic, SSR render through the CSS stub, one solid
 * primary, the Start gate and the started row. Runs against the built kit (dist): build first
 * (npm run build -w agentic-ds-kit).
 */
import assert from "node:assert/strict";
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

const filled = {
  goal: "Update the EU price list",
  criteria: ["Every SKU priced", "Totals match", ""],
  spendCap: 5,
  minutes: 30,
  maxSteps: 40,
  tools: ["read_sheet"],
};
const tools = [
  { value: "read_sheet", label: "Read sheets" },
  { value: "edit_sheet", label: "Edit sheets" },
];

let logic;
let React;
let renderToStaticMarkup;
let TaskBrief;
let Button;

before(async () => {
  logic = await import("../dist/ui/TaskBrief/taskBrief.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ TaskBrief } = await import("../dist/ui/TaskBrief/TaskBrief.js"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(TaskBrief, { value: filled, tools, ...props }));
}

function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = TaskBrief({ value: filled, tools, ...props });
      return out;
    }),
  );
  return out;
}

function findAll(node, type, hits = []) {
  if (!node || typeof node !== "object") return hits;
  if (Array.isArray(node)) {
    for (const child of node) findAll(child, type, hits);
    return hits;
  }
  if (node.type === type) hits.push(node);
  findAll(node.props?.children, type, hits);
  return hits;
}

const solidPrimaries = (html) => (html.match(/_solid_\w+ _primary_/g) ?? []).length;

describe("TaskBrief logic", () => {
  test("Start needs a goal and one filled check", () => {
    assert.equal(logic.canStart(filled), true);
    assert.equal(logic.canStart({ goal: " ", criteria: ["x"] }), false);
    assert.equal(logic.canStart({ goal: "x", criteria: ["", "  "] }), false);
    assert.equal(logic.startBlocker({ goal: "", criteria: [""] }), "Add a goal and one check to start.");
    assert.equal(logic.startBlocker({ goal: "x", criteria: [""] }), "Add one check to start.");
    assert.equal(logic.startBlocker(filled), "");
  });

  test("fold summary counts filled checks and set limits", () => {
    assert.equal(logic.foldSummary(filled), "2 checks · $5 cap · 30 min · 40 steps");
    assert.equal(logic.foldSummary({ goal: "x", criteria: ["a"] }), "1 check");
    assert.equal(logic.formatMoney(12.5, "EUR"), "€12.50");
    assert.equal(logic.foldSummary(filled, "EUR"), "2 checks · €5 cap · 30 min · 40 steps");
  });

  test("rows add up to eight and one always stays", () => {
    assert.equal(logic.addCriterion(Array(8).fill("a")).length, 8);
    assert.deepEqual(logic.addCriterion(["a"]), ["a", ""]);
    assert.deepEqual(logic.removeCriterion(["a"], 0), [""]);
  });
});

describe("TaskBrief render", () => {
  test("a labelled Card with goal, checks, limits, tools and check-in level", () => {
    const html = render({ onStart() {}, onSaveDraft() {} });
    assert.match(html, /<article[^>]*aria-labelledby="[^"]+"[^>]*>.*<h2[^>]*>New task<\/h2>/s);
    for (const text of ["Goal", "Done when", "Limits", "Spend cap", "Minutes", "Max steps", "Tools", "Check-in level", "Start", "Save draft"]) {
      assert.ok(html.includes(text), text);
    }
    assert.match(html, /aria-label="Check 1"/);
    assert.match(html, /aria-label="Remove check 1"/);
  });

  test("Start is the one solid primary and waits for a goal and a check", () => {
    assert.equal(solidPrimaries(render({ onStart() {} })), 1);
    const html = render({ value: { goal: "", criteria: [""] }, onStart() {} });
    assert.ok(html.includes("Add a goal and one check to start."));
    const start = findAll(tree({ value: { goal: "", criteria: [""] } }), Button).find((b) => b.props.children === "Start");
    assert.equal(start.props.disabled, true);
    assert.ok(start.props["aria-describedby"]);
  });

  test("error keeps the form and shows an Alert", () => {
    const html = render({ status: "error", errorMessage: "Agent pool is busy." });
    assert.ok(html.includes("Agent pool is busy."));
    assert.ok(html.includes("Done when"));
  });

  test("starting is aria-busy; started folds to one line", () => {
    assert.match(render({ status: "starting" }), /aria-busy="true"/);
    const html = render({ status: "started" });
    assert.match(html, /aria-label="Started: Update the EU price list"/);
    assert.ok(html.includes("2 checks · $5 cap · 30 min · 40 steps"));
    assert.ok(!html.includes("Done when"));
    assert.equal(solidPrimaries(html), 0);
  });
});

describe("TaskBrief callbacks", () => {
  test("Start and Save draft hand back the value; edits reach onChange", () => {
    const calls = [];
    const node = tree({
      onStart: (v) => calls.push(["start", v.goal]),
      onSaveDraft: (v) => calls.push(["draft", v.criteria.length]),
      onChange: (v) => calls.push(["change", v.criteria.length]),
    });
    const buttons = findAll(node, Button);
    buttons.find((b) => b.props.children === "Start").props.onClick();
    buttons.find((b) => b.props.children === "Save draft").props.onClick();
    buttons.find((b) => b.props.children === "Add check").props.onClick();
    assert.deepEqual(calls, [["start", "Update the EU price list"], ["draft", 3], ["change", 4]]);
  });
});

describe("TaskBrief in the catalog (MCP)", () => {
  test("list_components returns it as an organism", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "taskbrief");
    assert.equal(row?.name, "TaskBrief");
    assert.equal(row.level, "organism");
  });
});
