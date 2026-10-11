"use client";

import { createElement, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { normalizeIconName } from "./iconName";

type IconImports = Record<string, () => Promise<{ default: LucideIcon }>>;

let indexPromise: Promise<{ imports: IconImports; keys: Map<string, string> }> | undefined;
const loaded = new Map<string, LucideIcon | null>();
const warned = new Set<string>();

/**
 * Lucide's name → import map is large, so it is itself loaded on first use:
 * apps that only use curated names never download it.
 */
function loadIndex() {
  indexPromise ??= import("lucide-react/dynamic").then(({ dynamicIconImports }) => {
    const keys = new Map<string, string>();
    for (const key of Object.keys(dynamicIconImports)) keys.set(normalizeIconName(key), key);
    return { imports: dynamicIconImports as IconImports, keys };
  });
  return indexPromise;
}

async function loadIcon(key: string): Promise<LucideIcon | null> {
  const { imports, keys } = await loadIndex();
  const lucideKey = keys.get(key);
  if (!lucideKey) return null;
  return (await imports[lucideKey]()).default;
}

/**
 * Any Lucide icon outside the curated map. Reserves the icon box while the
 * icon's chunk loads; a name that isn't a Lucide icon renders nothing and
 * warns once in development.
 */
export function LucideOnDemand({
  name,
  size,
  className,
}: {
  name: string;
  size: number;
  className?: string;
}) {
  const key = normalizeIconName(name);
  const [result, setResult] = useState<{ key: string; icon: LucideIcon | null }>();
  const icon = loaded.has(key) ? loaded.get(key) : result?.key === key ? result.icon : undefined;

  useEffect(() => {
    if (loaded.has(key)) return;
    let live = true;
    loadIcon(key).then(
      (Icon) => {
        loaded.set(key, Icon);
        if (!Icon && process.env.NODE_ENV !== "production" && !warned.has(key)) {
          warned.add(key);
          console.warn(`[agentic-ds-kit] "${name}" is not a Lucide icon name; nothing rendered.`);
        }
        if (live) setResult({ key, icon: Icon });
      },
      () => {
        if (live) setResult({ key, icon: null });
      },
    );
    return () => {
      live = false;
    };
  }, [key, name]);

  if (icon === null) return null;
  if (icon === undefined) {
    return (
      <span
        aria-hidden
        className={className}
        style={{ display: "inline-block", flexShrink: 0, width: size, height: size }}
      />
    );
  }
  return createElement(icon, { size, strokeWidth: 2, "aria-hidden": true, className });
}
