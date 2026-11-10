"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * How a component doc renders. In "variants" mode (the stage's Variants tab) a doc shows only its
 * variant cards: DocTabList switches the doc to its variants view and renders no tab bar, so the
 * page never has nested tabs. The live demo lives in the stage's own Preview tab.
 */
const DocViewContext = createContext<"full" | "variants">("full");

export function DocViewProvider({ mode, children }: { mode: "full" | "variants"; children: ReactNode }) {
  return <DocViewContext.Provider value={mode}>{children}</DocViewContext.Provider>;
}

export function useDocView() {
  return useContext(DocViewContext);
}
