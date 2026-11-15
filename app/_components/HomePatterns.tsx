"use client";

import { PATTERN_BLURBS, PATTERN_VIEWS, type ScreenSlug } from "@/lib/pattern-screens";
import { PATTERN_ITEMS } from "@/lib/playground-nav";
import { ScaledFrame, frameUrl } from "./PatternPreview";
import { ScreenCard } from "./ScreenCard";
import { usePreviewMode } from "./ThemeScope";
import playground from "../playground.module.css";

/** The pattern screens the home page shows, in order. */
const SHOWN: ScreenSlug[] = ["dashboard", "settings", "list-detail", "onboarding"];

/** Thumbnail scale: a big readable piece of each screen rather than the whole of it. */
const THUMB_SCALE = 0.6;

/** Four pattern screens as large live previews; each card opens its pattern page. */
export function HomePatterns() {
  const mode = usePreviewMode();

  return (
    <div className={playground.screenList}>
      <div className={playground.screenGrid}>
        {SHOWN.map((slug) => {
          const label = PATTERN_ITEMS.find((item) => item.slug === slug)?.label ?? slug;
          return (
            <ScreenCard
              key={slug}
              headingLevel={3}
              title={label}
              description={PATTERN_BLURBS[slug]}
              href={`/patterns/${slug}`}
              thumb={
                <ScaledFrame
                  src={frameUrl(slug, PATTERN_VIEWS[slug][0].id, mode)}
                  title={`${label} pattern`}
                  interactive={false}
                  crop={THUMB_SCALE}
                  deferUntilVisible
                />
              }
            />
          );
        })}
      </div>
    </div>
  );
}
