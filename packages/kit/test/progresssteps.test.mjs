/**
 * ProgressSteps: status words, optional steps, clickable completed steps and the compact summary.
 * Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

const steps = [
  { id: "plan", label: "Plan" },
  { id: "billing", label: "Billing" },
  { id: "addons", label: "Add-ons", optional: true },
  { id: "review", label: "Review" },
];

let logic;
let React;
let renderToStaticMarkup;
let ProgressSteps;

before(async () => {
  logic = await import("../dist/ui/ProgressSteps/progressSteps.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ProgressSteps } = await import("../dist/ui/ProgressSteps/ProgressSteps.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(ProgressSteps, { steps, current: 1, ...props }));
}

describe("ProgressSteps logic", () => {
  test("status words: Done, Current, Upcoming, Error, Optional", () => {
    assert.equal(logic.statusWord("complete"), "Done");
    assert.equal(logic.statusWord("current"), "Current");
    assert.equal(logic.statusWord("upcoming"), "Upcoming");
    assert.equal(logic.statusWord("upcoming", true), "Optional");
    assert.equal(logic.statusWord("error"), "Error");
  });

  test("optional only shows on an upcoming step", () => {
    assert.equal(logic.isOptional({ id: "a", label: "A", optional: true }, "upcoming"), true);
    assert.equal(logic.isOptional({ id: "a", label: "A", optional: true }, "current"), false);
    assert.equal(logic.isOptional({ id: "a", label: "A" }, "upcoming"), false);
  });

  test("summary names the current step, the bar value and what comes next", () => {
    const statuses = steps.map((s, i) => logic.resolveStatus(s, i, 1));
    assert.deepEqual(logic.summarize(steps, statuses, 1), {
      index: 1,
      position: "Step 2 of 4",
      label: "Billing",
      value: 50,
      next: "Next is Add-ons, optional",
    });
    const last = steps.map((s, i) => logic.resolveStatus(s, i, 3));
    assert.equal(logic.summarize(steps, last, 3).next, "Last step");
    const done = steps.map((s, i) => logic.resolveStatus(s, i, 4));
    assert.equal(logic.summarize(steps, done, 4).position, "All 4 steps done");
    assert.equal(logic.summarize(steps, done, 4).value, 100);
  });
});

describe("ProgressSteps render", () => {
  test("keeps nav > ol, aria-current=step and step n of m", () => {
    const html = render();
    assert.match(html, /^<nav[^>]*aria-label="Progress"/);
    assert.match(html, /<ol/);
    assert.match(html, /aria-current="step"/);
    assert.match(html, /Done, step 1 of 4/);
    assert.match(html, /Current, step 2 of 4/);
    assert.match(html, /Optional, step 3 of 4/);
    assert.match(html, /Upcoming, step 4 of 4/);
  });

  test("shows the status word visibly", () => {
    const html = render();
    for (const word of ["Done", "Current", "Optional", "Upcoming"]) {
      assert.match(html, new RegExp(`aria-hidden="true">${word}</span>`));
    }
  });

  test("no buttons without onStepClick", () => {
    assert.doesNotMatch(render(), /<button/);
  });

  test("with onStepClick only completed steps are buttons, named by their label", () => {
    const html = render({ current: 2, onStepClick: () => {} });
    const buttons = [...html.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => m[1]);
    assert.equal(buttons.length, 2);
    assert.match(buttons[0], /Plan/);
    assert.match(buttons[1], /Billing/);
  });

  test("horizontal renders the compact summary with a labelled Progress bar; vertical does not", () => {
    const html = render();
    assert.match(html, /Step 2 of 4/);
    assert.match(html, /role="progressbar"[^>]*aria-label="Next is Add-ons, optional"|aria-label="Next is Add-ons, optional"[^>]*role="progressbar"/);
    assert.match(render({ current: 0 }), /aria-label="Next is Billing"/);
    assert.doesNotMatch(render({ orientation: "vertical" }), /progressbar/);
  });

  test("error keeps the X and the word Error", () => {
    const html = render({ steps: [{ id: "a", label: "A" }, { id: "b", label: "B", status: "error" }] });
    assert.match(html, /Error, step 2 of 2/);
    assert.match(html, /aria-hidden="true">Error<\/span>/);
  });
});
