"use client";

import { useEffect, useId, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { ThemeScopeProvider } from "agentic-ds-kit";
// Pattern demos render kit source (packages/kit/patterns → ../../ui), a second module instance with
// its own scope context. Provide both, so their portals (Drawer, AlertDialog, menus) match the preview.
import { ThemeScopeProvider as SourceThemeScopeProvider } from "../../packages/kit/ui/shared/themeScope";
import { scopeCss, themeDeclarations, type ThemeState } from "@/lib/theme-playground";
import { readPatternTheme, subscribeTheme } from "@/lib/theme-store";
import { themeFontClassName } from "./theme-fonts";

export function usePatternTheme(): ThemeState | null {
  return useSyncExternalStore(subscribeTheme, readPatternTheme, () => null);
}

/** Preview wrapper. Token overrides and data-theme stay on this element. */
export function ThemeScope({
  theme,
  fontClassName = themeFontClassName,
  className,
  children,
}: {
  theme: ThemeState | null;
  fontClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // The head script hides previews while a saved theme is pending. Once the client has read the
  // store, an unreadable or missing theme must not keep them hidden.
  useEffect(() => {
    if (!theme && !readPatternTheme()) document.documentElement.removeAttribute("data-preview-theme");
  }, [theme]);
  const css = theme ? scopeCss(theme, id) : "";
  const style = theme
    ? (themeDeclarations(theme, theme.mode, "preview") as CSSProperties)
    : undefined;

  return (
    <ThemeScopeProvider value={{ id, mode: theme?.mode ?? "light", fontClassName }}>
      <SourceThemeScopeProvider value={{ id, mode: theme?.mode ?? "light", fontClassName }}>
        <div
          data-theme-scope={id}
          data-theme={theme?.mode === "dark" ? "dark" : undefined}
          data-preview-scope=""
          data-theme-ready={theme ? "" : undefined}
          className={[className, fontClassName].filter(Boolean).join(" ")}
          style={style}
        >
          {css ? <style>{css}</style> : null}
          {children}
        </div>
      </SourceThemeScopeProvider>
    </ThemeScopeProvider>
  );
}

export function PreviewScope({ className, children }: { className?: string; children: ReactNode }) {
  const theme = usePatternTheme();
  return (
    <ThemeScope theme={theme} className={className}>
      {children}
    </ThemeScope>
  );
}
