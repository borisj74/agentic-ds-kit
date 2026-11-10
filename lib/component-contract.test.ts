import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { variantChips, type VariantProp } from "./component-contract";

const BUTTON: VariantProp[] = [
  { name: "size", values: ["lg", "md", "sm"], boolean: false },
  { name: "appearance", values: ["solid", "outline", "soft", "ghost"], boolean: false },
  { name: "mode", values: ["primary", "neutral", "danger"], boolean: false },
  { name: "disabled", values: [], boolean: true },
  { name: "isLoading", values: [], boolean: true },
];

describe("variant chips", () => {
  test("enum value in the title", () => {
    assert.deepEqual(variantChips("Outline", BUTTON), ['appearance="outline"']);
    assert.deepEqual(variantChips("Danger solid", BUTTON), ['appearance="solid"', 'mode="danger"']);
  });

  test("size words map to size tokens", () => {
    assert.deepEqual(variantChips("Small", BUTTON), ['size="sm"']);
  });

  test("boolean props by name", () => {
    assert.deepEqual(variantChips("Disabled", BUTTON), ["disabled"]);
    assert.deepEqual(variantChips("Loading", BUTTON), ["isLoading"]);
  });

  test("titles that name nothing get no chips", () => {
    assert.deepEqual(variantChips("In a sentence", BUTTON), []);
  });
});
