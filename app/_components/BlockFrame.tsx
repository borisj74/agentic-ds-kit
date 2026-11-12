"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, readStoredTheme, type ThemeState } from "@/lib/theme-playground";
import { BLOCK_DEMOS } from "./blocks";
import { ThemeScope } from "./ThemeScope";
import frame from "./BlockFrame.module.css";
import styles from "../playground.module.css";

/**
 * One block alone in the viewport, inside a <main>, for the block pages' iframe preview and
 * "Open full screen". Follows the saved theme; `mode` from the URL sets light or dark.
 */
export function BlockFrame({ slug, label, mode }: { slug: string; label: string; mode?: string }) {
  const Demo = BLOCK_DEMOS[slug];
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
  // light / dark, so kit styles keyed on the root theme match the block.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme.mode);
  }, [theme.mode]);

  return (
    <ThemeScope theme={theme} className={styles.frameScreen}>
      <main className={frame.frameMain} aria-label={`${label} preview`}>
        {Demo ? <Demo /> : null}
      </main>
    </ThemeScope>
  );
}
