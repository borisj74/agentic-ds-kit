"use client";

import { createContext, useContext, useEffect, useId, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { ThemeScopeProvider } from "agentic-ds-kit";
// Pattern demos render kit source (packages/kit/patterns → ../../ui), a second module instance with
// its own scope context. Provide both, so their portals (Drawer, AlertDialog, menus) match the preview.
import { ThemeScopeProvider as SourceThemeScopeProvider } from "../../packages/kit/ui/shared/themeScope";
import { scopeCss, themeDeclarations, type ThemeState } from "@/lib/theme-playground";
import { readPatternTheme, subscribeTheme } from "@/lib/theme-store";
import { readPlaygroundTheme } from "@/lib/playground-theme";
import { themeFontClassName } from "./theme-fonts";

export function usePatternTheme(): ThemeState | null {
  return useSyncExternalStore(subscribeTheme, readPatternTheme, () => null);
}

function subscribeSiteMode(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** The docs site's own light / dark (html[data-theme]). The server (and hydration) render light. */
export function useSiteMode(): "light" | "dark" {
  return useSyncExternalStore(subscribeSiteMode, readPlaygroundTheme, () => "light" as const);
}

/**
 * Light or dark for preview thumbnails: the saved preview theme's mode when there is one, else
 * the docs site's own light / dark. The server (and hydration) render light.
 */
export function usePreviewMode(): "light" | "dark" {
  const theme = usePatternTheme();
  const site = useSiteMode();
  return theme?.mode ?? site;
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

/**
 * The theme a PreviewScope falls back to when no preview theme is saved. Unset, previews inherit
 * the page. A page that runs in its own colour set (the home page, in Ink) sets it, so the
 * product previews keep the kit's own look.
 */
const PreviewFallback = createContext<ThemeState | null>(null);

export function PreviewFallbackProvider({ value, children }: { value: ThemeState; children: ReactNode }) {
  return <PreviewFallback.Provider value={value}>{children}</PreviewFallback.Provider>;
}

export function PreviewScope({ className, children }: { className?: string; children: ReactNode }) {
  const saved = usePatternTheme();
  const fallback = useContext(PreviewFallback);
  const theme = saved ?? fallback;
  return (
    <ThemeScope theme={theme} className={className}>
      {children}
    </ThemeScope>
  );
}
