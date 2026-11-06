/** Live primary ramp from a picked hex. Shortcuts (ink/blue/violet/teal) skip this path. */

export interface PrimaryRamp {
  base: string;
  hover: string;
  active: string;
  subtle: string;
  subtleStrong: string;
  subtleStronger: string;
  onPrimary: string;
}

function clamp(n: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function normalizeHex(input: string): string | null {
  const raw = input.trim();
  const match = raw.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  let hex = match[1].toLowerCase();
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  return `#${hex}`;
}

function parseRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  };
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;
}

function luminance(hex: string): number {
  const { r, g, b } = parseRgb(hex);
  const chan = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function mix(hex: string, other: string, amount: number): string {
  const a = parseRgb(hex);
  const b = parseRgb(other);
  return toHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount,
  );
}

/** Dark-theme pair: keep a light primary when the picked hex is dark. */
export function darkPairBase(hex: string): string {
  return luminance(hex) < 0.4 ? mix(hex, "#ffffff", 0.86) : hex;
}

export function generatePrimaryRamp(hex: string, dark: boolean): PrimaryRamp {
  const picked = normalizeHex(hex) ?? "#000000";
  const base = dark ? darkPairBase(picked) : picked;
  const darkBase = luminance(base) < 0.45;
  const hover = darkBase ? mix(base, "#ffffff", 0.1) : mix(base, "#000000", 0.08);
  const active = darkBase ? mix(base, "#000000", 0.08) : mix(base, "#000000", 0.14);
  const wash = dark ? "#0a0a0a" : "#ffffff";
  const subtleAmt = dark ? 0.22 : 0.08;
  return {
    base,
    hover,
    active,
    subtle: mix(base, wash, 1 - subtleAmt),
    subtleStrong: mix(base, wash, 1 - (dark ? 0.32 : 0.14)),
    subtleStronger: mix(base, wash, 1 - (dark ? 0.44 : 0.22)),
    onPrimary: darkBase ? "#ffffff" : "#0a0a0a",
  };
}

export const PRIMARY_STYLE_KEYS = [
  "--primary-base",
  "--primary-hover",
  "--primary-active",
  "--primary-subtle",
  "--primary-subtle-strong",
  "--primary-subtle-stronger",
  "--primary",
  "--action-primary",
  "--action-primary-hover",
  "--action-primary-pressed",
  "--action-on-primary",
  "--brand-primary",
  "--brand-primary-hover",
  "--brand-primary-active",
  "--brand-on-brand",
  "--link-default",
  "--link-hover",
  "--link-active",
  "--focus-ring",
  "--line-focus",
  "--border-focus",
  "--text-brand",
  "--icon-brand",
  "--fill-brand",
] as const;

export function primaryRampToVars(ramp: PrimaryRamp): Record<(typeof PRIMARY_STYLE_KEYS)[number], string> {
  return {
    "--primary-base": ramp.base,
    "--primary-hover": ramp.hover,
    "--primary-active": ramp.active,
    "--primary-subtle": ramp.subtle,
    "--primary-subtle-strong": ramp.subtleStrong,
    "--primary-subtle-stronger": ramp.subtleStronger,
    "--primary": ramp.base,
    "--action-primary": ramp.base,
    "--action-primary-hover": ramp.hover,
    "--action-primary-pressed": ramp.active,
    "--action-on-primary": ramp.onPrimary,
    "--brand-primary": ramp.base,
    "--brand-primary-hover": ramp.hover,
    "--brand-primary-active": ramp.active,
    "--brand-on-brand": ramp.onPrimary,
    "--link-default": ramp.base,
    "--link-hover": ramp.hover,
    "--link-active": ramp.active,
    "--focus-ring": ramp.base,
    "--line-focus": ramp.base,
    "--border-focus": ramp.base,
    "--text-brand": ramp.base,
    "--icon-brand": ramp.base,
    "--fill-brand": ramp.base,
  };
}

export function applyPrimaryRamp(hex: string, dark: boolean): void {
  const vars = primaryRampToVars(generatePrimaryRamp(hex, dark));
  const root = document.documentElement;
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
}

export function clearPrimaryRamp(): void {
  const root = document.documentElement;
  for (const name of PRIMARY_STYLE_KEYS) {
    root.style.removeProperty(name);
  }
}
