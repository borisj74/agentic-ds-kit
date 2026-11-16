"use client";

import type { ReactNode } from "react";
import { presetState } from "@/lib/theme-playground";
import { PreviewFallbackProvider, ThemeScope, useSiteMode } from "../ThemeScope";

/**
 * The landing page keeps Ink's quiet neutral greys but takes the Nistha brand colour, so the logo
 * tile and the main calls to action are brand blue and everything else stays calm. Every
 * PreviewScope inside falls back to the kit's own Nistha look (or the preview theme the reader
 * saved). Light or dark follows the site.
 */
export function HomeTheme({ className, children }: { className?: string; children: ReactNode }) {
  const mode = useSiteMode();
  const brand = presetState("nistha", mode);
  const theme = { ...presetState("ink", mode), brand: brand.brand, step: brand.step };
  return (
    <ThemeScope theme={theme} className={className}>
      <PreviewFallbackProvider value={brand}>{children}</PreviewFallbackProvider>
    </ThemeScope>
  );
}
