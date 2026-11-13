import type { ComponentType } from "react";

/** Renders a Lucide icon by name that is not in the curated set (see `agentic-ds-kit/icons-on-demand`). */
export type OnDemandIconRenderer = ComponentType<{ name: string; size: number; className?: string }>;

let renderer: OnDemandIconRenderer | null = null;

/** Set by the `agentic-ds-kit/icons-on-demand` entry. Null turns on-demand icons off again. */
export function setOnDemandIconRenderer(next: OnDemandIconRenderer | null) {
  renderer = next;
}

export function getOnDemandIconRenderer(): OnDemandIconRenderer | null {
  return renderer;
}
