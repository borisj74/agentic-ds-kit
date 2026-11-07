#!/usr/bin/env node
/**
 * Generates lib/tokens.css from tokens/tokens.json.
 * Primitives are fixed. Appearance remaps under [data-theme="dark"].
 * Brand remaps under [data-color="blue"], [data-color="violet"], and [data-color="teal"].
 * Default brand (no data-color) is ink — the Cards-aligned black primary.
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
      lines.push(`  --color-${kebab(hue)}: ${ramp};`);
    } else {
      for (const [step, hex] of Object.entries(ramp)) {
        lines.push(`  --color-${hue}-${step}: ${hex};`);
      }
    }
  }
  return lines;
}

function resolveThemeVars(themeName) {
  return resolvePartialThemeVars(tokens.semantic[themeName]);
}

function resolvePartialThemeVars(themeObj) {
  return flattenSemantic(themeObj).map(([name, ref]) => {
    const resolved = resolveRef(ref, tokens.primitive);
    return `  --${name}: ${resolved};`;
  });
}

function colorThemeBlocks() {
  const themes = tokens.semantic.colorThemes ?? {};
  return Object.entries(themes).flatMap(([name, modes]) => [
    `[data-color="${name}"] {`,
    resolvePartialThemeVars(modes.light).join("\n"),
    `}`,
    ``,
    `[data-theme="dark"][data-color="${name}"] {`,
    resolvePartialThemeVars(modes.dark).join("\n"),
    `}`,
    ``,
  ]);
}


function spaceRoleVars() {
  const lines = [];
  for (const [family, steps] of Object.entries(tokens.semantic.space)) {
    for (const [step, ref] of Object.entries(steps)) {
      const key = String(ref).replace("primitive.space.", "");
      lines.push(`  --space-${family}-${step}: var(--space-${key});`);
    }
  }
  return lines;
}


function gridVars() {
  const grid = tokens.semantic.grid;
  const layout = tokens.semantic.layout;
  const spaceRef = (ref) => `var(--space-${String(ref).replace("primitive.space.", "")})`;
  return [
    `  --grid-columns: ${grid.columns};`,
    `  --grid-gutter-sm: ${spaceRef(grid.gutter.sm)};`,
    `  --grid-gutter-md: ${spaceRef(grid.gutter.md)};`,
    `  --grid-gutter-lg: ${spaceRef(grid.gutter.lg)};`,
    `  --grid-gutter-xl: ${spaceRef(grid.gutter.xl)};`,
    `  --grid-margin-sm: ${spaceRef(grid.margin.sm)};`,
    `  --grid-margin-md: ${spaceRef(grid.margin.md)};`,
    `  --grid-margin-lg: ${spaceRef(grid.margin.lg)};`,
    `  --grid-width-sm: ${grid.width.sm};`,
    `  --grid-width-md: ${grid.width.md};`,
    `  --grid-width-lg: ${grid.width.lg};`,
    `  --grid-width-xl: ${grid.width.xl};`,
    `  --grid-breakpoint-sm: ${grid.breakpoint.sm};`,
    `  --grid-breakpoint-md: ${grid.breakpoint.md};`,
    `  --grid-breakpoint-lg: ${grid.breakpoint.lg};`,
    "",
    `  --layout-container-sm: var(--grid-width-sm);`,
    `  --layout-container-md: var(--grid-width-md);`,
    `  --layout-container-lg: var(--grid-width-lg);`,
    `  --layout-container-xl: var(--grid-width-xl);`,
    `  --layout-gutter-sm: var(--grid-gutter-sm);`,
    `  --layout-gutter-md: var(--grid-gutter-md);`,
    `  --layout-gutter-lg: var(--grid-gutter-lg);`,
    `  --layout-gutter-xl: var(--grid-gutter-xl);`,
    `  --layout-margin-sm: var(--grid-margin-sm);`,
    `  --layout-margin-md: var(--grid-margin-md);`,
    `  --layout-margin-lg: var(--grid-margin-lg);`,
    `  --layout-sidebar: ${layout.sidebar};`,
    `  --layout-sidebar-compact: ${layout.sidebarCompact};`,
    `  --layout-rail: ${layout.rail};`,
    `  --layout-drawer-sm: ${layout.drawerSm};`,
    `  --layout-drawer-md: ${layout.drawerMd};`,
    `  --layout-drawer-lg: ${layout.drawerLg};`,
    `  --layout-metrics-min: ${layout.metricsMin};`,
    `  --layout-auto-min: ${layout.autoMin};`,
    `  --layout-split-primary: ${layout.splitPrimary};`,
    `  --layout-split-secondary: ${layout.splitSecondary};`,
    `  --layout-split-half: ${layout.splitHalf};`,
    `  --layout-split-third: ${layout.splitThird};`,
  ];
}



function radiusVars() {
  return [
    "  /* Radius from one base (Cards curve: xs 3, sm 5, md 6, lg 8, xl 10, 2xl 13, 3xl 19) */",
    "  --radius-base: 8px;",
    "  --radius-xs: calc(var(--radius-base) * 3 / 8);",
    "  --radius-sm: calc(var(--radius-base) * 5 / 8);",
    "  --radius-md: calc(var(--radius-base) * 6 / 8);",
    "  --radius-lg: var(--radius-base);",
    "  --radius-xl: calc(var(--radius-base) * 10 / 8);",
    "  --radius-2xl: calc(var(--radius-base) * 13 / 8);",
    "  --radius-3xl: calc(var(--radius-base) * 19 / 8);",
    "  --radius-full: 9999px;",
    "  --radius-0: 0;",
    "  --radius-50: var(--radius-xs);",
    "  --radius-100: var(--radius-sm);",
    "  --radius-200: var(--radius-lg);",
    "  --radius-300: var(--radius-xl);",
    "  --radius-400: var(--radius-2xl);",
    "  --radius-500: var(--radius-3xl);",
    "  --radius-600: var(--radius-3xl);",
    "",
    "  /* Control - buttons, inputs, selects */",
    "  --radius-control-sm: var(--radius-xs);",
    "  --radius-control-md: var(--radius-md);",
    "  --radius-control-lg: var(--radius-lg);",
    "",
    "  /* Surface - cards, panels, dialogs */",
    "  --radius-surface-sm: var(--radius-lg);",
    "  --radius-surface-md: var(--radius-xl);",
    "  --radius-surface-lg: var(--radius-2xl);",
    "",
    "  /* Media - images, video, avatars */",
    "  --radius-media-sm: var(--radius-md);",
    "  --radius-media-md: var(--radius-lg);",
    "  --radius-media-lg: var(--radius-xl);",
    "",
    "  /* Pill - chips, badges, tags */",
    "  --radius-pill: var(--radius-full);",
  ];
}

function effectVars() {
  return [
    ...radiusVars(),
    "",
    "  --border-0: 0;",
    "  --border-100: 1px;",
    "  --border-200: 2px;",
    "  --border-300: 4px;",
    "  --border-control: var(--border-100);",
    "  --border-control-strong: var(--border-200);",
    "  --border-surface: var(--border-100);",
    "  --border-highlight: var(--border-100);",
    "  --border-divider: var(--border-100);",
    "  --border-divider-strong: var(--border-200);",
    "  --border-focus-width: var(--border-200);",
    "",
    "  /* Cards elevation: xs inputs, sm cards, md popovers/toasts, lg dialogs/sheets */",
    "  --shadow-0: none;",
    "  --shadow-100: var(--shadow-xs);",
    "  --shadow-150: var(--shadow-xs);",
    "  --shadow-200: var(--shadow-sm);",
    "  --shadow-250: var(--shadow-sm);",
    "  --shadow-300: var(--shadow-md);",
    "  --shadow-400: var(--shadow-md);",
    "  --shadow-500: var(--shadow-lg);",
    "  --shadow-600: var(--shadow-lg);",
    "  --shadow-inset-top-light: inset 0 0 0 transparent;",
    "  --shadow-inset-start-light: inset 0 0 0 transparent;",
    "  --shadow-inset-end-light: inset 0 0 0 transparent;",
    "  --shadow-inset-bottom-light: inset 0 0 0 transparent;",
    "  --shadow-raised-xs: var(--shadow-xs);",
    "  --shadow-raised-sm: var(--shadow-sm);",
    "  --shadow-raised-md: var(--shadow-md);",
    "  --shadow-raised-lg: var(--shadow-lg);",
    "  --shadow-raised-soft: var(--shadow-sm);",
    "  --shadow-raised-depth: var(--shadow-sm);",
    "  --shadow-overlay-sm: var(--shadow-md);",
    "  --shadow-overlay-md: var(--shadow-md);",
    "  --shadow-overlay-lg: var(--shadow-lg);",
    "  --shadow-modal: var(--shadow-lg);",
    "",
    "  --motion-duration-0: 0ms;",
    "  --motion-duration-100: 120ms;",
    "  --motion-duration-150: 160ms;",
    "  --motion-duration-200: 180ms;",
    "  --motion-duration-300: 240ms;",
    "  --motion-duration-400: 320ms;",
    "  --motion-duration-500: 400ms;",
    "  --motion-duration-600: 500ms;",
    "  --motion-ease-linear: linear;",
    "  --motion-ease-in: cubic-bezier(0.7, 0, 1, 0.5);",
    "  --motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1);",
    "  --motion-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);",
    "  --motion-ease-standard: cubic-bezier(0.23, 1, 0.32, 1);",
    "  --motion-ease-emphasized: cubic-bezier(0.32, 0.72, 0, 1);",
    "  --motion-ease-spring: cubic-bezier(0.34, 1.25, 0.64, 1);",
    "  --motion-ease-spring-soft: cubic-bezier(0.28, 1.14, 0.4, 1);",
    "  --motion-interaction-duration: var(--motion-duration-100);",
    "  --motion-interaction-easing: var(--motion-ease-out);",
    "  --motion-expand-duration: var(--motion-duration-300);",
    "  --motion-expand-easing: var(--motion-ease-in-out);",
    "  --motion-overlay-duration: var(--motion-duration-200);",
    "  --motion-overlay-easing: var(--motion-ease-out);",
    "  --motion-overlay-exit-duration: var(--motion-duration-100);",
    "  --motion-overlay-exit-easing: var(--motion-ease-out);",
    "  --motion-modal-duration: var(--motion-duration-500);",
    "  --motion-modal-easing: var(--motion-ease-spring-soft);",
    "  --motion-modal-exit-duration: var(--motion-duration-200);",
    "  --motion-modal-exit-easing: var(--motion-ease-out);",
    "  --motion-page-duration: var(--motion-duration-500);",
    "  --motion-page-easing: var(--motion-ease-emphasized);",
    "",
    "  --opacity-0: 0;",
    "  --opacity-100: 0.08;",
    "  --opacity-200: 0.16;",
    "  --opacity-300: 0.32;",
    "  --opacity-400: 0.48;",
    "  --opacity-500: 0.64;",
    "  --opacity-600: 0.8;",
    "  --opacity-700: 1;",
    "  --opacity-disabled: var(--opacity-400);",
    "  --opacity-muted: var(--opacity-500);",
    "  --opacity-hover: var(--opacity-100);",
    "  --opacity-scrim-soft: var(--opacity-300);",
    "  --opacity-scrim: var(--opacity-500);",
    "  --opacity-full: var(--opacity-700);",
  ];
}

function typeLadderVars() {
  const ladder = tokens.semantic.type.ladder ?? {};
  const lines = ["  /* Type ladders — heading / ui / body / overline (size / line) */"];
  const emit = (cssName, key) => {
    const step = ladder[key];
    if (!step) return;
    lines.push(`  --type-size-${cssName}: ${step.size};`);
    lines.push(`  --type-line-${cssName}: ${step.line};`);
  };
  emit("heading-1", "heading1");
  emit("heading-2", "heading2");
  emit("heading-3", "heading3");
  emit("heading-4", "heading4");
  emit("heading-5", "heading5");
  emit("ui-xl", "uiXl");
  emit("ui-lg", "uiLg");
  emit("ui-md", "uiMd");
  emit("ui-sm", "uiSm");
  emit("ui-xs", "uiXs");
  emit("body-lg", "bodyLg");
  emit("body-md", "bodyMd");
  emit("body-sm", "bodySm");
  emit("body-xs", "bodyXs");
  emit("overline-xs", "overlineXs");
  lines.push(
    "  /* Legacy type role aliases */",
    "  --type-size-display: var(--type-size-heading-3);",
    "  --type-size-title: var(--type-size-heading-4);",
    "  --type-size-heading: var(--type-size-heading-5);",
    "  --type-size-metric: var(--type-size-ui-xl);",
    "  --type-size-body: var(--type-size-body-md);",
    "  --type-size-label: var(--type-size-ui-sm);",
    "  --type-size-caption: var(--type-size-body-xs);",
    "  --type-size-overline: var(--type-size-overline-xs);",
    "  --type-size-code: var(--type-size-ui-sm);",
  );
  return lines;
}

function iconStrokeVars() {
  const stroke = tokens.semantic.iconStroke ?? {};
  return [
    "  /* Lucide icons. Data strokes (charts, Progress, Meter) stay their own widths. */",
    `  --icon-stroke: ${stroke.default};`,
    `  --icon-stroke-strong: ${stroke.strong};`,
  ];
}

function aliasVars() {
  const aliases = tokens.semantic.aliases ?? {};
  return Object.entries(aliases).map(([name, value]) => `  --${kebab(name)}: ${value};`);
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
    ...spaceRoleVars(),
    "",
    ...effectVars(),
    "",
    `  --border-width-thin: ${p.borderWidth.thin};`,
    `  --border-width-medium: ${p.borderWidth.medium};`,
    "",
    `  --font-sans: ${tokens.semantic.type.family.sans};`,
    `  --font-display: ${tokens.semantic.type.family.display};`,
    `  --font-mono: ${tokens.semantic.type.family.mono};`,
    `  --font-body: var(--font-sans);`,
    `  --font-heading: var(--font-display);`,
    `  --type-family-body: var(--font-body);`,
    `  --type-family-heading: var(--font-heading);`,
    `  --type-family-code: var(--font-mono);`,
    "",
    ...typeLadderVars(),
    "",
    `  --type-weight-body: ${p.fontWeight.normal};`,
    `  --type-weight-label: ${p.fontWeight.medium};`,
    `  --type-weight-heading: ${p.fontWeight.semibold};`,
    `  --type-weight-title: ${p.fontWeight.bold};`,
    `  --type-weight-metric: ${p.fontWeight.medium};`,
    `  --type-weight-caption: ${p.fontWeight.medium};`,
    `  --type-weight-overline: ${p.fontWeight.medium};`,
    `  --type-weight-code: ${p.fontWeight.normal};`,
    "",
    `  --type-line-body: var(--type-line-body-md);`,
    `  --type-line-heading: var(--type-line-heading-5);`,
    `  --type-tracking-overline: ${p.letterSpacing.wide};`,
    "",
    `  --z-overlay: 40;`,
    `  --z-modal: 50;`,
    `  --z-toast: 55;`,
    `  --z-tooltip: 60;`,
    "",
    ...gridVars(),
    "",
    ...iconStrokeVars(),
  ];
}

const css = `/* Generated from tokens/tokens.json — run: npm run generate:tokens */
/* Components use semantic vars only. Primitives are for foundations reference. */

:root {
  /* Primitive color ramps (fixed across themes) */
${primitiveColorVars().join("\n")}

  /* Semantic colors — light (default) */
${resolveThemeVars("light").join("\n")}
${aliasVars().join("\n")}

${staticVars().join("\n")}
}

[data-theme="dark"] {
${resolveThemeVars("dark").join("\n")}
  --shadow-inset-top-light: inset 0 0 0 transparent;
  --shadow-inset-start-light: inset 0 0 0 transparent;
  --shadow-inset-end-light: inset 0 0 0 transparent;
  --shadow-inset-bottom-light: inset 0 0 0 transparent;
}

${colorThemeBlocks().join("\n")}
`;

writeFileSync(join(root, "lib/tokens.css"), css);
console.log("Generated lib/tokens.css");
