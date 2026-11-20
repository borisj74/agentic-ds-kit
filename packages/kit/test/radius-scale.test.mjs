import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, test } from "node:test";

const kitRoot = fileURLToPath(new URL("..", import.meta.url));
const css = readFileSync(join(kitRoot, "lib/tokens.css"), "utf8");
const tokens = JSON.parse(readFileSync(join(kitRoot, "tokens/tokens.json"), "utf8"));

/** The pill sentinel is the one radius allowed off the 2px grid. */
const PILL = 9999;

const EXPECTED = {
  base: "8px",
  xs: "2px",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  "3xl": "24px",
  full: "9999px",
};

/** Every `--radius-*` declaration in tokens.css, across all blocks. Later blocks win, as in the cascade. */
function radiusDeclarations() {
  const vars = new Map();
  for (const match of css.matchAll(/(--radius-[\w-]+)\s*:\s*([^;]+);/g)) {
    vars.set(match[1], match[2].trim());
  }
  return vars;
}

/** Resolve a value through var() chains to a pixel number. */
function toPx(value, vars, seen = new Set()) {
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  if (ref) {
    assert.ok(!seen.has(ref[1]), `radius var() cycle at ${ref[1]}`);
    seen.add(ref[1]);
    const next = vars.get(ref[1]);
    assert.ok(next !== undefined, `${ref[1]} is not declared in tokens.css`);
    return toPx(next, vars, seen);
  }
  if (value === "0") return 0;
  const px = /^(-?\d+(?:\.\d+)?)px$/.exec(value);
  assert.ok(px, `radius value "${value}" is not a px length or var() of one (no calc())`);
  return Number(px[1]);
}

function assertOnGrid(name, px) {
  if (px === PILL) return;
  assert.equal(px % 2, 0, `${name} is ${px}px, which is not a multiple of 2`);
}

function cssFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return path.endsWith(".css") ? [path] : [];
  });
}

describe("radius scale", () => {
  test("primitives are the fixed scale", () => {
    for (const [step, value] of Object.entries(EXPECTED)) {
      assert.equal(tokens.primitive.radius[step], value, `tokens.json radius.${step}`);
    }
    const vars = radiusDeclarations();
    for (const [step, value] of Object.entries(EXPECTED)) {
      assert.equal(vars.get(`--radius-${step}`), value, `tokens.css --radius-${step}`);
    }
  });

  test("every tokens.json radius is a multiple of 2", () => {
    for (const [step, value] of Object.entries(tokens.primitive.radius)) {
      assertOnGrid(`radius.${step}`, toPx(value, new Map()));
    }
  });

  test("every --radius-* in tokens.css resolves to a multiple of 2", () => {
    const vars = radiusDeclarations();
    assert.ok(vars.size > 0, "no radius tokens found");
    for (const [name, value] of vars) {
      assertOnGrid(name, toPx(value, vars));
    }
  });

  test("kit CSS uses no raw border-radius off the 2px grid", () => {
    const files = [...cssFiles(join(kitRoot, "ui")), ...cssFiles(join(kitRoot, "lib"))];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/border(?:-[a-z]+)*-radius\s*:\s*([^;]+);/g)) {
        for (const px of match[1].matchAll(/(-?\d+(?:\.\d+)?)px/g)) {
          assertOnGrid(`${file}: ${match[0]}`, Number(px[1]));
        }
      }
    }
  });
});
