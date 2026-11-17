"use client";

import type { ReactNode } from "react";
import { presetState } from "@/lib/theme-playground";
import { PreviewFallbackProvider, ThemeScope, useSiteMode } from "../ThemeScope";

/**
 * The landing page keeps Ink's quiet neutral greys but takes the Nistha brand colour, so the logo
 * tile and the main calls to action are the only brand blue on the page. The product previews run
 * in plain Ink (or the preview theme the reader saved), so their own Approve and Grant buttons
 * never read as calls to action. Light or dark follows the site.
 */
export function HomeTheme({ className, children }: { className?: string; children: ReactNode }) {
  const mode = useSiteMode();
  const brand = presetState("nistha", mode);
  const theme = { ...presetState("ink", mode), brand: brand.brand, step: brand.step };
  return (
    <ThemeScope theme={theme} className={className}>
      <PreviewFallbackProvider value={presetState("ink", mode)}>{children}</PreviewFallbackProvider>
    </ThemeScope>
  );
}
