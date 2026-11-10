import tokens from "agentic-ds-kit/tokens/tokens.json";

type PrimitiveColors = typeof tokens.primitive.color;

export function getPrimitiveHex(hue: string, step?: string): string {
  const colors = tokens.primitive.color as PrimitiveColors;
  const entry = colors[hue as keyof PrimitiveColors];
  if (typeof entry === "string") return entry;
  if (step && entry && typeof entry === "object") {
    return entry[step as keyof typeof entry];
  }
  throw new Error(`Unknown primitive: ${hue}${step ? `.${step}` : ""}`);
}

export function primitiveCssVar(hue: string, step?: string): string {
  return step ? `--color-${hue}-${step}` : `--color-${hue}`;
}

export function primitiveTokenPattern(hue: string, single?: boolean): string {
  return single ? `color-${hue}` : `color-${hue}-*`;
}

export function rgbStringToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  const [, r, g, b] = match;
  return (
    "#" +
    [r, g, b]
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** WCAG relative luminance — pick light or dark label text on a solid hex swatch. */
export function labelToneOnHex(hex: string): "light" | "dark" {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };

  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  // Pick whichever label colour reads better: white (L = 1) or the slate-900 ink the chip uses
  // (L ≈ 0.0089). A fixed luminance cut-off put white on mid-tone 400/500 swatches at ~2.5:1.
  const INK_LUMINANCE = 0.0089;
  const onWhite = 1.05 / (luminance + 0.05);
  const onInk = (luminance + 0.05) / (INK_LUMINANCE + 0.05);
  return onInk >= onWhite ? "dark" : "light";
}
