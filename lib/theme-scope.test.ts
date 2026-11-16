import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { PRESETS, contrastReport, presetState, scopeCss, scopeCssLeaksToPage, themeDeclarations } from "./theme-playground";

describe("theme scope", () => {
  test("live css targets the preview scope and not the page root", () => {
    const css = scopeCss(presetState("rose", "dark"), "preview");
    assert.equal(scopeCssLeaksToPage(css), false);
    assert.match(css, /\[data-theme-scope="preview"\] \{/);
    assert.match(css, /\[data-theme-scope="preview"\]\[data-theme="dark"\] \{/);
    assert.doesNotMatch(css, /html\[data-theme/);
  });

  test("radius 48 redeclares derived radius tokens", () => {
    const decls = themeDeclarations({ ...presetState("ink", "light"), radius: 48, pill: false }, "light", "preview");
    assert.equal(decls["--radius-base"], "48px");
    assert.equal(decls["--radius-xs"], "18px");
    assert.equal(decls["--radius-sm"], "30px");
    assert.equal(decls["--radius-md"], "36px");
    assert.equal(decls["--radius-lg"], "48px");
    assert.equal(decls["--radius-xl"], "60px");
    assert.equal(decls["--radius-surface-md"], "60px");
    assert.equal(decls["--radius-control-md"], "36px");
  });

  test("pill radius applies to controls and leaves surfaces on the scale", () => {
    const decls = themeDeclarations({ ...presetState("ink", "light"), radius: 48, pill: true }, "light", "preview");
    assert.equal(decls["--radius-control-sm"], "9999px");
    assert.equal(decls["--radius-control-md"], "9999px");
    assert.equal(decls["--radius-control-lg"], "9999px");
    assert.equal(decls["--radius-surface-md"], "60px");
    assert.equal(decls["--radius-base"], "48px");
  });

  test("shadow presets write scoped shadow tokens", () => {
    const none = themeDeclarations({ ...presetState("ink", "light"), shadowPreset: "none" }, "light", "preview");
    assert.equal(none["--shadow-md"], "none");
    assert.equal(none["--shadow-raised-md"], "var(--shadow-md)");
    const dramatic = themeDeclarations(
      { ...presetState("rose", "light"), shadowPreset: "dramatic", shadowIntensity: 100, shadowScale: 100, shadowTint: "primary" },
      "light",
      "preview",
    );
    assert.match(dramatic["--shadow-lg"], /^0 .+px .+px 0px rgb\(\d+ \d+ \d+ \/ /);
    assert.notEqual(dramatic["--shadow-lg"], "none");
  });

  test("brand icons reach 4.5:1 on the surface in every preset, light and dark", () => {
    for (const preset of PRESETS) {
      for (const mode of ["light", "dark"] as const) {
        const pair = contrastReport(presetState(preset.id, mode)).find((item) => item.name === "Brand icon on surface");
        assert.ok(pair?.pass, `${preset.id} ${mode}: brand icon ${pair?.ratio.toFixed(2)}:1`);
      }
    }
  });

  test("button labels reach 4.5:1 at rest, on hover and pressed in every preset, light and dark", () => {
    for (const preset of PRESETS) {
      for (const mode of ["light", "dark"] as const) {
        const report = contrastReport(presetState(preset.id, mode));
        for (const name of ["Button label", "Button label on hover", "Button label pressed"]) {
          const pair = report.find((item) => item.name === name);
          assert.ok(pair, `${name} is in the report`);
          assert.ok(pair.pass, `${preset.id} ${mode}: ${name} ${pair.ratio.toFixed(2)}:1`);
        }
      }
    }
  });
});
