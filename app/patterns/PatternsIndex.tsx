"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { PATTERN_ITEMS } from "@/lib/playground-nav";
import { LayoutsPreview } from "../_components/LayoutsDemo";
import { ScaledFrame, frameUrl } from "../_components/PatternPreview";
import { ScreenCard } from "../_components/ScreenCard";
import { usePatternTheme } from "../_components/ThemeScope";
import { PATTERN_ADD, PATTERN_BLURBS, PATTERN_VIEWS, isScreenSlug, type ScreenSlug } from "@/lib/pattern-screens";
import playground from "../playground.module.css";
import styles from "./patterns.module.css";

interface ScreenEntry {
  key: string;
  title: string;
  description: string;
  href: string;
  /** Null for Layouts, which has no frame. */
  slug: ScreenSlug | null;
  view: string | null;
  copy?: string;
}

const SCENE_WIDTH = 1200;
const SCENE_HEIGHT = 750;

/** Layouts is not a frame: its in-page demo, scaled like a frame. */
function LayoutsThumb({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const fit = () => {
      if (frame.clientWidth < 8) return;
      const next = frame.clientWidth / SCENE_WIDTH;
      setScale((current) => (Math.abs(current - next) < 0.005 ? current : next));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={styles.thumb}>
      <div className={styles.scene} style={{ width: SCENE_WIDTH, height: SCENE_HEIGHT, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Every screen as its own card, like a screens catalogue: each pattern state ("Settings area /
 * Billing · overdue") with a live thumbnail, one line and Copy add. A card opens its pattern on that state.
 */
export function PatternsIndex() {
  const theme = usePatternTheme();
  const mode = theme?.mode ?? "light";

  // By name, like the nav: A–Z.
  const byName = [...PATTERN_ITEMS].sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }));
  const screens = byName.flatMap((item): ScreenEntry[] => {
    const slug = item.slug;
    if (!isScreenSlug(slug)) {
      return [{ key: item.slug, title: item.label, description: PATTERN_BLURBS[item.slug], href: `/patterns/${item.slug}`, slug: null, view: null, copy: undefined }];
    }
    const views = PATTERN_VIEWS[slug];
    return views.map((view, index) => ({
      key: `${item.slug}:${view.id}`,
      title: views.length > 1 && view.label !== item.label ? `${item.label} / ${view.label}` : item.label,
      description: PATTERN_BLURBS[item.slug],
      href: index === 0 ? `/patterns/${slug}` : `/patterns/${slug}?view=${encodeURIComponent(view.id)}`,
      slug,
      view: view.id,
      copy: PATTERN_ADD[slug],
    }));
  });

  return (
    <div className={styles.index}>
      <h1 className={playground.pageTitle}>Patterns</h1>
      <p className={playground.pageLead}>
        Screens built from kit components, every state on its own. Open one to see it full size, copy it in with its add
        command, borrow from it, or ignore it.
      </p>
      <p className={styles.count}>
        Screens <span className={styles.countBadge}>{screens.length}</span>
      </p>
      <div className={playground.screenList}>
        <div className={playground.screenGrid}>
          {screens.map((screen) => (
            <ScreenCard
              key={screen.key}
              title={screen.title}
              description={screen.description}
              href={screen.href}
              copyText={screen.copy}
              thumb={
                screen.slug && screen.view ? (
                  <ScaledFrame src={frameUrl(screen.slug, screen.view, mode)} title={screen.title} interactive={false} />
                ) : (
                  <LayoutsThumb>
                    <LayoutsPreview />
                  </LayoutsThumb>
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
