import { applyPrimaryRamp, clearPrimaryRamp, normalizeHex } from "./primary-ramp";

export const PLAYGROUND_THEME_STORAGE_KEY = "playground-theme";
export const PLAYGROUND_COLOR_STORAGE_KEY = "playground-color-theme";
export const PLAYGROUND_FONT_STORAGE_KEY = "playground-font";
export const PLAYGROUND_HEADING_WEIGHT_KEY = "playground-heading-weight";
export const PLAYGROUND_PRIMARY_HEX_KEY = "playground-primary-hex";
export const PLAYGROUND_RADIUS_BASE_KEY = "playground-radius-base";
export const PLAYGROUND_SHADOW_SM_KEY = "playground-shadow-sm";
export const PLAYGROUND_FONT_INTERFACE_KEY = "playground-font-interface";
export const PLAYGROUND_FONT_HEADING_KEY = "playground-font-heading";
export const PLAYGROUND_FONT_MONO_KEY = "playground-font-mono";
export const PLAYGROUND_NEUTRAL_KEY = "playground-neutral";
export const PLAYGROUND_SPACE_SCALE_KEY = "playground-space-scale";
export const PLAYGROUND_SHADOW_INTENSITY_KEY = "playground-shadow-intensity";
export const PLAYGROUND_CUSTOMIZE_STORAGE_KEY = "playground-customize-open";
/** "closed" hides the docs sidebar on wide screens (the head script applies it before paint). */
export const PLAYGROUND_SIDEBAR_STORAGE_KEY = "playground-sidebar";

export type PlaygroundTheme = "light" | "dark";
export type PlaygroundColorTheme = "ink" | "blue" | "violet" | "teal" | "custom";
export type PlaygroundFont = "ibm-plex" | "inter" | "geist" | "system";
export type PlaygroundFontRole = "interface" | "heading" | "mono";
export type PlaygroundNeutralScale = "neutral" | "zinc" | "slate" | "stone" | "gray";
export type PlaygroundHeadingWeight = "400" | "500" | "600" | "700";

export const DEFAULT_SPACE_SCALE = 100;
export const DEFAULT_SHADOW_INTENSITY = 100;
const MIN_SPACE_SCALE = 75;
const MAX_SPACE_SCALE = 150;
const MIN_SHADOW_INTENSITY = 0;
const MAX_SHADOW_INTENSITY = 200;

export const PLAYGROUND_COLOR_THEMES: { value: PlaygroundColorTheme; label: string }[] = [
  { value: "ink", label: "Ink" },
  { value: "blue", label: "Blue" },
  { value: "violet", label: "Violet" },
  { value: "teal", label: "Teal" },
  { value: "custom", label: "Custom" },
];

export const PLAYGROUND_FONTS: { value: PlaygroundFont; label: string }[] = [
  { value: "ibm-plex", label: "IBM Plex" },
  { value: "inter", label: "Inter" },
  { value: "geist", label: "Geist" },
  { value: "system", label: "System" },
];

export const PLAYGROUND_HEADING_WEIGHTS: { value: PlaygroundHeadingWeight; label: string }[] = [
  { value: "400", label: "400" },
  { value: "500", label: "500" },
  { value: "600", label: "600" },
  { value: "700", label: "700" },
];

export const PLAYGROUND_NEUTRAL_OPTIONS: { value: PlaygroundNeutralScale; label: string }[] = [
  { value: "neutral", label: "Neutral" },
  { value: "zinc", label: "Zinc" },
  { value: "slate", label: "Slate" },
  { value: "stone", label: "Stone" },
  { value: "gray", label: "Gray" },
];

export const NEUTRAL_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;
export type NeutralStep = (typeof NEUTRAL_STEPS)[number];

/** Named ramps written onto --color-neutral-*. Neutral matches tokens.css. */
export const NEUTRAL_RAMPS: Record<PlaygroundNeutralScale, Record<NeutralStep, string>> = {
  neutral: {
    "50": "#fafafa",
    "100": "#f5f5f5",
    "200": "#e5e5e5",
    "300": "#d4d4d4",
    "400": "#a3a3a3",
    "500": "#737373",
    "600": "#525252",
    "700": "#404040",
    "800": "#262626",
    "900": "#171717",
    "950": "#0a0a0a",
  },
  zinc: {
    "50": "#fafafa",
    "100": "#f4f4f5",
    "200": "#e4e4e7",
    "300": "#d4d4d8",
    "400": "#a1a1aa",
    "500": "#71717a",
    "600": "#52525b",
    "700": "#3f3f46",
    "800": "#27272a",
    "900": "#18181b",
    "950": "#09090b",
  },
  slate: {
    "50": "#f8fafc",
    "100": "#f1f5f9",
    "200": "#e2e8f0",
    "300": "#cbd5e1",
    "400": "#94a3b8",
    "500": "#64748b",
    "600": "#475569",
    "700": "#334155",
    "800": "#1e293b",
    "900": "#0f172a",
    "950": "#020617",
  },
  stone: {
    "50": "#fafaf9",
    "100": "#f5f5f4",
    "200": "#e7e5e4",
    "300": "#d6d3d1",
    "400": "#a8a29e",
    "500": "#78716c",
    "600": "#57534e",
    "700": "#44403c",
    "800": "#292524",
    "900": "#1c1917",
    "950": "#0c0a09",
  },
  gray: {
    "50": "#f9fafb",
    "100": "#f3f4f6",
    "200": "#e5e7eb",
    "300": "#d1d5db",
    "400": "#9ca3af",
    "500": "#6b7280",
    "600": "#4b5563",
    "700": "#374151",
    "800": "#1f2937",
    "900": "#111827",
    "950": "#030712",
  },
};

const STEP = (step: NeutralStep) => `var(--color-neutral-${step})`;

/** Semantic roles that follow the neutral ramp. Same keys in light and dark so a theme swap clears the other set. */
const LIGHT_NEUTRAL_ROLES: Record<string, string> = {
  "--bg-canvas": STEP("100"),
  "--bg-subtle": STEP("50"),
  "--bg-tray": STEP("200"),
  "--bg-surface": "var(--color-white)",
  "--bg-raised": "var(--color-white)",
  "--bg-floating": "var(--color-white)",
  "--bg-field": "var(--color-white)",
  "--bg-control": "var(--color-white)",
  "--bg-control-hover": STEP("50"),
  "--bg-track": STEP("200"),
  "--bg-track-strong": STEP("300"),
  "--bg-inverse": STEP("950"),
  "--bg-inverse-hover": STEP("800"),
  "--text-fg": STEP("950"),
  "--text-fg-muted": STEP("600"),
  "--text-fg-subtle": STEP("400"),
  "--text-fg-disabled": STEP("300"),
  "--text-fg-inverse": "var(--color-white)",
  "--line-default": STEP("200"),
  "--line-strong": STEP("300"),
  "--line-inverse": "var(--color-white)",
};

const DARK_NEUTRAL_ROLES: Record<string, string> = {
  "--bg-canvas": STEP("950"),
  "--bg-subtle": STEP("900"),
  "--bg-tray": STEP("800"),
  "--bg-surface": STEP("900"),
  "--bg-raised": STEP("800"),
  "--bg-floating": STEP("800"),
  "--bg-field": STEP("900"),
  "--bg-control": STEP("900"),
  "--bg-control-hover": STEP("800"),
  "--bg-track": STEP("800"),
  "--bg-track-strong": STEP("700"),
  "--bg-inverse": STEP("100"),
  "--bg-inverse-hover": STEP("200"),
  "--text-fg": STEP("50"),
  "--text-fg-muted": STEP("400"),
  "--text-fg-subtle": STEP("500"),
  "--text-fg-disabled": STEP("600"),
  "--text-fg-inverse": STEP("950"),
  "--line-default": STEP("800"),
  "--line-strong": STEP("700"),
  "--line-inverse": STEP("950"),
};

const NEUTRAL_ROLE_VARS = Object.keys(LIGHT_NEUTRAL_ROLES);

/** y, blur, alpha at intensity 100. Dark starts heavier, matching tokens.css. */
const SHADOW_LIGHT: Array<[string, number, number, number]> = [
  ["--shadow-xs", 0.5, 1, 0.088],
  ["--shadow-sm", 1, 2, 0.1],
  ["--shadow-md", 4, 8, 0.175],
  ["--shadow-lg", 8, 16, 0.275],
];

const SHADOW_DARK: Array<[string, number, number, number]> = [
  ["--shadow-xs", 0.5, 1, 0.28],
  ["--shadow-sm", 1, 2, 0.32],
  ["--shadow-md", 4, 8, 0.42],
  ["--shadow-lg", 8, 16, 0.55],
];

const SPACE_BASE: Record<string, number> = {
  "--space-px": 2,
  "--space-1": 4,
  "--space-2": 8,
  "--space-3": 12,
  "--space-4": 16,
  "--space-5": 20,
  "--space-6": 24,
  "--space-8": 32,
  "--space-10": 40,
  "--space-12": 48,
  "--space-16": 64,
};

const FONT_ROOT: Record<PlaygroundFontRole, string> = {
  interface: "--font-sans",
  heading: "--font-display",
  mono: "--font-mono",
};

const FONT_ATTR: Record<PlaygroundFontRole, string> = {
  interface: "data-font-interface",
  heading: "data-font-heading",
  mono: "data-font-mono",
};

const FONT_STORAGE: Record<PlaygroundFontRole, string> = {
  interface: PLAYGROUND_FONT_INTERFACE_KEY,
  heading: PLAYGROUND_FONT_HEADING_KEY,
  mono: PLAYGROUND_FONT_MONO_KEY,
};

export const DEFAULT_RADIUS_BASE = 8;
export const DEFAULT_SHADOW_SM = "0 1px 2px 0px rgb(0 0 0 / 0.1)";
export const DEFAULT_PRIMARY_HEX = "#000000";

/** Named brand shortcuts. Any other hex takes the custom ramp. */
export const PLAYGROUND_PRIMARY_SWATCHES: {
  value: string;
  label: string;
  theme: Exclude<PlaygroundColorTheme, "custom">;
}[] = [
  { value: "#000000", label: "Ink", theme: "ink" },
  { value: "#2563eb", label: "Blue", theme: "blue" },
  { value: "#7c3aed", label: "Violet", theme: "violet" },
  { value: "#0d9488", label: "Teal", theme: "teal" },
];

const COLOR_SHORTCUTS = new Set(["ink", "blue", "violet", "teal"]);

function isColorTheme(value: string | null): value is PlaygroundColorTheme {
  return value === "ink" || value === "blue" || value === "violet" || value === "teal" || value === "custom";
}

function isFont(value: string | null): value is PlaygroundFont {
  return value === "ibm-plex" || value === "inter" || value === "geist" || value === "system";
}

function isHeadingWeight(value: string | null): value is PlaygroundHeadingWeight {
  return value === "400" || value === "500" || value === "600" || value === "700";
}

function store(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export function readPlaygroundTheme(): PlaygroundTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function applyPlaygroundTheme(theme: PlaygroundTheme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
  // A custom primary ramp is inline on the root and built for one mode; rebuild
  // it, or dark keeps light subtle fills under dark-mode text (the nav's active
  // item turned pale on pale).
  if (root.getAttribute("data-color") === "custom") {
    applyPrimaryRamp(readStoredPrimaryHex() ?? DEFAULT_PRIMARY_HEX, theme === "dark");
  }
  store(PLAYGROUND_THEME_STORAGE_KEY, theme);
}

export function readPlaygroundColorTheme(): PlaygroundColorTheme {
  if (typeof document === "undefined") return "ink";
  const color = document.documentElement.getAttribute("data-color");
  return isColorTheme(color) ? color : "ink";
}

export function applyPlaygroundColorTheme(color: PlaygroundColorTheme): void {
  const root = document.documentElement;
  if (color === "ink") {
    root.removeAttribute("data-color");
  } else {
    root.setAttribute("data-color", color);
  }
  store(PLAYGROUND_COLOR_STORAGE_KEY, color);
  if (color === "custom") {
    const hex = readStoredPrimaryHex() ?? DEFAULT_PRIMARY_HEX;
    applyPrimaryRamp(hex, readPlaygroundTheme() === "dark");
    store(PLAYGROUND_PRIMARY_HEX_KEY, hex);
    return;
  }
  clearPrimaryRamp();
  try {
    localStorage.removeItem(PLAYGROUND_PRIMARY_HEX_KEY);
  } catch {
    /* ignore */
  }
}

function fontStack(font: PlaygroundFont, mono: boolean): string {
  if (font === "inter") {
    return mono ? "ui-monospace, Menlo, monospace" : "var(--font-inter), system-ui, sans-serif";
  }
  if (font === "geist") {
    return mono
      ? "var(--font-geist-mono), ui-monospace, monospace"
      : "var(--font-geist-sans), system-ui, sans-serif";
  }
  if (font === "system") {
    return mono ? "ui-monospace, Menlo, monospace" : "system-ui, sans-serif";
  }
  return mono
    ? 'var(--font-ibm-plex-mono, "IBM Plex Mono"), ui-monospace, monospace'
    : 'var(--font-ibm-plex-sans, "IBM Plex Sans"), system-ui, sans-serif';
}

function clampSpace(percent: number): number {
  const stepped = Math.round(percent / 5) * 5;
  return Math.min(MAX_SPACE_SCALE, Math.max(MIN_SPACE_SCALE, stepped));
}

function clampShadow(percent: number): number {
  const stepped = Math.round(percent / 10) * 10;
  return Math.min(MAX_SHADOW_INTENSITY, Math.max(MIN_SHADOW_INTENSITY, stepped));
}

function shadowValue(y: number, blur: number, alpha: number, intensity: number): string {
  if (intensity === 0) return "none";
  const scale = intensity / 100;
  const nextY = +(y * scale).toFixed(2);
  const nextBlur = +(blur * scale).toFixed(2);
  const nextAlpha = Math.min(0.85, +(alpha * scale).toFixed(3));
  return `0 ${nextY}px ${nextBlur}px 0px rgb(0 0 0 / ${nextAlpha})`;
}

export function readPlaygroundFont(): PlaygroundFont {
  return readPlaygroundFontRole("interface");
}

export function readPlaygroundFontRole(role: PlaygroundFontRole): PlaygroundFont {
  if (typeof document === "undefined") return "ibm-plex";
  const font = document.documentElement.getAttribute(FONT_ATTR[role]);
  return isFont(font) ? font : "ibm-plex";
}

/** Sets one family. Interface writes --font-sans, headings --font-display, mono --font-mono. */
export function applyPlaygroundFontRole(role: PlaygroundFontRole, font: PlaygroundFont): void {
  const root = document.documentElement;
  root.removeAttribute("data-font");
  const rootVar = FONT_ROOT[role];
  if (font === "ibm-plex") {
    root.style.removeProperty(rootVar);
    root.removeAttribute(FONT_ATTR[role]);
  } else {
    root.style.setProperty(rootVar, fontStack(font, role === "mono"));
    root.setAttribute(FONT_ATTR[role], font);
  }
  store(FONT_STORAGE[role], font);
}

/** Sets interface, headings, and mono together. Inter keeps the default mono. */
export function applyPlaygroundFont(font: PlaygroundFont): void {
  applyPlaygroundFontRole("interface", font);
  applyPlaygroundFontRole("heading", font);
  applyPlaygroundFontRole("mono", font === "inter" ? "ibm-plex" : font);
}

function isNeutralScale(value: string | null): value is PlaygroundNeutralScale {
  return value === "neutral" || value === "zinc" || value === "slate" || value === "stone" || value === "gray";
}

export function readPlaygroundNeutralScale(): PlaygroundNeutralScale {
  if (typeof document === "undefined") return "neutral";
  const scale = document.documentElement.getAttribute("data-neutral");
  return isNeutralScale(scale) ? scale : "neutral";
}

function paintNeutralScale(scale: PlaygroundNeutralScale, theme: PlaygroundTheme): void {
  const root = document.documentElement;
  for (const step of NEUTRAL_STEPS) root.style.removeProperty(`--color-neutral-${step}`);
  for (const name of NEUTRAL_ROLE_VARS) root.style.removeProperty(name);
  if (scale === "neutral") {
    root.removeAttribute("data-neutral");
    return;
  }
  const ramp = NEUTRAL_RAMPS[scale];
  for (const step of NEUTRAL_STEPS) root.style.setProperty(`--color-neutral-${step}`, ramp[step]);
  const roles = theme === "dark" ? DARK_NEUTRAL_ROLES : LIGHT_NEUTRAL_ROLES;
  for (const [name, value] of Object.entries(roles)) root.style.setProperty(name, value);
  root.setAttribute("data-neutral", scale);
}

/** Writes --color-neutral-* and the surface, text, and line roles that follow that ramp. */
export function applyPlaygroundNeutralScale(scale: PlaygroundNeutralScale): void {
  paintNeutralScale(scale, readPlaygroundTheme());
  store(PLAYGROUND_NEUTRAL_KEY, scale);
}

export function readPlaygroundSpaceScale(): number {
  if (typeof document === "undefined") return DEFAULT_SPACE_SCALE;
  const raw = document.documentElement.getAttribute("data-space");
  const n = Number(raw);
  return Number.isFinite(n) && raw ? clampSpace(n) : DEFAULT_SPACE_SCALE;
}

/** Multiplies the --space-* scale. 100 is the kit default. Semantic space tokens follow those variables. */
export function applyPlaygroundSpaceScale(percent: number): void {
  const next = clampSpace(percent);
  const root = document.documentElement;
  if (next === DEFAULT_SPACE_SCALE) {
    for (const name of Object.keys(SPACE_BASE)) root.style.removeProperty(name);
    root.removeAttribute("data-space");
  } else {
    const factor = next / 100;
    for (const [name, px] of Object.entries(SPACE_BASE)) {
      root.style.setProperty(name, `${Math.max(1, Math.round(px * factor))}px`);
    }
    root.setAttribute("data-space", String(next));
  }
  store(PLAYGROUND_SPACE_SCALE_KEY, String(next));
}

export function readPlaygroundShadowIntensity(): number {
  if (typeof document === "undefined") return DEFAULT_SHADOW_INTENSITY;
  const raw = document.documentElement.getAttribute("data-shadow");
  const n = Number(raw);
  return Number.isFinite(n) && raw ? clampShadow(n) : DEFAULT_SHADOW_INTENSITY;
}

function paintShadowIntensity(intensity: number, theme: PlaygroundTheme): void {
  const root = document.documentElement;
  const spec = theme === "dark" ? SHADOW_DARK : SHADOW_LIGHT;
  if (intensity === DEFAULT_SHADOW_INTENSITY) {
    for (const [name] of spec) root.style.removeProperty(name);
    root.style.removeProperty("--shadow-sm");
    root.removeAttribute("data-shadow");
    return;
  }
  for (const [name, y, blur, alpha] of spec) {
    root.style.setProperty(name, shadowValue(y, blur, alpha, intensity));
  }
  root.setAttribute("data-shadow", String(intensity));
}

/** Scales --shadow-xs, --shadow-sm, --shadow-md, and --shadow-lg. 100 restores the theme default. */
export function applyPlaygroundShadowIntensity(percent: number): void {
  const next = clampShadow(percent);
  paintShadowIntensity(next, readPlaygroundTheme());
  store(PLAYGROUND_SHADOW_INTENSITY_KEY, String(next));
}

export function readPlaygroundHeadingWeight(): PlaygroundHeadingWeight {
  if (typeof document === "undefined") return "600";
  const weight = document.documentElement.style.getPropertyValue("--type-weight-heading").trim();
  return isHeadingWeight(weight) ? weight : "600";
}

export function applyPlaygroundHeadingWeight(weight: PlaygroundHeadingWeight): void {
  if (weight === "600") {
    document.documentElement.style.removeProperty("--type-weight-heading");
  } else {
    document.documentElement.style.setProperty("--type-weight-heading", weight);
  }
  store(PLAYGROUND_HEADING_WEIGHT_KEY, weight);
}

export function readStoredPrimaryHex(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeHex(localStorage.getItem(PLAYGROUND_PRIMARY_HEX_KEY) ?? "");
  } catch {
    return null;
  }
}

export function applyPlaygroundPrimaryHex(hex: string): void {
  const next = normalizeHex(hex);
  if (!next) return;
  store(PLAYGROUND_PRIMARY_HEX_KEY, next);
  applyPlaygroundColorTheme("custom");
  applyPrimaryRamp(next, readPlaygroundTheme() === "dark");
}

/** Swatches use the named themes. Any other hex generates the live ramp. */
export function applyPlaygroundPrimaryChoice(hex: string): void {
  const next = normalizeHex(hex);
  if (!next) return;
  const shortcut = PLAYGROUND_PRIMARY_SWATCHES.find((swatch) => swatch.value === next);
  if (shortcut) {
    applyPlaygroundColorTheme(shortcut.theme);
    return;
  }
  applyPlaygroundPrimaryHex(next);
}

export function readPlaygroundPrimaryHex(): string {
  const color = readPlaygroundColorTheme();
  if (color !== "custom") {
    return PLAYGROUND_PRIMARY_SWATCHES.find((swatch) => swatch.theme === color)?.value ?? DEFAULT_PRIMARY_HEX;
  }
  return readStoredPrimaryHex() ?? DEFAULT_PRIMARY_HEX;
}

export function resetPlaygroundAppearance(): void {
  applyPlaygroundFontRole("interface", "ibm-plex");
  applyPlaygroundFontRole("heading", "ibm-plex");
  applyPlaygroundFontRole("mono", "ibm-plex");
  applyPlaygroundHeadingWeight("600");
  applyPlaygroundNeutralScale("neutral");
  applyPlaygroundSpaceScale(DEFAULT_SPACE_SCALE);
  applyPlaygroundShadowIntensity(DEFAULT_SHADOW_INTENSITY);
  const root = document.documentElement;
  root.style.removeProperty("--radius-base");
  root.removeAttribute("data-font");
  try {
    localStorage.removeItem(PLAYGROUND_RADIUS_BASE_KEY);
    localStorage.removeItem(PLAYGROUND_SHADOW_SM_KEY);
    localStorage.removeItem(PLAYGROUND_FONT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  applyPlaygroundTheme("light");
  applyPlaygroundColorTheme("ink");
}

export function readPlaygroundRadiusBase(): number {
  if (typeof document === "undefined") return DEFAULT_RADIUS_BASE;
  const raw = document.documentElement.style.getPropertyValue("--radius-base").trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : DEFAULT_RADIUS_BASE;
}

export function applyPlaygroundRadiusBase(px: number): void {
  const next = Math.min(24, Math.max(2, Math.round(px)));
  document.documentElement.style.setProperty("--radius-base", `${next}px`);
  store(PLAYGROUND_RADIUS_BASE_KEY, String(next));
}

export function readPlaygroundShadowSm(): string {
  if (typeof document === "undefined") return DEFAULT_SHADOW_SM;
  const value = document.documentElement.style.getPropertyValue("--shadow-sm").trim();
  return value || DEFAULT_SHADOW_SM;
}

export function applyPlaygroundShadowSm(value: string): void {
  const next = value.trim() || DEFAULT_SHADOW_SM;
  document.documentElement.style.setProperty("--shadow-sm", next);
  store(PLAYGROUND_SHADOW_SM_KEY, next);
}

export function readPlaygroundAppearance() {
  return {
    theme: readPlaygroundTheme(),
    color: readPlaygroundColorTheme(),
    font: readPlaygroundFontRole("interface"),
    interfaceFont: readPlaygroundFontRole("interface"),
    headingFont: readPlaygroundFontRole("heading"),
    monoFont: readPlaygroundFontRole("mono"),
    neutral: readPlaygroundNeutralScale(),
    spaceScale: readPlaygroundSpaceScale(),
    shadowIntensity: readPlaygroundShadowIntensity(),
    headingWeight: readPlaygroundHeadingWeight(),
    primaryHex: readStoredPrimaryHex(),
    radiusBase: readPlaygroundRadiusBase(),
    shadowSm: readPlaygroundShadowSm(),
  };
}

/**
 * Runs before paint. Sets the chrome mode, the Theme panel state, and data-preview-theme when a
 * preview theme is saved ("nistha-theme-playground", THEME_STORAGE_KEY in theme-playground.ts),
 * so previews stay hidden until that theme is applied instead of flashing the default.
 */
/** Before paint: stored panel/sidebar state, and the theme (stored choice, else prefers-color-scheme). */
export const PLAYGROUND_THEME_INIT_SCRIPT = `(function(){try{var root=document.documentElement;var panel=localStorage.getItem("${PLAYGROUND_CUSTOMIZE_STORAGE_KEY}");if(panel==="open"||panel==="closed")root.setAttribute("data-customize",panel);if(localStorage.getItem("${PLAYGROUND_SIDEBAR_STORAGE_KEY}")==="closed")root.setAttribute("data-sidebar","closed");var t=localStorage.getItem("${PLAYGROUND_THEME_STORAGE_KEY}");if(t==="dark"||(t===null&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches))root.setAttribute("data-theme","dark");if(localStorage.getItem("nistha-theme-playground"))root.setAttribute("data-preview-theme","stored");}catch(e){}})();`;


export { COLOR_SHORTCUTS };
