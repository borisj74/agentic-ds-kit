"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Card } from "agentic-ds-kit";
import { PATTERN_ITEMS, type PatternSlug } from "@/lib/playground-nav";
import { LayoutsPreview } from "../_components/LayoutsDemo";
import { ScaledFrame, frameUrl } from "../_components/PatternPreview";
import { usePatternTheme } from "../_components/ThemeScope";
import { PATTERN_BLURBS, PATTERN_VIEWS, isScreenSlug } from "@/lib/pattern-screens";
import playground from "../playground.module.css";
import styles from "./patterns.module.css";

const SCENE_WIDTH = 1200;
const SCENE_HEIGHT = 760;


/** Thumbnail: the pattern's frame scaled into the card (not focusable); Layouts renders in place. */
function PatternThumb({ slug }: { slug: PatternSlug }) {
  const theme = usePatternTheme();
  if (!isScreenSlug(slug)) {
    return (
      <Thumb>
        <LayoutsPreview />
      </Thumb>
    );
  }
  return (
    <div className={styles.thumbFrame} inert aria-hidden="true">
      <ScaledFrame
        src={frameUrl(slug, PATTERN_VIEWS[slug][0].id, theme?.mode ?? "light")}
        title={`${slug} thumbnail`}
        interactive={false}
      />
    </div>
  );
}

function Thumb({ children }: { children: ReactNode }) {
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
    <div ref={frameRef} className={styles.thumb} inert aria-hidden="true">
      <div
        className={styles.scene}
        style={{ width: SCENE_WIDTH, height: SCENE_HEIGHT, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

export function PatternsIndex() {
  return (
    <div className={styles.index}>
      <h1 className={playground.pageTitle}>Patterns</h1>
      <p className={playground.pageLead}>
        Examples of what you can build from kit components. Open a thumbnail to use it, borrow from it, or ignore it.
      </p>
      <div className={styles.grid}>
        {PATTERN_ITEMS.map((item) => (
          <div key={item.slug} className={styles.cardLink}>
            <Card title={item.label} description={PATTERN_BLURBS[item.slug]}>
              <PatternThumb slug={item.slug} />
            </Card>
            <Link href={`/patterns/${item.slug}`} className={styles.cardHit} aria-label={`Open ${item.label}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
