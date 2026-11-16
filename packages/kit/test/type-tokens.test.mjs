import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const css = readFileSync(new URL("../lib/tokens.css", import.meta.url), "utf8");

/** Declarations inside the first block that opens with `head {`, as a name → value map. */
function declarations(head) {
  const start = css.indexOf(`${head} {`);
  assert.ok(start >= 0, `missing block: ${head}`);
  let depth = 0;
  let end = start;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) {
      end = i;
      break;
    }
  }
  const vars = new Map();
  for (const m of css.slice(start, end).matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars.set(m[1], m[2].trim());
  return vars;
}

const root = declarations(":root");

describe("marketing type roles", () => {
  test("hero display: 64/76 at desktop, weight 400, tight tracking", () => {
    assert.equal(root.get("--type-size-display-hero"), "64px");
    assert.equal(root.get("--type-line-display-hero"), "76px");
    assert.equal(root.get("--type-weight-display-hero"), "400");
    assert.equal(root.get("--type-tracking-display-hero"), "-0.03em");
  });

  test("section title: 32/40, weight 400, tight tracking", () => {
    assert.equal(root.get("--type-size-title-section"), "32px");
    assert.equal(root.get("--type-line-title-section"), "40px");
    assert.equal(root.get("--type-weight-title-section"), "400");
    assert.equal(root.get("--type-tracking-title-section"), "-0.03em");
  });

  test("tablet (below md breakpoint): hero 52/64", () => {
    const md = declarations("@media (width < 64rem)");
    assert.equal(md.get("--type-size-display-hero"), "52px");
    assert.equal(md.get("--type-line-display-hero"), "64px");
    assert.equal(md.has("--type-size-title-section"), false);
  });

  test("mobile (below sm breakpoint): hero 40/48, section title 28/36", () => {
    const sm = declarations("@media (width < 40rem)");
    assert.equal(sm.get("--type-size-display-hero"), "40px");
    assert.equal(sm.get("--type-line-display-hero"), "48px");
    assert.equal(sm.get("--type-size-title-section"), "28px");
    assert.equal(sm.get("--type-line-title-section"), "36px");
  });

  test("media queries match the grid breakpoint tokens", () => {
    assert.equal(root.get("--grid-breakpoint-md"), "64rem");
    assert.equal(root.get("--grid-breakpoint-sm"), "40rem");
  });
});

describe("tracking tokens", () => {
  test("tight, snug and wide exist with their values", () => {
    assert.equal(root.get("--type-tracking-tight"), "-0.03em");
    assert.equal(root.get("--type-tracking-snug"), "-0.02em");
    assert.equal(root.get("--type-tracking-wide"), "0.08em");
  });

  test("existing display, title and tracking roles are unchanged", () => {
    assert.equal(root.get("--type-size-display"), "var(--type-size-heading-3)");
    assert.equal(root.get("--type-size-heading-3"), "40px");
    assert.equal(root.get("--type-weight-title"), "700");
    assert.equal(root.get("--type-tracking-title"), "-0.02em");
    assert.equal(root.get("--type-tracking-heading"), "-0.01em");
    assert.equal(root.get("--type-tracking-overline"), "0.06em");
  });
});

describe("fixed text tokens", () => {
  test("same value in light and dark", () => {
    const dark = declarations(':root[data-theme="dark"],\n[data-theme="dark"]');
    assert.equal(root.get("--text-fixed-dark"), "#0f172a");
    assert.equal(root.get("--text-fixed-light"), "#ffffff");
    assert.equal(dark.get("--text-fixed-dark"), root.get("--text-fixed-dark"));
    assert.equal(dark.get("--text-fixed-light"), root.get("--text-fixed-light"));
  });
});
