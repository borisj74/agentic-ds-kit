import type { LogoStripLogo } from "./LogoStrip.types";

/** Logos with a usable name, keyed. A logo with neither `src` nor `logo` falls back to its name as text. */
export function stripLogos(logos: LogoStripLogo[]) {
  const seen = new Map<string, number>();
  return logos
    .filter((logo) => logo.name.trim() !== "")
    .map((logo) => {
      const base = logo.id ?? logo.name;
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const kind: "node" | "image" | "text" = logo.logo != null ? "node" : logo.src ? "image" : "text";
      return { ...logo, key: count ? `${base}-${count}` : base, kind };
    });
}

/** The list's spoken name, with the count: "Customer logos, 8". */
export function listLabel(label: string, count: number) {
  return `${label}, ${count}`;
}

/**
 * Deal logos into rows, round-robin, so every row gets a mix. Never more rows than logos, and at
 * least one. Each row keeps its logos in order.
 */
export function stripRows<T>(items: T[], rows: number): T[][] {
  const count = Math.max(1, Math.min(Math.floor(rows) || 1, items.length || 1));
  const out: T[][] = Array.from({ length: count }, () => []);
  items.forEach((item, index) => out[index % count].push(item));
  return out;
}

/** Odd rows run left, even rows run right, so neighbouring rows pass each other. */
export function rowDirection(rowIndex: number): "left" | "right" {
  return rowIndex % 2 === 0 ? "left" : "right";
}

/** A full loop's length in seconds: slower with more logos, so every row moves at about the same pace. */
export function rowDuration(logoCount: number, secondsPerLogo = 4): number {
  return Math.max(20, logoCount * secondsPerLogo);
}
