/**
 * What `review` reads from this install: components with their level and `contains`, patterns,
 * and semantic tokens for the "use this token instead" hints. All from bin/catalog.mjs.
 */
import { compact, kitData, packageRoot } from "../catalog.mjs";
import { LEVELS } from "../levels.mjs";

/**
 * Parts so common that using them says nothing about which bigger piece a file rebuilds:
 * every atom, plus these small molecules. `rebuild` and `pattern-fits` ignore them when they
 * count distinctive parts.
 */
export const COMMON_MOLECULES = Object.freeze([
  "alert",
  "buttongroup",
  "card",
  "dropdownmenu",
  "empty",
  "field",
  "fieldset",
  "helppopover",
  "popover",
  "radiogroup",
  "section",
  "segmentedcontrol",
  "select",
  "tabs",
  "toast",
]);

const pascal = (id) => id.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());

let cached;

export function loadKit() {
  if (cached) return cached;
  const data = kitData();
  const byCompact = new Map();
  const byId = new Map();
  for (const component of data.components) {
    byId.set(component.id, component);
    byCompact.set(compact(component.name), component);
    byCompact.set(compact(component.id), component);
  }
  const common = new Set(
    data.components.filter((c) => c.level === "atom" || COMMON_MOLECULES.includes(c.id)).map((c) => c.id),
  );
  const patterns = data.patterns.map((p) => ({ ...p, name: `${pascal(p.id)}Pattern` }));

  const colors = colorCandidates(data.semantic);
  const space = data.semantic
    .filter((t) => t.group === "space")
    .map((t) => ({ name: t.name, px: toPx(t.value), noted: Boolean(t.note || t.useWhen) }))
    .filter((t) => t.px !== null && t.px > 0);
  const radius = data.semantic
    .filter((t) => t.group === "radius" && t.name !== "--radius-base")
    .map((t) => ({ name: t.name, px: toPx(t.value) }))
    .filter((t) => t.px !== null && t.px > 0);
  const shadows = data.shadows
    .filter((t) => t.value !== "none")
    .map((t) => ({ name: t.name, blur: shadowBlur(t.value) }));
  const ramps = rampValues(data.tokens.primitive.color ?? {});

  cached = {
    version: data.version,
    root: packageRoot,
    components: data.components,
    byId,
    patterns,
    common,
    /** Component for an imported name or a folder name ("DataTable", "data-table"). */
    component: (name) => byCompact.get(compact(name)) ?? null,
    levelRank: (level) => LEVELS.indexOf(level),
    nearestColor: (hex, prop) => nearestColor(colors, hex, prop),
    nearestSpace: (px, prop) => nearestSpace(space, px, prop),
    nearestRadius: (px) => nearestBy(radius, px, (t) => t.px)?.name ?? "--radius-md",
    nearestShadow: (raw) => nearestBy(shadows, shadowBlur(raw), (t) => t.blur)?.name ?? "--shadow-sm",
    rampHex: (name) => ramps.get(name) ?? null,
  };
  return cached;
}

/** "12px" or "0.75rem" to pixels (rem and em as 16px). null when it is not a plain length. */
export function toPx(value) {
  const m = String(value).trim().match(/^(-?\d*\.?\d+)(px|rem|em)?$/);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === "rem" || m[2] === "em" ? n * 16 : n;
}

function shadowBlur(value) {
  const lengths = [...String(value).matchAll(/(-?\d*\.?\d+)(px|rem|em)?(?=[\s,)]|$)/g)].map((m) => toPx(m[0]) ?? 0);
  if (lengths.length >= 3) return Math.abs(lengths[2]);
  return lengths.length ? Math.max(...lengths.map(Math.abs)) : 0;
}

function nearestBy(items, target, key) {
  let best = null;
  for (const item of items) {
    const d = Math.abs(key(item) - target);
    if (!best || d < best.d) best = { item, d };
  }
  return best?.item ?? null;
}

const SPACE_FAMILY = [
  [/^padding|^p[trblxyse]?$|^scroll-padding/, "--space-inset-"],
  [/gap$|^gap|^space-[xy]$/, "--space-gap-"],
  [/^margin|^m[trblxyse]?$/, "--space-stack-"],
];

function nearestSpace(space, px, prop) {
  const family = SPACE_FAMILY.find(([re]) => re.test(prop))?.[1];
  const pool = family ? space.filter((t) => t.name.startsWith(family)) : space;
  return nearestBy(pool.length ? pool : space, Math.abs(px), (t) => t.px)?.name ?? "--space-4";
}

export function parseHex(hex) {
  let h = hex.replace(/^#/, "");
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
  if (h.length !== 6 && h.length !== 8) return null;
  const n = Number.parseInt(h.slice(0, 6), 16);
  return Number.isNaN(n) ? null : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** rgb()/rgba() with plain numbers to [r, g, b]; null otherwise. */
export function parseRgb(text) {
  const m = text.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function colorCandidates(semantic) {
  const tokens = semantic.filter((t) => t.group === "color");
  const values = new Map(tokens.map((t) => [t.name, t.value]));
  const resolve = (value, depth = 0) => {
    const ref = String(value).match(/^var\((--[\w-]+)\)$/);
    if (ref && depth < 10 && values.has(ref[1])) return resolve(values.get(ref[1]), depth + 1);
    return String(value);
  };
  return tokens
    .map((t) => {
      const value = resolve(t.value);
      const rgb = value.startsWith("#") ? parseHex(value) : null;
      return rgb ? { name: t.name, rgb, noted: Boolean(t.note || t.useWhen) } : null;
    })
    .filter(Boolean);
}

const COLOR_FAMILY = [
  [/^(background|bg|from|via|to)/, ["--bg-", "--surface-"]],
  [/^(border|outline|divide|ring|line|column-rule)/, ["--line-", "--border-"]],
  [/^(fill|stroke|icon)/, ["--icon-"]],
  [/^(color|text|caret|accent|placeholder|text-decoration)/, ["--text-"]],
];

function nearestColor(colors, rgb, prop) {
  const families = COLOR_FAMILY.find(([re]) => re.test(prop))?.[1];
  const pool = families ? colors.filter((c) => families.some((f) => c.name.startsWith(f))) : colors;
  let best = null;
  for (const c of pool.length ? pool : colors) {
    const d = (c.rgb[0] - rgb[0]) ** 2 + (c.rgb[1] - rgb[1]) ** 2 + (c.rgb[2] - rgb[2]) ** 2;
    const better =
      !best || d < best.d || (d === best.d && c.noted && !best.c.noted) || (d === best.d && c.noted === best.c.noted && c.name.length < best.c.name.length);
    if (better) best = { c, d };
  }
  return best?.c.name ?? null;
}

function rampValues(color) {
  const out = new Map();
  for (const [family, steps] of Object.entries(color)) {
    if (!steps || typeof steps !== "object") continue;
    for (const [step, value] of Object.entries(steps)) {
      if (/^\d+$/.test(step) && typeof value === "string") out.set(`--color-${family}-${step}`, value);
    }
  }
  return out;
}
