import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { contrastRatio } from "../lib/color-ramp.mjs";

const css = readFileSync(new URL("../lib/tokens.css", import.meta.url), "utf8");

/** Custom properties declared in the first rule whose selector list starts with `selector`. */
function block(selector) {
  const start = css.indexOf(`${selector} {`) >= 0 ? css.indexOf(`${selector} {`) : css.indexOf(`${selector},`);
  assert.ok(start >= 0, `missing rule ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  const vars = {};
  for (const match of css.slice(open + 1, close).matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

/** `color-mix(in srgb, #aaa p%, #bbb)` as hex: a straight blend of the sRGB channels. */
function mix(value) {
  const match = /^color-mix\(in srgb, (#[0-9a-f]{6}) (\d+(?:\.\d+)?)%, (#[0-9a-f]{6})\)$/i.exec(value);
  if (!match) return value;
  const [, a, percent, b] = match;
  const weight = Number(percent) / 100;
  const channel = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2]
    .map((i) => Math.round(channel(a, i) * weight + channel(b, i) * (1 - weight)).toString(16).padStart(2, "0"))
    .join("")}`;
}

function resolve(vars, name, seen = new Set()) {
  assert.ok(!seen.has(name), `var cycle at ${name}`);
  seen.add(name);
  const value = vars[name];
  assert.ok(value, `${name} is not set`);
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  if (ref) return resolve(vars, ref[1], seen);
  const hex = mix(value);
  assert.match(hex, /^#[0-9a-f]{6}$/i, `${name} is ${value}, which this test cannot measure`);
  return hex;
}

const root = block(":root");
const rootDark = block(':root[data-theme="dark"]');
const presets = [...css.matchAll(/^\[data-color="(\w+)"\] \{/gm)].map((match) => match[1]);

// Same cascade the browser applies: root, then dark, then the preset's light rule
// (which comes later in the file), then the preset's dark rule.
const themes = [
  ["nistha", "light", { ...root }],
  ["nistha", "dark", { ...root, ...rootDark }],
  ...presets.flatMap((name) => {
    const light = block(`[data-color="${name}"]`);
    const dark = block(`:root[data-theme="dark"][data-color="${name}"]`);
    return [
      [name, "light", { ...root, ...light }],
      [name, "dark", { ...root, ...rootDark, ...light, ...dark }],
    ];
  }),
];

describe("primary button label contrast", () => {
  test("covers every colour preset", () => {
    assert.deepEqual(presets.sort(), ["blue", "ink", "teal", "violet"]);
  });

  // The label sits on the fill at rest, on hover and while pressed.
  const fills = ["--action-primary", "--action-primary-hover", "--action-primary-pressed"];

  for (const [name, mode, vars] of themes) {
    for (const fill of fills) {
      test(`${name} ${mode}: --action-on-primary on ${fill} is at least 4.5:1`, () => {
        const fg = resolve(vars, "--action-on-primary");
        const bg = resolve(vars, fill);
        const ratio = contrastRatio(fg, bg);
        assert.ok(ratio >= 4.5, `${fg} on ${bg} is ${ratio.toFixed(2)}:1`);
      });
    }
  }
});
