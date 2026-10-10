/** Hue 0 to 360, saturation and brightness (value) 0 to 1, alpha 0 to 1. */
export interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX_BODY = /^[0-9a-f]+$/i;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Parses #RGB, #RGBA, #RRGGBB, #RRGGBBAA (leading # optional). Returns null when invalid. */
export function parseHex(input: string): Rgba | null {
  const body = input.trim().replace(/^#/, "");
  if (!HEX_BODY.test(body) || ![3, 4, 6, 8].includes(body.length)) return null;
  const full = body.length <= 4 ? body.replace(/./g, (c) => c + c) : body;
  const byte = (i: number) => parseInt(full.slice(i, i + 2), 16);
  return {
    r: byte(0),
    g: byte(2),
    b: byte(4),
    a: full.length === 8 ? byte(6) / 255 : 1,
  };
}

function toByteHex(value: number): string {
  return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0").toUpperCase();
}

/** #RRGGBB, or #RRGGBBAA when withAlpha and alpha is below 1. */
export function rgbaToHex({ r, g, b, a }: Rgba, withAlpha = false): string {
  const base = `#${toByteHex(r)}${toByteHex(g)}${toByteHex(b)}`;
  return withAlpha && a < 1 ? `${base}${toByteHex(a * 255)}` : base;
}

export function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  const hue = (((h % 360) + 360) % 360) / 60;
  const chroma = v * s;
  const x = chroma * (1 - Math.abs((hue % 2) - 1));
  const m = v - chroma;
  const [r, g, b] =
    hue < 1
      ? [chroma, x, 0]
      : hue < 2
        ? [x, chroma, 0]
        : hue < 3
          ? [0, chroma, x]
          : hue < 4
            ? [0, x, chroma]
            : hue < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255, a };
}

/** fallbackHue keeps the hue when the colour is grey (saturation or brightness 0). */
export function rgbaToHsva({ r, g, b, a }: Rgba, fallbackHue = 0): Hsva {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = fallbackHue;
  if (delta > 0) {
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else h = 60 * ((rn - gn) / delta + 4);
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max, a };
}

export function hsvaToHex(color: Hsva, withAlpha = false): string {
  return rgbaToHex(hsvaToRgba(color), withAlpha);
}

/** Rough hue name for aria-valuetext. */
export function hueName(h: number): string {
  const hue = ((h % 360) + 360) % 360;
  if (hue < 15) return "red";
  if (hue < 45) return "orange";
  if (hue < 70) return "yellow";
  if (hue < 165) return "green";
  if (hue < 195) return "cyan";
  if (hue < 255) return "blue";
  if (hue < 290) return "purple";
  if (hue < 335) return "pink";
  return "red";
}
