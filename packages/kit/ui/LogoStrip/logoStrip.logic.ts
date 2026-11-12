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
