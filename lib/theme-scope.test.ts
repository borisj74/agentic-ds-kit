import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { PRESETS, clampRadius, contrastReport, presetState, scopeCss, scopeCssLeaksToPage, themeDeclarations } from "./theme-playground";

describe("theme scope", () => {
  test("live css targets the preview scope and not the page root", () => {
    const css = scopeCss(presetState("rose", "dark"), "preview");
    assert.equal(scopeCssLeaksToPage(css), false);
    assert.match(css, /\[data-theme-scope="preview"\] \{/);
    assert.match(css, /\[data-theme-scope="preview"\]\[data-theme="dark"\] \{/);
    assert.doesNotMatch(css, /html\[data-theme/);
  });

  test("radius keeps the fixed scale and moves roles along it", () => {
    const decls = themeDeclarations({ ...presetState("ink", "light"), radius: 12, pill: false }, "light", "preview");
    assert.equal(decls["--radius-base"], "8px");
    assert.equal(decls["--radius-xs"], "2px");
    assert.equal(decls["--radius-sm"], "4px");
    assert.equal(decls["--radius-md"], "6px");
    assert.equal(decls["--radius-lg"], "8px");
    assert.equal(decls["--radius-xl"], "12px");
    assert.equal(decls["--radius-2xl"], "16px");
    assert.equal(decls["--radius-3xl"], "24px");
    assert.equal(decls["--radius-control-sm"], "4px");
    assert.equal(decls["--radius-control-md"], "8px");
    assert.equal(decls["--radius-control-lg"], "12px");
    assert.equal(decls["--radius-surface-md"], "16px");
    assert.equal(decls["--radius-surface-lg"], "24px");
    assert.equal(decls["--radius-media-lg"], "16px");
  });

  test("radius 8 matches the kit roles", () => {
    const decls = themeDeclarations({ ...presetState("ink", "light"), radius: 8, pill: false }, "light", "preview");
    assert.equal(decls["--radius-control-sm"], "2px");
    assert.equal(decls["--radius-control-md"], "6px");
    assert.equal(decls["--radius-surface-md"], "12px");
    assert.equal(decls["--radius-surface-lg"], "16px");
    assert.equal(decls["--radius-media-lg"], "12px");
  });

  test("radius snaps to a fixed step and roles stop at the ends of the scale", () => {
    assert.equal(clampRadius(10), 8);
    assert.equal(clampRadius(13), 12);
    assert.equal(clampRadius(0), 2);
    assert.equal(clampRadius(48), 24);
    const decls = themeDeclarations({ ...presetState("ink", "light"), radius: 48, pill: false }, "light", "preview");
    assert.equal(decls["--radius-surface-lg"], "24px");
    assert.equal(decls["--radius-surface-md"], "24px");
    for (const [name, value] of Object.entries(decls)) {
      if (!name.startsWith("--radius-")) continue;
      const px = /^(\d+)px$/.exec(value);
      if (px && Number(px[1]) !== 9999) assert.equal(Number(px[1]) % 2, 0, `${name} is ${value}`);
    }
  });

  test("pill radius applies to controls and leaves surfaces on the scale", () => {
    const decls = themeDeclarations({ ...presetState("ink", "light"), radius: 12, pill: true }, "light", "preview");
    assert.equal(decls["--radius-control-sm"], "9999px");
    assert.equal(decls["--radius-control-md"], "9999px");
    assert.equal(decls["--radius-control-lg"], "9999px");
    assert.equal(decls["--radius-surface-md"], "16px");
    assert.equal(decls["--radius-base"], "8px");
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
