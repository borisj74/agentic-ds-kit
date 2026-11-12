"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, readStoredTheme, type ThemeState } from "@/lib/theme-playground";
import type { ScreenSlug } from "@/lib/pattern-screens";
import { PatternScreen } from "./PatternScreens";
import { ThemeScope } from "./ThemeScope";
import styles from "../playground.module.css";

/**
 * One pattern screen alone in the viewport, for the pattern pages' iframe previews and
 * "Open full screen". It follows the saved theme (the Theme panel), re-reading it when another
 * tab or the parent page changes it, and `mode` from the URL sets light or dark.
 */
export function FrameScreen({ slug, view, mode }: { slug: ScreenSlug; view?: string; mode?: string }) {
  const [stored, setStored] = useState<ThemeState | null>(null);

  useEffect(() => {
    const read = () => setStored(readStoredTheme());
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  const base = stored ?? DEFAULT_THEME;
  const theme: ThemeState = mode === "dark" || mode === "light" ? { ...base, mode } : base;

  // The frame is its own document: its root takes the preview's mode, not the docs site's saved
  // light / dark, so kit styles keyed on the root theme match the screen.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme.mode);
  }, [theme.mode]);

  return (
    <ThemeScope theme={theme} className={styles.frameScreen}>
      <PatternScreen slug={slug} view={view} />
    </ThemeScope>
  );
}
