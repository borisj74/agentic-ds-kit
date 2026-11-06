import { applyPrimaryRamp, clearPrimaryRamp, normalizeHex } from "./primary-ramp";

export const PLAYGROUND_THEME_STORAGE_KEY = "playground-theme";
export const PLAYGROUND_COLOR_STORAGE_KEY = "playground-color-theme";
export const PLAYGROUND_FONT_STORAGE_KEY = "playground-font";
export const PLAYGROUND_HEADING_WEIGHT_KEY = "playground-heading-weight";
export const PLAYGROUND_PRIMARY_HEX_KEY = "playground-primary-hex";
export const PLAYGROUND_RADIUS_BASE_KEY = "playground-radius-base";
export const PLAYGROUND_SHADOW_SM_KEY = "playground-shadow-sm";

export type PlaygroundTheme = "light" | "dark";
export type PlaygroundColorTheme = "ink" | "blue" | "violet" | "teal" | "custom";
export type PlaygroundFont = "ibm-plex" | "inter" | "geist" | "system";
export type PlaygroundHeadingWeight = "400" | "500" | "600" | "700";

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

export const DEFAULT_RADIUS_BASE = 8;
export const DEFAULT_SHADOW_SM = "0 1px 2px 0px rgb(0 0 0 / 0.1)";
export const DEFAULT_PRIMARY_HEX = "#000000";

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
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  store(PLAYGROUND_THEME_STORAGE_KEY, theme);
  const hex = readStoredPrimaryHex();
  if (hex) applyPrimaryRamp(hex, theme === "dark");
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

export function readPlaygroundFont(): PlaygroundFont {
  if (typeof document === "undefined") return "ibm-plex";
  const font = document.documentElement.getAttribute("data-font");
  return isFont(font) ? font : "ibm-plex";
}

export function applyPlaygroundFont(font: PlaygroundFont): void {
  const root = document.documentElement;
  if (font === "ibm-plex") {
    root.removeAttribute("data-font");
  } else {
    root.setAttribute("data-font", font);
  }
  store(PLAYGROUND_FONT_STORAGE_KEY, font);
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
    font: readPlaygroundFont(),
    headingWeight: readPlaygroundHeadingWeight(),
    primaryHex: readStoredPrimaryHex(),
    radiusBase: readPlaygroundRadiusBase(),
    shadowSm: readPlaygroundShadowSm(),
  };
}

export const PLAYGROUND_THEME_INIT_SCRIPT = `(function(){try{var root=document.documentElement;var t=localStorage.getItem("${PLAYGROUND_THEME_STORAGE_KEY}");if(t==="dark")root.setAttribute("data-theme","dark");var c=localStorage.getItem("${PLAYGROUND_COLOR_STORAGE_KEY}");if(c==="rust"){c="ink";localStorage.setItem("${PLAYGROUND_COLOR_STORAGE_KEY}","ink");}if(c==="blue"||c==="violet"||c==="teal"||c==="custom")root.setAttribute("data-color",c);var f=localStorage.getItem("${PLAYGROUND_FONT_STORAGE_KEY}");if(f==="inter"||f==="geist"||f==="system")root.setAttribute("data-font",f);var w=localStorage.getItem("${PLAYGROUND_HEADING_WEIGHT_KEY}");if(w==="400"||w==="500"||w==="700")root.style.setProperty("--type-weight-heading",w);var rb=localStorage.getItem("${PLAYGROUND_RADIUS_BASE_KEY}");if(rb)root.style.setProperty("--radius-base",rb+"px");var sh=localStorage.getItem("${PLAYGROUND_SHADOW_SM_KEY}");if(sh)root.style.setProperty("--shadow-sm",sh);var hex=localStorage.getItem("${PLAYGROUND_PRIMARY_HEX_KEY}");if(c==="custom"&&hex){if(hex.charAt(0)!=="#")hex="#"+hex;if(/^#[0-9a-fA-F]{6}$/.test(hex)){function mix(h,o,a){h=h.slice(1);o=o.slice(1);function p(x,i){return parseInt(x.slice(i,i+2),16)}function t2(n){n=Math.max(0,Math.min(255,Math.round(n)));return n.toString(16).padStart(2,"0")}return"#"+t2(p(h,0)+(p(o,0)-p(h,0))*a)+t2(p(h,2)+(p(o,2)-p(h,2))*a)+t2(p(h,4)+(p(o,4)-p(h,4))*a)}function lum(h){h=h.slice(1);function ch(n){n=n/255;return n<=0.03928?n/12.92:Math.pow((n+0.055)/1.055,2.4)}return 0.2126*ch(parseInt(h.slice(0,2),16))+0.7152*ch(parseInt(h.slice(2,4),16))+0.0722*ch(parseInt(h.slice(4,6),16))}var dark=t==="dark";var base=dark&&lum(hex)<0.4?mix(hex,"#ffffff",0.86):hex;var darkBase=lum(base)<0.45;var hover=darkBase?mix(base,"#ffffff",0.1):mix(base,"#000000",0.08);var active=darkBase?mix(base,"#000000",0.08):mix(base,"#000000",0.14);var wash=dark?"#0a0a0a":"#ffffff";var sa=dark?0.22:0.08;var on=darkBase?"#ffffff":"#0a0a0a";var subtle=mix(base,wash,1-sa);var ss=mix(base,wash,1-(dark?0.32:0.14));var sss=mix(base,wash,1-(dark?0.44:0.22));var pairs=[["--primary-base",base],["--primary-hover",hover],["--primary-active",active],["--primary-subtle",subtle],["--primary-subtle-strong",ss],["--primary-subtle-stronger",sss],["--primary",base],["--action-primary",base],["--action-primary-hover",hover],["--action-primary-pressed",active],["--action-on-primary",on],["--brand-primary",base],["--brand-primary-hover",hover],["--brand-primary-active",active],["--brand-on-brand",on],["--link-default",base],["--link-hover",hover],["--link-active",active],["--focus-ring",base],["--line-focus",base],["--border-focus",base],["--text-brand",base],["--icon-brand",base],["--fill-brand",base]];for(var i=0;i<pairs.length;i++)root.style.setProperty(pairs[i][0],pairs[i][1]);}}}catch(e){}})();`;

export { COLOR_SHORTCUTS };
