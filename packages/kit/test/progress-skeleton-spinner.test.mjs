/**
 * Progress, Skeleton and Spinner redesign: indeterminate and success Progress, Skeleton layouts,
 * Spinner inverse, and Button loading keeping its width. Server markup only (no keyboard model here).
 * Runs against the built kit (dist); `npm test` builds first.
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

let h;
let render;
let Progress;
let Skeleton;
let Spinner;
let Button;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  ({ Progress } = await import("../dist/ui/Progress/Progress.js"));
  ({ Skeleton } = await import("../dist/ui/Skeleton/Skeleton.js"));
  ({ Spinner } = await import("../dist/ui/Spinner/Spinner.js"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
});

const count = (html, needle) => html.split(needle).length - 1;

describe("Progress", () => {
  test("indeterminate leaves aria-valuenow and the percent off", () => {
    const html = render(h(Progress, { indeterminate: true, value: 40, showValue: true, label: "Importing invoices" }));
    assert.match(html, /role="progressbar"/);
    assert.doesNotMatch(html, /aria-valuenow/);
    assert.doesNotMatch(html, /aria-valuetext/);
    assert.doesNotMatch(html, /40%/);
    assert.match(html, /aria-labelledby=/);
    assert.match(html, /slide/);
  });

  test("indeterminate with no label is named Loading", () => {
    const html = render(h(Progress, { indeterminate: true }));
    assert.match(html, /aria-label="Loading"/);
  });

  test("indeterminate on a ring falls back to the bar", () => {
    const html = render(h(Progress, { indeterminate: true, shape: "circle" }));
    assert.doesNotMatch(html, /<svg/);
    assert.match(html, /_slide_/);
  });

  test("determinate keeps its values", () => {
    const html = render(h(Progress, { value: 64, showValue: true, tone: "success" }));
    assert.match(html, /aria-valuenow="64"/);
    assert.match(html, /aria-valuetext="64%"/);
    assert.match(html, /_success_/);
  });
});

describe("Skeleton layouts", () => {
  test("table draws a header row and five body rows by default", () => {
    const html = render(h(Skeleton, { layout: "table", label: "Loading invoices" }));
    assert.equal(count(html, "_row_"), 6);
    assert.equal(count(html, "_headRow_"), 1);
    assert.equal(count(html, "Loading invoices"), 1);
    assert.match(html, /aria-busy="true"/);
  });

  test("lines sets the rows", () => {
    const html = render(h(Skeleton, { layout: "list", lines: 2 }));
    assert.equal(count(html, "_boneAvatar_"), 2);
  });

  test("card draws a tile, a title and three lines", () => {
    const html = render(h(Skeleton, { layout: "card" }));
    assert.equal(count(html, "_boneTile_"), 1);
    assert.equal(count(html, "_boneTitle_"), 1);
    assert.equal(count(html, "_last_"), 1);
  });

  test("bones are hidden from screen readers", () => {
    const html = render(h(Skeleton, { layout: "list", lines: 1 }));
    assert.equal(count(html, 'aria-hidden="true"'), 3);
  });

  test("not loading renders the children", () => {
    const html = render(h(Skeleton, { layout: "table", loading: false }, h("table", null)));
    assert.equal(html, "<table></table>");
  });
});

describe("Spinner", () => {
  test("inverse adds the on-primary class and keeps role=status", () => {
    const html = render(h(Spinner, { inverse: true }));
    assert.match(html, /role="status"/);
    assert.match(html, /_inverse_/);
  });
});

describe("Button loading width", () => {
  test("a labelled button with no leading icon keeps its width", () => {
    const html = render(h(Button, { loading: true }, "Save"));
    assert.match(html, /keepWidth/);
    assert.match(html, /aria-busy="true"/);
  });

  test("a button with a leading icon swaps the icon and needs no change", () => {
    const html = render(h(Button, { loading: true, iconStart: "Download" }, "Export"));
    assert.doesNotMatch(html, /keepWidth/);
  });

  test("not loading has no width rule", () => {
    assert.doesNotMatch(render(h(Button, null, "Save")), /keepWidth/);
  });
});
