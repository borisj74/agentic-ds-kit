/**
 * MessageActions "Copied": the success tint holds on hover and focus. Its rules must outrank
 * Button's .soft.neutral colours, including .soft.neutral:hover, or hover turns the tint grey.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/** Classes, attributes and pseudo-classes in a selector; :not() counts its argument, as in CSS. */
function specificity(selector) {
  return (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!not\()[\w-]+/g) ?? []).length;
}

/** The declaration block of the rule whose selector list contains `selector`. */
function ruleFor(css, selector) {
  const at = css.indexOf(selector);
  assert.ok(at >= 0, `rule ${selector} exists`);
  return css.slice(css.indexOf("{", at) + 1, css.indexOf("}", at));
}

describe("MessageActions Copied tint", () => {
  const actions = read("ui/MessageActions/MessageActions.module.css");
  const button = read("ui/Button/Button.module.css");
  const buttonHover = ".soft.neutral:hover:not(:disabled):not([aria-busy='true'])";
  const copiedHover = '.wrap .toolbar .copied:hover:not(:disabled):not([aria-busy="true"])';

  test("hover and focus keep the success tint", () => {
    const block = ruleFor(actions, copiedHover);
    assert.match(actions, /\.wrap \.toolbar \.copied:focus-visible \{/);
    assert.match(block, /background-color: var\(--status-success-subtle\);/);
    assert.match(block, /border-color: var\(--status-success-subtle\);/);
  });

  test("the Copied rules outrank Button's soft neutral rules", () => {
    assert.ok(button.includes(buttonHover), "Button's hover rule is the one we measure against");
    assert.ok(specificity(copiedHover) > specificity(buttonHover), "hover rule wins");
    assert.ok(specificity(".wrap .toolbar .copied") > specificity(".soft.neutral"), "resting rule wins");
  });
});
