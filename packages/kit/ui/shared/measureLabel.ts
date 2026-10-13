let context: CanvasRenderingContext2D | null | undefined;
const cache = new Map<string, number>();

function toPx(value: string, rootSize: number): number {
  const size = Number.parseFloat(value);
  if (!Number.isFinite(size)) return 0;
  return value.endsWith("rem") || value.endsWith("em") ? size * rootSize : size;
}

/**
 * Painted width (px) of an axis label in the caption font charts use (`--font-sans` at
 * `--type-size-caption`). Returns undefined outside the browser so callers fall back to an
 * estimate. Widths are cached only once web fonts have loaded.
 */
export function measureLabel(text: string): number | undefined {
  if (typeof document === "undefined") return undefined;
  const cached = cache.get(text);
  if (cached !== undefined) return cached;
  if (context === undefined) {
    context = document.createElement("canvas").getContext("2d");
  }
  if (!context) return undefined;
  const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  // Body, not :root, so font variables set by a class on <body> (e.g. next/font) resolve too.
  const scope = getComputedStyle(document.body ?? document.documentElement);
  const size = toPx(scope.getPropertyValue("--type-size-caption").trim(), rootSize) || 12;
  const family = scope.getPropertyValue("--font-sans").trim() || scope.fontFamily;
  context.font = `${size}px ${family}`;
  const width = context.measureText(text).width;
  if (document.fonts?.status !== "loading") cache.set(text, width);
  return width;
}
