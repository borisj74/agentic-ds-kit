"use client";

import { createContext, useContext, type ReactNode } from "react";

export type DocViewMode = "full" | "preview" | "variants";

/**
 * How a component doc renders inside the stage. "preview" (the Preview tab) shows only the doc's
 * master render; "variants" (the Variants tab) shows only its variant sections. In both, DocTabList
 * switches the doc to that view and renders no tab bar, so the page never has nested tabs, and
 * Preview and Variants show the component the same way.
 */
const DocViewContext = createContext<DocViewMode>("full");

export function DocViewProvider({ mode, children }: { mode: DocViewMode; children: ReactNode }) {
  return <DocViewContext.Provider value={mode}>{children}</DocViewContext.Provider>;
}

export function useDocView() {
  return useContext(DocViewContext);
}
