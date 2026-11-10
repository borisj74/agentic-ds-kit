import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  RAMP_STEPS,
  deltaE,
  generateColorRamp,
  normalizeHex,
  oklchLightness,
} from "../lib/color-ramp.mjs";

const SAMPLES = ["#3366ff", "#2563eb", "#7c3aed", "#0d9488", "#e11d48", "#f59e0b", "#000000", "#ffffff", "#111111", "#f4f1ea"];

describe("generateColorRamp", () => {
  test("returns the eleven steps from 50 through 950", () => {
    const ramp = generateColorRamp("#3366ff");
    assert.deepEqual(Object.keys(ramp), [...RAMP_STEPS]);
    assert.equal(RAMP_STEPS.length, 11);
    for (const step of RAMP_STEPS) {
      assert.match(ramp[step], /^#[0-9a-f]{6}$/);
    }
  });

  test("lightness falls from 50 to 950", () => {
    for (const hex of SAMPLES) {
      const ramp = generateColorRamp(hex);
      const lightness = RAMP_STEPS.map((step) => oklchLightness(ramp[step]));
      for (let index = 1; index < lightness.length; index += 1) {
        assert.ok(
          lightness[index] < lightness[index - 1],
          `${hex} ${RAMP_STEPS[index]} L ${lightness[index]} is not below ${RAMP_STEPS[index - 1]} L ${lightness[index - 1]}`,
        );
      }
    }
  });

  test("step 500 stays within ΔE 3 of the input", () => {
    for (const hex of SAMPLES) {
      const normalized = normalizeHex(hex);
      const ramp = generateColorRamp(hex);
      const difference = deltaE(ramp["500"], normalized);
      assert.ok(difference < 3, `${hex} step 500 ΔE ${difference}`);
    }
  });

  test("a mid colour spreads from near-white to near-black", () => {
    const ramp = generateColorRamp("#3b82f6");
    assert.ok(oklchLightness(ramp["50"]) > 0.9);
    assert.ok(oklchLightness(ramp["950"]) < 0.2);
  });

  test("identical colours have ΔE 0 and black against white is far", () => {
    assert.equal(deltaE("#3366ff", "#3366FF"), 0);
    assert.ok(deltaE("#000000", "#ffffff") > 50);
  });
});
