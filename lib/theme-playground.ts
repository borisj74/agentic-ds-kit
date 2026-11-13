import {
  contrastRatio,
  generateColorRamp,
  hexToOklch,
  normalizeHex,
  oklchLightness,
  oklchToHex,
  tintToward,
  type ColorRamp,
  type RampStep,
} from "agentic-ds-kit/color-ramp";
import tokens from "agentic-ds-kit/tokens/tokens.json";
import { NEUTRAL_RAMPS, type PlaygroundNeutralScale } from "./playground-theme";

export const THEME_STORAGE_KEY = "nistha-theme-playground";
export const DEFAULT_ACCENT = "#0d9488";

export const RAMP_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const satisfies readonly RampStep[];

export type ThemeMode = "light" | "dark";
export type Density = "compact" | "default" | "comfy";
export type NeutralChoice = PlaygroundNeutralScale | "tint";
export type SansFont = "ibm-plex" | "inter" | "dm-sans" | "source-sans" | "outfit";
export type DisplayFont = "ibm-plex" | "newsreader" | "fraunces" | "instrument-serif" | "outfit";
export type PresetId = "nistha" | "ink" | "blue" | "violet" | "teal" | "rose" | "amber" | "indigo" | "forest" | "custom";
export type HeadingWeight = "400" | "500" | "600" | "700";
export type ShadowPreset = "none" | "flat" | "subtle" | "default" | "raised" | "dramatic";
export type ShadowTint = "neutral" | "primary";

export interface ThemeState {
  preset: PresetId;
  brand: string;
  accent: string;
  neutral: NeutralChoice;
  step: RampStep;
  /** Even pixel size from 0 to 48. */
  radius: number;
  pill: boolean;
  density: Density;
  shadowPreset: ShadowPreset;
  /** 0–200. 100 is the preset's opacity. */
  shadowIntensity: number;
  /** 50–200. 100 is the preset's blur and offset. */
  shadowScale: number;
  shadowTint: ShadowTint;
  font: SansFont;
  display: DisplayFont;
  headingWeight: HeadingWeight;
  mode: ThemeMode;
}

interface Preset {
  id: Exclude<PresetId, "custom">;
  label: string;
  brand: string;
  accent: string;
  neutral: NeutralChoice;
  step: RampStep;
  radius: number;
  pill: boolean;
  density: Density;
  shadowPreset: ShadowPreset;
  shadowIntensity: number;
  shadowScale: number;
  shadowTint: ShadowTint;
  font: SansFont;
  display: DisplayFont;
  headingWeight: HeadingWeight;
}

const SHADOW_DEFAULTS = { shadowIntensity: 100, shadowScale: 100, shadowTint: "neutral" as const, pill: false, headingWeight: "600" as const };

export const PRESETS: readonly Preset[] = [
  { id: "nistha", label: "Nistha", brand: "#2b2bf5", accent: "", neutral: "slate", step: "500", radius: 8, density: "default", shadowPreset: "subtle", font: "ibm-plex", display: "ibm-plex", ...SHADOW_DEFAULTS },
  { id: "ink", label: "Ink", brand: "#000000", accent: "", neutral: "neutral", step: "500", radius: 8, density: "default", shadowPreset: "subtle", font: "ibm-plex", display: "ibm-plex", ...SHADOW_DEFAULTS },
  { id: "blue", label: "Blue", brand: "#3b82f6", accent: "", neutral: "slate", step: "600", radius: 8, density: "default", shadowPreset: "default", font: "ibm-plex", display: "ibm-plex", ...SHADOW_DEFAULTS },
  { id: "violet", label: "Violet", brand: "#8b5cf6", accent: "#0d9488", neutral: "zinc", step: "600", radius: 16, density: "comfy", shadowPreset: "raised", font: "ibm-plex", display: "newsreader", ...SHADOW_DEFAULTS },
  { id: "teal", label: "Teal", brand: "#14b8a6", accent: "", neutral: "stone", step: "600", radius: 8, density: "default", shadowPreset: "subtle", font: "ibm-plex", display: "ibm-plex", ...SHADOW_DEFAULTS },
  { id: "rose", label: "Rose", brand: "#f43f5e", accent: "", neutral: "stone", step: "600", radius: 16, density: "comfy", shadowPreset: "raised", font: "dm-sans", display: "fraunces", ...SHADOW_DEFAULTS },
  { id: "amber", label: "Amber", brand: "#f59e0b", accent: "", neutral: "stone", step: "600", radius: 4, density: "default", shadowPreset: "default", font: "source-sans", display: "newsreader", ...SHADOW_DEFAULTS },
  { id: "indigo", label: "Indigo", brand: "#6366f1", accent: "", neutral: "slate", step: "600", radius: 8, density: "compact", shadowPreset: "subtle", font: "outfit", display: "outfit", ...SHADOW_DEFAULTS },
  { id: "forest", label: "Forest", brand: "#22c55e", accent: "#d97706", neutral: "neutral", step: "700", radius: 8, density: "default", shadowPreset: "subtle", font: "source-sans", display: "instrument-serif", ...SHADOW_DEFAULTS },
];

export const RADIUS_PRESETS = [
  { id: "sharp", label: "Sharp", px: 0, pill: false },
  { id: "subtle", label: "Subtle", px: 4, pill: false },
  { id: "default", label: "Default", px: 8, pill: false },
  { id: "soft", label: "Soft", px: 16, pill: false },
  { id: "round", label: "Round", px: 24, pill: false },
  { id: "extra", label: "Extra", px: 32, pill: false },
  { id: "pill", label: "Pill", px: 8, pill: true },
] as const;

export const SHADOW_PRESETS: { id: ShadowPreset; label: string }[] = [
  { id: "none", label: "None" },
  { id: "flat", label: "Flat" },
  { id: "subtle", label: "Subtle" },
  { id: "default", label: "Default" },
  { id: "raised", label: "Raised" },
  { id: "dramatic", label: "Dramatic" },
];

const SPACE_PX: Record<string, number> = {
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
const SHADOW_PRESET_ALPHA: Record<ShadowPreset, number> = {
  none: 0,
  flat: 0,
  subtle: 0.55,
  default: 1,
  raised: 1.45,
  dramatic: 2.1,
};

interface ShadowSpec {
  y: number;
  blur: number;
  alpha: number;
}

const SHADOW_SPEC: Record<ThemeMode, Record<"xs" | "sm" | "md" | "lg", ShadowSpec>> = {
  light: {
    xs: { y: 0.5, blur: 1, alpha: 0.088 },
    sm: { y: 1, blur: 2, alpha: 0.1 },
    md: { y: 4, blur: 8, alpha: 0.175 },
    lg: { y: 8, blur: 16, alpha: 0.275 },
  },
  dark: {
    xs: { y: 0.5, blur: 1, alpha: 0.28 },
    sm: { y: 1, blur: 2, alpha: 0.32 },
    md: { y: 4, blur: 8, alpha: 0.42 },
    lg: { y: 8, blur: 16, alpha: 0.55 },
  },
};

export const SANS_FONTS: { id: SansFont; label: string; preview: string; exported: string }[] = [
  { id: "ibm-plex", label: "IBM Plex Sans", preview: 'var(--font-ibm-plex-sans, "IBM Plex Sans"), system-ui, sans-serif', exported: '"IBM Plex Sans", system-ui, sans-serif' },
  { id: "inter", label: "Inter", preview: 'var(--font-inter), "Inter", system-ui, sans-serif', exported: '"Inter", system-ui, sans-serif' },
  { id: "dm-sans", label: "DM Sans", preview: 'var(--font-theme-dm-sans), "DM Sans", system-ui, sans-serif', exported: '"DM Sans", system-ui, sans-serif' },
  { id: "source-sans", label: "Source Sans 3", preview: 'var(--font-theme-source-sans), "Source Sans 3", system-ui, sans-serif', exported: '"Source Sans 3", system-ui, sans-serif' },
  { id: "outfit", label: "Outfit", preview: 'var(--font-theme-outfit), "Outfit", system-ui, sans-serif', exported: '"Outfit", system-ui, sans-serif' },
];

export const DISPLAY_FONTS: { id: DisplayFont; label: string; preview: string; exported: string }[] = [
  { id: "ibm-plex", label: "IBM Plex Sans", preview: 'var(--font-ibm-plex-sans, "IBM Plex Sans"), system-ui, sans-serif', exported: '"IBM Plex Sans", system-ui, sans-serif' },
  { id: "newsreader", label: "Newsreader", preview: 'var(--font-theme-newsreader), "Newsreader", Georgia, serif', exported: '"Newsreader", Georgia, serif' },
  { id: "fraunces", label: "Fraunces", preview: 'var(--font-theme-fraunces), "Fraunces", Georgia, serif', exported: '"Fraunces", Georgia, serif' },
  { id: "instrument-serif", label: "Instrument Serif", preview: 'var(--font-theme-instrument-serif), "Instrument Serif", Georgia, serif', exported: '"Instrument Serif", Georgia, serif' },
  { id: "outfit", label: "Outfit", preview: 'var(--font-theme-outfit), "Outfit", system-ui, sans-serif', exported: '"Outfit", system-ui, sans-serif' },
];

const NEUTRAL_OPTIONS: NeutralChoice[] = ["neutral", "zinc", "slate", "stone", "gray", "tint"];
const DENSITIES: Density[] = ["compact", "default", "comfy"];

export const DEFAULT_THEME: ThemeState = presetState("nistha", "light");

export function presetState(id: Exclude<PresetId, "custom">, mode: ThemeMode): ThemeState {
  const preset = PRESETS.find((item) => item.id === id) ?? PRESETS[0];
  return {
    preset: preset.id,
    brand: preset.brand,
    accent: preset.accent,
    neutral: preset.neutral,
    step: preset.step,
    radius: preset.radius,
    pill: preset.pill,
    density: preset.density,
    shadowPreset: preset.shadowPreset,
    shadowIntensity: preset.shadowIntensity,
    shadowScale: preset.shadowScale,
    shadowTint: preset.shadowTint,
    font: preset.font,
    display: preset.display,
    headingWeight: preset.headingWeight,
    mode,
  };
}

function hexOf(input: string, fallback: string): string {
  return normalizeHex(input) ?? fallback;
}

function shift(step: RampStep, delta: number): RampStep {
  const index = RAMP_STEPS.indexOf(step);
  const next = Math.min(RAMP_STEPS.length - 1, Math.max(0, index + delta));
  return RAMP_STEPS[next];
}

function darkerStep(ramp: ColorRamp, step: RampStep, delta: number): RampStep {
  const towardDark = oklchLightness(ramp[shift(step, delta)]) < oklchLightness(ramp[step]) - 0.004;
  return towardDark ? shift(step, delta) : shift(step, -delta);
}

function shippedRamp(name: "blue" | "violet" | "teal"): ColorRamp {
  const source = tokens.primitive.color[name] as Record<string, string>;
  const ramp = {} as ColorRamp;
  for (const step of RAMP_STEPS) {
    if (step === "950") continue;
    ramp[step] = normalizeHex(source[step]) ?? source[step];
  }
  const last = hexToOklch(ramp["900"]);
  let shade = oklchToHex(Math.max(0, last.l - 0.06), last.c * 0.8, last.h);
  if (oklchLightness(shade) >= oklchLightness(ramp["900"]) - 0.008) shade = "#000000";
  ramp["950"] = shade;
  return ramp;
}

const KIT_BRAND_HEX = normalizeHex((tokens.primitive.color as unknown as Record<string, Record<string, string>>).brand["500"]) ?? "#2b2bf5";

/** Electric Blue: the kit's brand steps, blue for the washes, generated steps only where the kit has none. */
function nisthaBrandRamp(): ColorRamp {
  const color = tokens.primitive.color as unknown as Record<string, Record<string, string>>;
  const ramp = generateColorRamp(KIT_BRAND_HEX);
  for (const step of ["300", "500", "600", "700"] as const) ramp[step] = normalizeHex(color.brand[step]) ?? ramp[step];
  for (const step of ["50", "100", "200", "800", "900"] as const) ramp[step] = normalizeHex(color.blue[step]) ?? ramp[step];
  return ramp;
}

function brandRampFor(brand: string): ColorRamp {
  const hex = hexOf(brand, "#000000");
  if (hex === KIT_BRAND_HEX) return nisthaBrandRamp();
  for (const name of ["blue", "violet", "teal"] as const) {
    const shipped = tokens.primitive.color[name] as Record<string, string>;
    if (normalizeHex(shipped["500"]) === hex) return shippedRamp(name);
  }
  return generateColorRamp(hex);
}

function neutralRampFor(choice: NeutralChoice, brand: string): ColorRamp {
  if (choice === "tint") {
    const base = NEUTRAL_RAMPS.neutral;
    const ramp = {} as ColorRamp;
    for (const step of RAMP_STEPS) ramp[step] = tintToward(base[step], hexOf(brand, "#000000"));
    return ramp;
  }
  return { ...NEUTRAL_RAMPS[choice] };
}

export interface ThemePalette {
  brand: ColorRamp;
  accent: ColorRamp | null;
  neutral: ColorRamp;
}

export function themePalette(state: ThemeState): ThemePalette {
  const accent = state.accent ? generateColorRamp(hexOf(state.accent, "#0d9488")) : null;
  return {
    brand: brandRampFor(state.brand),
    accent,
    neutral: neutralRampFor(state.neutral, state.brand),
  };
}

function ref(name: "brand" | "accent" | "neutral", step: RampStep): string {
  return `var(--color-${name}-${step})`;
}

function onPrimary(ramp: ColorRamp, step: RampStep, neutral: ColorRamp): string {
  const bg = ramp[step];
  const white = contrastRatio("#ffffff", bg);
  const ink = contrastRatio(neutral["950"], bg);
  return white >= ink ? "var(--color-white)" : ref("neutral", "950");
}

function readable(ramp: ColorRamp, step: RampStep, against: string, direction: 1 | -1): RampStep {
  let current = step;
  for (let hop = 0; hop < RAMP_STEPS.length; hop += 1) {
    if (contrastRatio(ramp[current], against) >= 4.5) return current;
    const next = shift(current, direction);
    if (next === current) break;
    current = next;
  }
  return current;
}

interface RoleSet {
  css: Record<string, string>;
  token: Record<string, Record<string, string>>;
}

function brandRoles(palette: ThemePalette, step: RampStep, mode: ThemeMode): RoleSet {
  const { brand, neutral } = palette;
  const action = mode === "light" ? step : shift(step, -2);
  const hover = mode === "light" ? darkerStep(brand, action, 1) : shift(action, -1);
  const pressed = mode === "light" ? darkerStep(brand, action, 2) : shift(action, -2);
  const focus = mode === "light" ? shift(action, -1) : action;
  const surface = mode === "light" ? "#ffffff" : neutral["900"];
  const text = readable(brand, action, surface, mode === "light" ? 1 : -1);
  const subtle = mode === "light" ? "50" : "900";
  const subtleStrong = mode === "light" ? "100" : "800";
  const subtleStronger = mode === "light" ? "200" : "700";
  const link = readable(brand, text, surface, mode === "light" ? 1 : -1);
  const on = onPrimary(brand, action, neutral);

  const css: Record<string, string> = {
    "--primary-base": ref("brand", action),
    "--primary-hover": ref("brand", hover),
    "--primary-active": ref("brand", pressed),
    "--primary-fg": ref("brand", text),
    "--primary-subtle": ref("brand", subtle),
    "--primary-subtle-strong": ref("brand", subtleStrong),
    "--primary-subtle-stronger": ref("brand", subtleStronger),
    "--action-primary": ref("brand", action),
    "--action-primary-hover": ref("brand", hover),
    "--action-primary-pressed": ref("brand", pressed),
    "--action-on-primary": on,
    "--action-selected": ref("brand", subtle),
    "--action-selected-border": ref("brand", action),
    "--brand-primary": ref("brand", action),
    "--brand-primary-hover": ref("brand", hover),
    "--brand-primary-active": ref("brand", pressed),
    "--brand-subtle": ref("brand", subtle),
    "--brand-on-brand": on,
    "--focus-ring": ref("brand", focus),
    "--line-focus": ref("brand", focus),
    "--border-focus": ref("brand", focus),
    "--text-brand": ref("brand", text),
    "--icon-brand": ref("brand", action),
    "--fill-brand": ref("brand", action),
    "--fill-brand-subtle": ref("brand", subtle),
    "--surface-brand": ref("brand", action),
    "--surface-brand-subtle": ref("brand", subtle),
    "--border-brand": ref("brand", action),
    "--link-default": ref("brand", link),
    "--link-hover": ref("brand", mode === "light" ? shift(link, 1) : shift(link, -1)),
    "--link-visited": ref("brand", link),
    "--link-active": ref("brand", pressed),
  };

  const pointer = (roleStep: RampStep) => `primitive.color.brand.${roleStep}`;
  const token = {
    primary: {
      base: pointer(action),
      hover: pointer(hover),
      active: pointer(pressed),
      fg: pointer(text),
      subtle: pointer(subtle),
      subtleStrong: pointer(subtleStrong),
      subtleStronger: pointer(subtleStronger),
    },
    action: {
      primary: pointer(action),
      primaryHover: pointer(hover),
      primaryPressed: pointer(pressed),
      onPrimary: on === "var(--color-white)" ? "primitive.color.white" : "primitive.color.neutral.950",
      selected: pointer(subtle),
      selectedBorder: pointer(action),
    },
    brand: {
      primary: pointer(action),
      primaryHover: pointer(hover),
      primaryActive: pointer(pressed),
      subtle: pointer(subtle),
      onBrand: on === "var(--color-white)" ? "primitive.color.white" : "primitive.color.neutral.950",
    },
    focus: {
      ring: pointer(focus),
    },
    text: { brand: pointer(text) },
    icon: { brand: pointer(action) },
    fill: { brand: pointer(action), brandSubtle: pointer(subtle) },
    surface: { brand: pointer(action), brandSubtle: pointer(subtle) },
    border: { focus: pointer(focus), brand: pointer(action) },
    link: {
      default: pointer(link),
      hover: pointer(mode === "light" ? shift(link, 1) : shift(link, -1)),
      visited: pointer(link),
      active: pointer(pressed),
    },
  };
  return { css, token };
}

const LIGHT_NEUTRAL: Record<string, RampStep | "white"> = {
  "--bg-canvas": "100",
  "--bg-subtle": "50",
  "--bg-tray": "200",
  "--bg-surface": "white",
  "--bg-raised": "white",
  "--bg-floating": "white",
  "--bg-field": "white",
  "--bg-control": "white",
  "--bg-control-hover": "50",
  "--bg-track": "200",
  "--bg-track-strong": "300",
  "--bg-inverse": "950",
  "--bg-inverse-hover": "800",
  "--text-fg": "950",
  "--text-fg-muted": "600",
  "--text-fg-subtle": "400",
  "--text-fg-disabled": "300",
  "--text-fg-inverse": "white",
  "--line-default": "200",
  "--line-strong": "300",
  "--line-inverse": "white",
};

const DARK_NEUTRAL: Record<string, RampStep | "white"> = {
  "--bg-canvas": "950",
  "--bg-subtle": "900",
  "--bg-tray": "800",
  "--bg-surface": "900",
  "--bg-raised": "800",
  "--bg-floating": "800",
  "--bg-field": "900",
  "--bg-control": "900",
  "--bg-control-hover": "800",
  "--bg-track": "800",
  "--bg-track-strong": "700",
  "--bg-inverse": "100",
  "--bg-inverse-hover": "200",
  "--text-fg": "50",
  "--text-fg-muted": "400",
  "--text-fg-subtle": "500",
  "--text-fg-disabled": "600",
  "--text-fg-inverse": "950",
  "--line-default": "800",
  "--line-strong": "700",
  "--line-inverse": "950",
};

function neutralValue(slot: RampStep | "white"): string {
  return slot === "white" ? "var(--color-white)" : ref("neutral", slot);
}

function neutralToken(slot: RampStep | "white"): string {
  return slot === "white" ? "primitive.color.white" : `primitive.color.neutral.${slot}`;
}

const DENSITY_SPACE: Record<Exclude<Density, "default">, Record<string, string>> = {
  compact: {
    "--space-inset-sm": "var(--space-1)",
    "--space-inset-md": "var(--space-2)",
    "--space-inset-lg": "var(--space-3)",
    "--space-stack-sm": "var(--space-1)",
    "--space-stack-md": "var(--space-3)",
    "--space-stack-lg": "var(--space-4)",
    "--space-gap-sm": "var(--space-2)",
    "--space-gap-md": "var(--space-3)",
    "--space-gap-lg": "var(--space-4)",
    "--space-section-sm": "var(--space-6)",
    "--space-section-md": "var(--space-8)",
    "--space-section-lg": "var(--space-12)",
  },
  comfy: {
    "--space-inset-sm": "var(--space-3)",
    "--space-inset-md": "var(--space-4)",
    "--space-inset-lg": "var(--space-6)",
    "--space-stack-md": "var(--space-6)",
    "--space-stack-lg": "var(--space-8)",
    "--space-gap-md": "var(--space-6)",
    "--space-gap-lg": "var(--space-8)",
    "--space-section-sm": "var(--space-10)",
    "--space-section-md": "var(--space-16)",
    "--space-section-lg": "var(--space-16)",
  },
};

const DENSITY_TOKEN: Record<Exclude<Density, "default">, Record<string, Record<string, string>>> = {
  compact: {
    inset: { sm: "primitive.space.1", md: "primitive.space.2", lg: "primitive.space.3" },
    stack: { sm: "primitive.space.1", md: "primitive.space.3", lg: "primitive.space.4" },
    gap: { sm: "primitive.space.2", md: "primitive.space.3", lg: "primitive.space.4" },
    section: { sm: "primitive.space.6", md: "primitive.space.8", lg: "primitive.space.12" },
  },
  comfy: {
    inset: { sm: "primitive.space.3", md: "primitive.space.4", lg: "primitive.space.6" },
    stack: { md: "primitive.space.6", lg: "primitive.space.8" },
    gap: { md: "primitive.space.6", lg: "primitive.space.8" },
    section: { sm: "primitive.space.10", md: "primitive.space.16", lg: "primitive.space.16" },
  },
};

export function clampRadius(value: number): number {
  if (!Number.isFinite(value)) return 8;
  return Math.min(48, Math.max(0, Math.round(value / 2) * 2));
}

export function radiusReadout(basePx: number, pill: boolean) {
  const base = clampRadius(basePx);
  const px = (part: number) => Math.round((base * part) / 8);
  return { xs: px(3), sm: px(5), md: px(6), lg: base, xl: px(10), card: px(10), pill };
}

function radiusVars(basePx: number, pill: boolean): Record<string, string> {
  const base = clampRadius(basePx);
  const px = (part: number) => `${Math.round((base * part) / 8)}px`;
  const lg = `${base}px`;
  const control = pill ? "9999px" : null;
  return {
    "--radius-base": lg,
    "--radius-xs": px(3),
    "--radius-sm": px(5),
    "--radius-md": px(6),
    "--radius-lg": lg,
    "--radius-xl": px(10),
    "--radius-2xl": px(13),
    "--radius-3xl": px(19),
    "--radius-control-sm": control ?? px(3),
    "--radius-control-md": control ?? px(6),
    "--radius-control-lg": control ?? lg,
    "--radius-pill": "9999px",
    "--radius-surface-sm": lg,
    "--radius-surface-md": px(10),
    "--radius-surface-lg": px(13),
    "--radius-media-sm": px(6),
    "--radius-media-md": lg,
    "--radius-media-lg": px(10),
    "--radius-50": px(3),
    "--radius-100": px(5),
    "--radius-200": lg,
    "--radius-300": px(10),
    "--radius-400": px(13),
    "--radius-500": px(19),
    "--radius-600": px(19),
  };
}

/** Semantic radii and shadows are calc()/var() on :root, so a child --radius-base does not move them. Restate them on the scope. */
const SHADOW_ALIASES: Record<string, string> = {
  "--shadow-100": "var(--shadow-xs)",
  "--shadow-150": "var(--shadow-xs)",
  "--shadow-200": "var(--shadow-sm)",
  "--shadow-250": "var(--shadow-sm)",
  "--shadow-300": "var(--shadow-md)",
  "--shadow-400": "var(--shadow-md)",
  "--shadow-500": "var(--shadow-lg)",
  "--shadow-600": "var(--shadow-lg)",
  "--shadow-raised-xs": "var(--shadow-xs)",
  "--shadow-raised-sm": "var(--shadow-sm)",
  "--shadow-raised-md": "var(--shadow-md)",
  "--shadow-raised-lg": "var(--shadow-lg)",
  "--shadow-raised-soft": "var(--shadow-sm)",
  "--shadow-raised-depth": "var(--shadow-sm)",
  "--shadow-overlay-sm": "var(--shadow-md)",
  "--shadow-overlay-md": "var(--shadow-md)",
  "--shadow-overlay-lg": "var(--shadow-lg)",
  "--shadow-modal": "var(--shadow-lg)",
};

function spaceRoleVars(): Record<string, string> {
  const space = tokens.semantic.space as Record<string, Record<string, string>>;
  const vars: Record<string, string> = {};
  for (const [family, steps] of Object.entries(space)) {
    for (const [step, ref] of Object.entries(steps)) {
      const key = String(ref).replace("primitive.space.", "");
      vars[`--space-${family}-${step}`] = `var(--space-${key})`;
    }
  }
  return vars;
}

function spacePrimitives(density: Density): Record<string, string> {
  if (density === "default") return {};
  const factor = density === "compact" ? 0.75 : 1.25;
  return Object.fromEntries(
    Object.entries(SPACE_PX).map(([name, px]) => [name, `${Math.round(px * factor)}px`]),
  );
}

function consumedAliases(decls: Record<string, string>): Record<string, string> {
  return {
    "--primary": decls["--primary-base"],
    "--text-primary": decls["--text-fg"],
    "--text-secondary": decls["--text-fg-muted"],
    "--text-muted": decls["--text-fg-subtle"],
    "--text-disabled": decls["--text-fg-disabled"],
    "--text-inverse": decls["--text-fg-inverse"],
    "--surface-page": decls["--bg-canvas"],
    "--surface-card": decls["--bg-surface"],
    "--surface-muted": decls["--bg-subtle"],
    "--surface-elevated": decls["--bg-raised"],
    "--surface-inverse": decls["--bg-inverse"],
    "--border-faint": decls["--line-default"],
    "--border-strong": decls["--line-strong"],
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function shadowRgb(state: ThemeState, mode: ThemeMode): string {
  if (state.shadowTint !== "primary") return "0 0 0";
  const step = mode === "dark" ? shift(state.step, -2) : state.step;
  const [r, g, b] = hexToRgb(themePalette(state).brand[step]);
  return `${r} ${g} ${b}`;
}

export function shadowMap(state: ThemeState, mode: ThemeMode): Record<"xs" | "sm" | "md" | "lg", string> {
  const specs = SHADOW_SPEC[mode];
  const rgb = shadowRgb(state, mode);
  const alphaFactor = SHADOW_PRESET_ALPHA[state.shadowPreset] * (state.shadowIntensity / 100);
  const scale = state.shadowScale / 100;
  const layer = (spec: ShadowSpec) => {
    if (alphaFactor <= 0) return "none";
    const y = Number((spec.y * scale).toFixed(2));
    const blur = Number((spec.blur * scale).toFixed(2));
    const alpha = Math.min(0.9, Number((spec.alpha * alphaFactor).toFixed(3)));
    return `0 ${y}px ${blur}px 0px rgb(${rgb} / ${alpha})`;
  };
  return { xs: layer(specs.xs), sm: layer(specs.sm), md: layer(specs.md), lg: layer(specs.lg) };
}

function shadowVars(state: ThemeState, mode: ThemeMode): Record<string, string> {
  const layers = shadowMap(state, mode);
  return {
    "--shadow-xs": layers.xs,
    "--shadow-sm": layers.sm,
    "--shadow-md": layers.md,
    "--shadow-lg": layers.lg,
  };
}

function fontVars(state: ThemeState, which: "preview" | "export"): Record<string, string> {
  const sans = SANS_FONTS.find((item) => item.id === state.font) ?? SANS_FONTS[0];
  const display = DISPLAY_FONTS.find((item) => item.id === state.display) ?? DISPLAY_FONTS[0];
  const sansStack = which === "preview" ? sans.preview : sans.exported;
  const displayStack = which === "preview" ? display.preview : display.exported;
  return {
    "--font-sans": sansStack,
    "--font-display": displayStack,
    "--font-body": "var(--font-sans)",
    "--font-heading": "var(--font-display)",
    "--type-family-body": "var(--font-body)",
    "--type-family-heading": "var(--font-heading)",
    "--type-weight-heading": state.headingWeight,
  };
}

function primitiveVars(palette: ThemePalette): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const step of RAMP_STEPS) {
    vars[`--color-brand-${step}`] = palette.brand[step];
    vars[`--color-neutral-${step}`] = palette.neutral[step];
    if (palette.accent) vars[`--color-accent-${step}`] = palette.accent[step];
  }
  return vars;
}

function accentRoles(palette: ThemePalette, mode: ThemeMode): Record<string, string> {
  if (!palette.accent) return {};
  const base: RampStep = mode === "light" ? "600" : "400";
  const text: RampStep = mode === "light" ? "800" : "200";
  const subtle: RampStep = mode === "light" ? "50" : "900";
  const line: RampStep = mode === "light" ? "200" : "700";
  return {
    "--highlight-base": ref("accent", base),
    "--highlight-fg": ref("accent", text),
    "--highlight-subtle": ref("accent", subtle),
    "--highlight-line": ref("accent", line),
    "--fill-accent": ref("accent", base),
  };
}

function kebabKey(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function kitValue(value: string): string {
  const match = value.match(/^primitive\.color\.([a-z]+)(?:\.(\d+))?$/i);
  if (!match) return value;
  return match[2] ? `var(--color-${match[1]}-${match[2]})` : `var(--color-${kebabKey(match[1])})`;
}

/**
 * The kit's status colours (danger, caution, success, highlight) for this mode, plus the aliases
 * that point at them (status, text, icon, fill). Aliases such as --text-success: var(--success-fg)
 * are resolved where they are declared, so without re-declaring them here a light preview inside a
 * dark page inherited the page's dark values (a pale green delta on a white card, 1.21:1).
 */
function statusRoles(mode: ThemeMode): Record<string, string> {
  const theme = (tokens.semantic as unknown as Record<string, Record<string, Record<string, string>>>)[mode];
  const out: Record<string, string> = {};
  for (const family of ["danger", "caution", "success", "highlight"] as const) {
    for (const [key, value] of Object.entries(theme[family] ?? {})) out[`--${family}-${kebabKey(key)}`] = kitValue(value);
  }
  for (const family of ["status", "text", "icon", "fill"] as const) {
    for (const [key, value] of Object.entries(theme[family] ?? {})) {
      if (/var\(--(danger|caution|success|highlight)-/.test(value)) out[`--${family}-${kebabKey(key)}`] = value;
    }
  }
  return out;
}

/** True when brand and neutrals are the kit default (Electric Blue on Slate). */
export function usesKitColors(state: ThemeState): boolean {
  return normalizeHex(state.brand) === KIT_BRAND_HEX && state.neutral === "slate";
}

/** The kit's own surface, text, line, primary, and info roles, so the Nistha preview matches tokens.css exactly. */
function kitColorRoles(mode: ThemeMode): Record<string, string> {
  const theme = (tokens.semantic as unknown as Record<string, Record<string, Record<string, string>>>)[mode];
  const out: Record<string, string> = {};
  for (const family of ["bg", "line", "primary", "info"] as const) {
    for (const [key, value] of Object.entries(theme[family])) out[`--${family}-${kebabKey(key)}`] = kitValue(value);
  }
  for (const key of ["fg", "fgMuted", "fgSubtle", "fgDisabled", "fgInverse"]) out[`--text-${kebabKey(key)}`] = kitValue(theme.text[key]);
  const p = (name: string) => out[`--primary-${name}`];
  return {
    ...out,
    "--action-primary": p("base"),
    "--action-primary-hover": p("hover"),
    "--action-primary-pressed": p("active"),
    "--action-selected": p("subtle"),
    "--action-selected-border": p("base"),
    "--brand-primary": p("base"),
    "--brand-primary-hover": p("hover"),
    "--brand-primary-active": p("active"),
    "--brand-subtle": p("subtle"),
    "--focus-ring": out["--line-focus"],
    "--border-focus": out["--line-focus"],
    "--text-brand": p("base"),
    "--icon-brand": p("base"),
    "--fill-brand": p("base"),
    "--fill-brand-subtle": p("subtle"),
    "--surface-brand": p("base"),
    "--surface-brand-subtle": p("subtle"),
    "--border-brand": p("base"),
    "--link-default": p("base"),
    "--link-hover": p("hover"),
    "--link-visited": p("base"),
    "--link-active": p("active"),
  };
}

/** Other presets keep the pre-Nistha info blue so only the brand they chose changes. */
const LEGACY_INFO: Record<ThemeMode, Record<string, string>> = {
  light: { "--info-fg": "var(--color-blue-800)", "--info-base": "var(--color-blue-600)", "--info-line": "var(--color-blue-200)", "--info-subtle": "var(--color-blue-50)" },
  dark: { "--info-fg": "var(--color-blue-200)", "--info-base": "var(--color-blue-400)", "--info-line": "var(--color-blue-700)", "--info-subtle": "var(--color-blue-900)" },
};

export function themeDeclarations(state: ThemeState, mode: ThemeMode, which: "preview" | "export"): Record<string, string> {
  const palette = themePalette({ ...state, mode });
  const neutralMap = mode === "light" ? LIGHT_NEUTRAL : DARK_NEUTRAL;
  const neutral: Record<string, string> = {};
  for (const [name, slot] of Object.entries(neutralMap)) neutral[name] = neutralValue(slot);
  const brand = brandRoles(palette, state.step, mode).css;
  const shared = {
    ...primitiveVars(palette),
    ...fontVars(state, which),
    ...radiusVars(state.radius, state.pill),
    ...spacePrimitives(state.density),
    ...spaceRoleVars(),
    ...(state.density === "default" ? {} : DENSITY_SPACE[state.density]),
  };
  const themed = {
    ...shared,
    ...neutral,
    ...brand,
    ...(which === "preview" ? statusRoles(mode) : {}),
    ...(usesKitColors(state) ? kitColorRoles(mode) : LEGACY_INFO[mode]),
    ...accentRoles(palette, mode),
    ...shadowVars(state, mode),
    ...SHADOW_ALIASES,
  };
  return { ...themed, ...consumedAliases(themed) };
}

function block(selector: string, declarations: Record<string, string>): string {
  const body = Object.entries(declarations)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

/** Live preview CSS. Selectors match the wrapper and any portal that copies data-theme-scope. */
export function scopeCss(state: ThemeState, scopeId: string): string {
  const scope = `[data-theme-scope="${scopeId}"]`;
  const light = themeDeclarations(state, "light", "preview");
  const darkOnly = diffDeclarations(themeDeclarations(state, "dark", "preview"), light);
  const accentRule = state.accent
    ? `\n\n${scope} [data-accent-series] {\n  --fill-success: var(--fill-accent);\n}`
    : "";
  return `${block(scope, { "color-scheme": "light", ...light })}\n\n${block(`${scope}[data-theme="dark"]`, { "color-scheme": "dark", ...darkOnly })}${accentRule}\n`;
}

export function scopeCssLeaksToPage(css: string): boolean {
  return /(^|\n)\s*(:root|html|body)\b/.test(css);
}

function diffDeclarations(next: Record<string, string>, base: Record<string, string>): Record<string, string> {
  const changed: Record<string, string> = {};
  for (const [name, value] of Object.entries(next)) {
    if (base[name] !== value) changed[name] = value;
  }
  return changed;
}

export function exportCss(state: ThemeState): string {
  const light = themeDeclarations(state, "light", "export");
  const dark = diffDeclarations(themeDeclarations(state, "dark", "export"), light);
  const named = state.preset !== "custom";
  const lightSelector = named ? `[data-color="${state.preset}"]` : ":root";
  const darkSelector = named ? `[data-theme="dark"][data-color="${state.preset}"]` : '[data-theme="dark"]';
  const note = named
    ? `/* ${labelFor(state)} overlay. Load after tokens.css. Omit data-color for the default Nistha look. */\n`
    : "/* Custom theme. Load after tokens.css. Light lives on :root; dark on [data-theme=\"dark\"]. */\n";
  return `${note}${block(lightSelector, light)}\n\n${block(darkSelector, dark)}\n`;
}

function labelFor(state: ThemeState): string {
  if (state.preset === "custom") return "Custom";
  return PRESETS.find((item) => item.id === state.preset)?.label ?? "Custom";
}

export function exportTokens(state: ThemeState): string {
  const palette = themePalette(state);
  const light = brandRoles(palette, state.step, "light").token;
  const dark = brandRoles(palette, state.step, "dark").token;
  const neutral = (mode: ThemeMode) => {
    const map = mode === "light" ? LIGHT_NEUTRAL : DARK_NEUTRAL;
    const bg: Record<string, string> = {};
    const text: Record<string, string> = {};
    const line: Record<string, string> = {};
    for (const [name, slot] of Object.entries(map)) {
      const token = neutralToken(slot);
      if (name.startsWith("--bg-")) bg[name.slice(5).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = token;
      if (name.startsWith("--text-")) text[name.slice(7).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = token;
      if (name.startsWith("--line-")) line[name.slice(7)] = token;
    }
    return { bg, text, line };
  };
  const sans = SANS_FONTS.find((item) => item.id === state.font) ?? SANS_FONTS[0];
  const display = DISPLAY_FONTS.find((item) => item.id === state.display) ?? DISPLAY_FONTS[0];
  const name = state.preset === "custom" ? "custom" : state.preset;
  const fragment = {
    primitive: {
      color: {
        brand: palette.brand,
        ...(palette.accent ? { accent: palette.accent } : {}),
        neutral: palette.neutral,
      },
      radius: { base: `${clampRadius(state.radius)}px`, pill: state.pill ? "9999px" : "scale" },
      shadow: shadowMap(state, "light"),
      shadowDark: shadowMap(state, "dark"),
    },
    semantic: {
      colorThemes: {
        [name]: {
          light: { ...light, ...neutral("light") },
          dark: { ...dark, ...neutral("dark") },
        },
      },
      type: {
        family: {
          sans: sans.exported,
          display: display.exported,
          mono: '"IBM Plex Mono", ui-monospace, monospace',
          body: "var(--font-sans)",
          heading: "var(--font-display)",
        },
        weight: { heading: state.headingWeight },
      },
      ...(state.density === "default" ? {} : { space: DENSITY_TOKEN[state.density] }),
    },
  };
  return `${JSON.stringify(fragment, null, 2)}\n`;
}

export function exportDesign(state: ThemeState): string {
  const palette = themePalette(state);
  const sans = SANS_FONTS.find((item) => item.id === state.font)?.label ?? "IBM Plex Sans";
  const display = DISPLAY_FONTS.find((item) => item.id === state.display)?.label ?? "IBM Plex Sans";
  const neutralLabel = state.neutral === "tint" ? "Neutral, tinted toward the brand" : state.neutral[0].toUpperCase() + state.neutral.slice(1);
  const densityCopy = {
    compact: "Compact. Inset, stack, gap, and section roles point at smaller primitive steps.",
    default: "Default. Semantic spacing stays on the kit's primitive steps.",
    comfy: "Comfy. Inset, stack, gap, and section roles point at larger primitive steps.",
  }[state.density];
  const shadowLabel = SHADOW_PRESETS.find((item) => item.id === state.shadowPreset)?.label ?? "Default";
  const readout = radiusReadout(state.radius, state.pill);
  const lightShadow = shadowMap(state, "light");
  const darkStep = shift(state.step, -2);
  const failures = contrastReport(state).filter((pair) => !pair.pass);
  const contrastLine = failures.length
    ? `Pairs under AA in ${state.mode} mode: ${failures.map((pair) => pair.name).join(", ")}.`
    : `Checked text and UI pairs pass WCAG AA in ${state.mode} mode.`;
  return `# ${labelFor(state)}

Theme for Nistha. Reassign semantic roles to primitive ramps. Do not put hex in components and do not rewrite component classes.

## Palette

- Brand step 500 is ${palette.brand["500"]}. Light actions and focus use step ${state.step}. Dark actions use step ${darkStep}.
- Neutral scale: ${neutralLabel}.
- Second brand: ${state.accent ? `${palette.accent?.["500"]} (accent and highlight roles)` : "none"}.
- ${contrastLine}

## Type

- Default: ${sans}.
- Display: ${display}.
- Heading weight: ${state.headingWeight}.
- Mono stays IBM Plex Mono.
- Load the Google font before the override if it is not already on the page.

## Radius

\`--radius-base: ${readout.lg}px\`. Derived: xs ${readout.xs}, sm ${readout.sm}, md ${readout.md}, lg ${readout.lg}, xl ${readout.xl}, card ${readout.card}. ${state.pill ? "Buttons and inputs use pill radius (9999px). Surfaces stay on the scale." : "Buttons and inputs follow the control radii."}

## Spacing

${densityCopy}

## Shadows

Preset ${shadowLabel}. Intensity ${state.shadowIntensity}. Blur and spread scale ${state.shadowScale}. Tint ${state.shadowTint}. \`--shadow-xs\` is \`${lightShadow.xs}\`. Raised, overlay, and modal aliases follow \`--shadow-xs\` through \`--shadow-lg\`. None and Flat set every shadow to none.

## Usage

- Load \`tokens.css\`, then this override.
- Light is \`:root\`${state.preset === "custom" ? "" : `, or \`[data-color="${state.preset}"]\``}. Dark is \`[data-theme="dark"]\` on \`html\`.
- One solid primary button per view. It uses \`--action-primary\`.
- Body text uses \`--text-primary\` on \`--surface-page\` or \`--surface-card\`.
- Keep status colours (success, warning, danger, info) on the kit ramps unless a role is explicitly overridden.
`;
}

export interface ContrastPair {
  name: string;
  ratio: number;
  minimum: number;
  pass: boolean;
}

function resolveColor(value: string, palette: ThemePalette): string {
  const brand = value.match(/^var\(--color-brand-(\d+)\)$/);
  if (brand) return palette.brand[brand[1] as RampStep];
  const neutral = value.match(/^var\(--color-neutral-(\d+)\)$/);
  if (neutral) return palette.neutral[neutral[1] as RampStep];
  const accent = value.match(/^var\(--color-accent-(\d+)\)$/);
  if (accent && palette.accent) return palette.accent[accent[1] as RampStep];
  if (value === "var(--color-white)") return "#ffffff";
  const kit = value.match(/^var\(--color-([a-z]+)-(\d+)\)$/);
  if (kit) {
    const ramp = (tokens.primitive.color as Record<string, unknown>)[kit[1]];
    const hex = ramp && typeof ramp === "object" ? (ramp as Record<string, string>)[kit[2]] : undefined;
    if (hex) return normalizeHex(hex) ?? hex;
  }
  if (value.startsWith("#")) return value;
  return "#000000";
}

export function contrastReport(state: ThemeState): ContrastPair[] {
  const palette = themePalette(state);
  const decls = themeDeclarations(state, state.mode, "export");
  const color = (name: string) => resolveColor(decls[name] ?? "#000000", palette);
  const pairs: { name: string; fg: string; bg: string; minimum: number }[] = [
    { name: "Body on canvas", fg: "--text-fg", bg: "--bg-canvas", minimum: 4.5 },
    { name: "Body on surface", fg: "--text-fg", bg: "--bg-surface", minimum: 4.5 },
    { name: "Muted on surface", fg: "--text-fg-muted", bg: "--bg-surface", minimum: 4.5 },
    { name: "Subtle on surface", fg: "--text-fg-subtle", bg: "--bg-surface", minimum: 4.5 },
    { name: "Brand text on surface", fg: "--text-brand", bg: "--bg-surface", minimum: 4.5 },
    { name: "Button label", fg: "--action-on-primary", bg: "--action-primary", minimum: 4.5 },
    { name: "Button on canvas", fg: "--action-primary", bg: "--bg-canvas", minimum: 3 },
  ];
  return pairs.map((pair) => {
    const ratio = contrastRatio(color(pair.fg), color(pair.bg));
    return {
      name: pair.name,
      ratio,
      minimum: pair.minimum,
      pass: ratio >= pair.minimum,
    };
  });
}

function isPresetId(value: string | null): value is Exclude<PresetId, "custom"> {
  return PRESETS.some((item) => item.id === value);
}

function isStep(value: string | null): value is RampStep {
  return RAMP_STEPS.some((step) => step === value);
}

function isNeutral(value: string | null): value is NeutralChoice {
  return NEUTRAL_OPTIONS.some((item) => item === value);
}

function isDensity(value: string | null): value is Density {
  return DENSITIES.some((item) => item === value);
}

function isSans(value: string | null): value is SansFont {
  return SANS_FONTS.some((item) => item.id === value);
}

function isDisplay(value: string | null): value is DisplayFont {
  return DISPLAY_FONTS.some((item) => item.id === value);
}

function isMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

const SEARCH_KEYS = ["preset", "brand", "accent", "neutral", "step", "radius", "pill", "density", "shadow", "shade", "blur", "tint", "font", "display", "weight", "mode"] as const;

const LEGACY_SHADOW: Record<string, ShadowPreset> = { "0": "none", "1": "subtle", "2": "default", "3": "raised" };

function clampUnit(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function isShadowPreset(value: string | null): value is ShadowPreset {
  return SHADOW_PRESETS.some((item) => item.id === value);
}

function isTint(value: string | null): value is ShadowTint {
  return value === "neutral" || value === "primary";
}

function isWeight(value: string | null): value is HeadingWeight {
  return value === "400" || value === "500" || value === "600" || value === "700";
}

export function themeFromSearch(params: URLSearchParams, fallbackMode: ThemeMode): ThemeState | null {
  if (!SEARCH_KEYS.some((key) => params.has(key))) return null;
  const preset = params.get("preset");
  const base = isPresetId(preset) ? presetState(preset, fallbackMode) : { ...DEFAULT_THEME, mode: fallbackMode };
  const brand = normalizeHex(params.get("brand") ?? "");
  const accentParam = params.get("accent");
  const radius = Number(params.get("radius"));
  const shadowParam = params.get("shadow");
  const shade = Number(params.get("shade"));
  const blur = Number(params.get("blur"));
  return {
    ...base,
    preset: preset === "custom" || (preset !== null && !isPresetId(preset)) ? "custom" : base.preset,
    brand: brand ?? base.brand,
    accent: accentParam === null ? base.accent : accentParam === "" || accentParam === "none" ? "" : (normalizeHex(accentParam) ?? base.accent),
    neutral: isNeutral(params.get("neutral")) ? (params.get("neutral") as NeutralChoice) : base.neutral,
    step: isStep(params.get("step")) ? (params.get("step") as RampStep) : base.step,
    radius: params.has("radius") ? clampRadius(radius) : base.radius,
    pill: params.has("pill") ? params.get("pill") === "1" || params.get("pill") === "true" : base.pill,
    density: isDensity(params.get("density")) ? (params.get("density") as Density) : base.density,
    shadowPreset: isShadowPreset(shadowParam) ? shadowParam : LEGACY_SHADOW[shadowParam ?? ""] ?? base.shadowPreset,
    shadowIntensity: params.has("shade") ? clampUnit(shade, 0, 200, base.shadowIntensity) : base.shadowIntensity,
    shadowScale: params.has("blur") ? clampUnit(blur, 50, 200, base.shadowScale) : base.shadowScale,
    shadowTint: isTint(params.get("tint")) ? (params.get("tint") as ShadowTint) : base.shadowTint,
    font: isSans(params.get("font")) ? (params.get("font") as SansFont) : base.font,
    display: isDisplay(params.get("display")) ? (params.get("display") as DisplayFont) : base.display,
    headingWeight: isWeight(params.get("weight")) ? (params.get("weight") as HeadingWeight) : base.headingWeight,
    mode: isMode(params.get("mode")) ? (params.get("mode") as ThemeMode) : base.mode,
  };
}

export function themeToSearch(state: ThemeState): string {
  const params = new URLSearchParams();
  params.set("preset", state.preset);
  params.set("brand", state.brand.replace("#", ""));
  params.set("accent", state.accent ? state.accent.replace("#", "") : "none");
  params.set("neutral", state.neutral);
  params.set("step", state.step);
  params.set("radius", String(clampRadius(state.radius)));
  params.set("pill", state.pill ? "1" : "0");
  params.set("density", state.density);
  params.set("shadow", state.shadowPreset);
  params.set("shade", String(state.shadowIntensity));
  params.set("blur", String(state.shadowScale));
  params.set("tint", state.shadowTint);
  params.set("font", state.font);
  params.set("display", state.display);
  params.set("weight", state.headingWeight);
  params.set("mode", state.mode);
  return params.toString();
}

export function readStoredTheme(): ThemeState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    return themeFromSearch(new URLSearchParams(JSON.parse(raw) as Record<string, string>), "light");
  } catch {
    return null;
  }
}

export function writeStoredTheme(state: ThemeState): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(Object.fromEntries(new URLSearchParams(themeToSearch(state)))));
  } catch {
    // Private mode or a full quota. The URL still holds the theme.
  }
}

export function clearStoredTheme(): void {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // Nothing saved, or storage is blocked.
  }
}

export function syncPreset(state: ThemeState): ThemeState {
  const match = PRESETS.find(
    (preset) =>
      normalizeHex(preset.brand) === normalizeHex(state.brand) &&
      (preset.accent ? normalizeHex(preset.accent) === normalizeHex(state.accent) : state.accent === "") &&
      preset.neutral === state.neutral &&
      preset.step === state.step &&
      preset.radius === clampRadius(state.radius) &&
      preset.pill === state.pill &&
      preset.density === state.density &&
      preset.shadowPreset === state.shadowPreset &&
      preset.shadowIntensity === state.shadowIntensity &&
      preset.shadowScale === state.shadowScale &&
      preset.shadowTint === state.shadowTint &&
      preset.font === state.font &&
      preset.display === state.display &&
      preset.headingWeight === state.headingWeight,
  );
  const preset = match?.id ?? "custom";
  return state.preset === preset ? state : { ...state, preset };
}

export function radiusLabel(px: number): string {
  return `${clampRadius(px)}px`;
}
