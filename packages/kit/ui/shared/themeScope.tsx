"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Identifies the preview wrapper a portaled layer should match. */
export interface ThemeScopeValue {
  id: string;
  mode: "light" | "dark";
  fontClassName?: string;
}

const ThemeScopeContext = createContext<ThemeScopeValue | null>(null);

export function ThemeScopeProvider({
  value,
  children,
}: {
  value: ThemeScopeValue;
  children: ReactNode;
}) {
  return <ThemeScopeContext.Provider value={value}>{children}</ThemeScopeContext.Provider>;
}

/** Attributes and font classes a portal copies so it matches its preview, not the page. */
export function useThemeScopeMarker(): {
  id?: string;
  mode?: "light" | "dark";
  fontClassName?: string;
} {
  return useContext(ThemeScopeContext) ?? {};
}
