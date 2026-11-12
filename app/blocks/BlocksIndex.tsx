"use client";

import { BLOCK_DOCS } from "@/lib/blocks";
import { ScaledFrame } from "../_components/PatternPreview";
import { blockFrameUrl } from "../_components/BlockPreview";
import { ScreenCard } from "../_components/ScreenCard";
import { usePatternTheme } from "../_components/ThemeScope";
import playground from "../playground.module.css";

/**
 * Every block as a card: its category, a live thumbnail of the block at desktop width, its name
 * and one line from the contract's summary. A card opens the block's page.
 */
export function BlocksIndex() {
  const theme = usePatternTheme();
  const mode = theme?.mode ?? "light";

  return (
    <article>
      <h1 className={playground.pageTitle}>Blocks</h1>
      <p className={playground.pageLead}>
        A block is a kit component for a whole area of a screen, built from other kit components. Import it like any
        component and give it your data.
      </p>
      <div className={playground.screenList}>
        <div className={playground.screenGrid}>
          {BLOCK_DOCS.map((doc) => (
            <ScreenCard
              key={doc.slug}
              tag={doc.contract.category}
              title={doc.label}
              description={doc.contract.summary}
              href={`/blocks/${doc.slug}`}
              thumb={<ScaledFrame src={blockFrameUrl(doc.slug, mode)} title={`${doc.label} block`} interactive={false} />}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
