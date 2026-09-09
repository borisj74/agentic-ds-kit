#!/usr/bin/env node
/**
 * Generates lib/tokens.css from tokens/tokens.json.
 * Primitives are fixed. Appearance remaps under [data-theme="dark"].
 * Brand remaps under [data-color="blue"], [data-color="violet"], and [data-color="teal"].
 * Default brand (no data-color) is ink — the warm neutral ramp.
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
  const r = tokens.primitive.radius;
  const lines = ["  /* Radius scale */"];
  for (const [step, value] of Object.entries(r)) {
    lines.push(`  --radius-${step}: ${value};`);
  }
  lines.push(
    "  --radius-sm: var(--radius-50);",
    "  --radius-md: var(--radius-100);",
    "  --radius-lg: var(--radius-200);",
    "",
    "  /* Control - buttons, inputs, selects */",
    "  --radius-control-sm: var(--radius-50);",
    "  --radius-control-md: var(--radius-100);",
    "  --radius-control-lg: var(--radius-200);",
    "",
    "  /* Surface - cards, panels, dialogs */",
    "  --radius-surface-sm: var(--radius-100);",
    "  --radius-surface-md: var(--radius-100);",
    "  --radius-surface-lg: var(--radius-200);",
    "",
    "  /* Media - images, video, avatars */",
    "  --radius-media-sm: var(--radius-100);",
    "  --radius-media-md: var(--radius-100);",
    "  --radius-media-lg: var(--radius-200);",
    "",
    "  /* Pill - chips, badges, tags */",
    "  --radius-pill: var(--radius-full);",
  );
  return lines;
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
    "  --shadow-0: none;",
    "  --shadow-100: 0 4px 14px 2px rgb(0 0 0 / 0.008), 0 12px 40px 4px rgb(0 0 0 / 0.012);",
    "  --shadow-150: 0 8px 24px 4px rgb(0 0 0 / 0.008), 0 24px 64px 8px rgb(0 0 0 / 0.014);",
    "  --shadow-200: 0 8px 22px 4px rgb(0 0 0 / 0.01), 0 20px 56px 8px rgb(0 0 0 / 0.016);",
    "  --shadow-250: 0 10px 28px 6px rgb(0 0 0 / 0.01), 0 28px 72px 10px rgb(0 0 0 / 0.018);",
    "  --shadow-300: 0 12px 32px 6px rgb(0 0 0 / 0.012), 0 28px 68px 10px rgb(0 0 0 / 0.02);",
    "  --shadow-400: 0 16px 40px 8px rgb(0 0 0 / 0.012), 0 36px 80px 12px rgb(0 0 0 / 0.022);",
    "  --shadow-500: 0 20px 48px 10px rgb(0 0 0 / 0.014), 0 44px 96px 14px rgb(0 0 0 / 0.025);",
    "  --shadow-600: 0 28px 64px 12px rgb(0 0 0 / 0.016), 0 52px 112px 16px rgb(0 0 0 / 0.03);",
    "  --shadow-inset-top-light: inset 0 1px 0 rgb(255 255 255 / 0.72);",
    "  --shadow-inset-start-light: inset 1px 0 0 rgb(255 255 255 / 0.28);",
    "  --shadow-inset-end-light: inset -1px 0 0 rgb(255 255 255 / 0.1);",
    "  --shadow-inset-bottom-light: inset 0 -1px 0 rgb(0 0 0 / 0.035);",
    "  --shadow-raised-xs: var(--shadow-150);",
    "  --shadow-raised-sm: var(--shadow-200);",
    "  --shadow-raised-md: var(--shadow-300);",
    "  --shadow-raised-lg: var(--shadow-400);",
    "  --shadow-raised-soft: var(--shadow-250);",
    "  --shadow-raised-depth: var(--shadow-raised-soft), var(--shadow-inset-top-light), var(--shadow-inset-start-light), var(--shadow-inset-end-light), var(--shadow-inset-bottom-light);",
    "  --shadow-overlay-sm: var(--shadow-300);",
    "  --shadow-overlay-md: var(--shadow-400);",
    "  --shadow-overlay-lg: var(--shadow-500);",
    "  --shadow-modal: var(--shadow-600);",
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
    `  --type-family-body: var(--font-sans);`,
    `  --type-family-heading: var(--font-display);`,
    `  --type-family-code: var(--font-mono);`,
    "",
    `  --type-size-body: ${p.fontSize.base};`,
    `  --type-size-body-sm: ${p.fontSize.sm};`,
    `  --type-size-label: ${p.fontSize.sm};`,
    `  --type-size-heading: ${p.fontSize.lg};`,
    `  --type-size-title: ${p.fontSize["2xl"]};`,
    `  --type-size-display: ${p.fontSize["3xl"]};`,
    `  --type-size-metric: ${p.fontSize["3xl"]};`,
    `  --type-size-caption: ${p.fontSize.xs};`,
    `  --type-size-overline: ${p.fontSize.xs};`,
    `  --type-size-code: ${p.fontSize.sm};`,
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
    `  --type-line-body: ${p.lineHeight.normal};`,
    `  --type-line-heading: ${p.lineHeight.tight};`,
    `  --type-tracking-overline: ${p.letterSpacing.wide};`,
    "",
    `  --z-overlay: 40;`,
    `  --z-modal: 50;`,
    `  --z-tooltip: 60;`,
    "",
    ...gridVars(),
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
  --shadow-inset-top-light: inset 0 0 0 transparent;
  --shadow-inset-start-light: inset 0 0 0 transparent;
  --shadow-inset-end-light: inset 0 0 0 transparent;
  --shadow-inset-bottom-light: inset 0 0 0 transparent;
}

${colorThemeBlocks().join("\n")}
`;

writeFileSync(join(root, "lib/tokens.css"), css);
console.log("Generated lib/tokens.css");
