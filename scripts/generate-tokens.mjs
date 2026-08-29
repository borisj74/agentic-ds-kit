#!/usr/bin/env node
/**
 * Generates lib/tokens.css from tokens/tokens.json.
 * Primitives are fixed; semantic color roles remap under [data-theme="dark"].
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const tokens = JSON.parse(readFileSync(join(root, "tokens/tokens.json"), "utf8"));

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function resolveRef(ref, primitives) {
  if (typeof ref !== "string") return ref;
  if (ref.startsWith("mix:")) {
    const [, rest] = ref.split("mix:");
    const [path, pct] = rest.split("@");
    const base = resolveRef(path.trim(), primitives);
    return `color-mix(in srgb, ${base} ${pct}%, transparent)`;
  }
  if (ref.startsWith("primitive.")) {
    const value = getByPath(primitives, ref.replace("primitive.", ""));
    if (value === undefined) throw new Error(`Unresolved primitive: ${ref}`);
    return value;
  }
  if (ref.startsWith("var(")) return ref;
  return ref;
}

function kebab(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function flattenSemantic(themeObj, prefix = "") {
  const out = [];
  for (const [key, value] of Object.entries(themeObj)) {
    const next = prefix ? `${prefix}-${kebab(key)}` : kebab(key);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const childValues = Object.values(value);
      const isLeafGroup = childValues.every((v) => typeof v === "string");
      if (isLeafGroup) {
        for (const [childKey, childVal] of Object.entries(value)) {
          out.push([`${next}-${kebab(childKey)}`, childVal]);
        }
      } else {
        out.push(...flattenSemantic(value, next));
      }
    }
  }
  return out;
}

function primitiveColorVars() {
  const lines = [];
  const colors = tokens.primitive.color;
  for (const [hue, ramp] of Object.entries(colors)) {
    if (typeof ramp === "string") {
      lines.push(`  --color-${hue}: ${ramp};`);
    } else {
      for (const [step, hex] of Object.entries(ramp)) {
        lines.push(`  --color-${hue}-${step}: ${hex};`);
      }
    }
  }
  return lines;
}

function resolveThemeVars(themeName) {
  const theme = tokens.semantic[themeName];
  const flat = flattenSemantic(theme);
  return flat.map(([name, ref]) => {
    const resolved = resolveRef(ref, tokens.primitive);
    return `  --${name}: ${resolved};`;
  });
}

function staticVars() {
  const p = tokens.primitive;
  return [
    `  --motion-fast: ${p.duration.fast};`,
    `  --motion-normal: ${p.duration.normal};`,
    "",
    `  --space-0: ${p.space["0"]};`,
    ...Object.entries(p.space)
      .filter(([k]) => k !== "0")
      .map(([k, v]) => `  --space-${k}: ${v};`),
    "",
    `  --radius-sm: ${p.radius.sm};`,
    `  --radius-md: ${p.radius.md};`,
    `  --radius-lg: ${p.radius.lg};`,
    `  --radius-full: ${p.radius.full};`,
    "",
    `  --border-width-thin: ${p.borderWidth.thin};`,
    `  --border-width-medium: ${p.borderWidth.medium};`,
    "",
    `  --font-sans: ${tokens.semantic.type.family.sans};`,
    `  --font-mono: ${tokens.semantic.type.family.mono};`,
    "",
    `  --type-size-body: ${p.fontSize.base};`,
    `  --type-size-body-sm: ${p.fontSize.sm};`,
    `  --type-size-label: ${p.fontSize.sm};`,
    `  --type-size-heading: ${p.fontSize.lg};`,
    `  --type-size-title: ${p.fontSize["2xl"]};`,
    `  --type-size-display: ${p.fontSize["3xl"]};`,
    "",
    `  --type-weight-body: ${p.fontWeight.normal};`,
    `  --type-weight-label: ${p.fontWeight.medium};`,
    `  --type-weight-heading: ${p.fontWeight.semibold};`,
    `  --type-weight-title: ${p.fontWeight.bold};`,
    "",
    `  --type-line-body: ${p.lineHeight.normal};`,
    `  --type-line-heading: ${p.lineHeight.tight};`,
    "",
    `  --z-overlay: 40;`,
    `  --z-modal: 50;`,
    `  --z-tooltip: 60;`,
  ];
}

const css = `/* Generated from tokens/tokens.json — run: npm run generate:tokens */
/* Components use semantic vars only. Primitives are for foundations reference. */

:root {
  /* Primitive color ramps (fixed across themes) */
${primitiveColorVars().join("\n")}

  /* Semantic colors — light (default) */
${resolveThemeVars("light").join("\n")}

${staticVars().join("\n")}
}

[data-theme="dark"] {
${resolveThemeVars("dark").join("\n")}
}
`;

writeFileSync(join(root, "lib/tokens.css"), css);
console.log("Generated lib/tokens.css");
