"use client";

import { useState } from "react";
import { Carousel } from "@/ui/Carousel";
import type { CarouselOrientation } from "@/ui/Carousel";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import doc from "./CarouselDoc.module.css";
import { DocTabList } from "./DocTabList";

const ORIENTATIONS: CarouselOrientation[] = ["horizontal", "vertical"];

function numberedPanels(count = 5) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className={doc.panel}>
      {i + 1}
    </div>
  ));
}

function masterCode(orientation: CarouselOrientation, loop: boolean, showIndex: boolean) {
  const lines = ["<Carousel", "  items={[panel, panel, panel, panel, panel]}"];
  if (orientation !== "horizontal") lines.push(`  orientation="${orientation}"`);
  if (loop) lines.push("  loop");
  if (showIndex) lines.push("  showIndex");
  lines.push("/>");
  return lines.join("\n");
}

export function CarouselDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [orientation, setOrientation] = useState<CarouselOrientation>("horizontal");
  const [loop, setLoop] = useState(false);
  const [showIndex, setShowIndex] = useState(true);
  const padClass =
    orientation === "vertical"
      ? `${doc.previewPad} ${doc.previewPadVertical}`
      : doc.previewPad;

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Carousel</h1>
        <p className={styles.lede}>
          Swipe through slides. Prev and next are kit Buttons. One piece. Not Content, Item,
          Previous, or Next cousins.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="carousel-master">
        <div className={styles.masterHeader}>
          <h2 id="carousel-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Five slides labeled 1 to 5. Toggle orientation and loop. Index caption reads Slide N of
            M.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={`${styles.previewFill} ${padClass}`}>
                  <Carousel
                    items={numberedPanels(5)}
                    orientation={orientation}
                    loop={loop}
                    showIndex={showIndex}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Orientation</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Orientation">
                    {ORIENTATIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${orientation === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={orientation === option}
                        onClick={() => setOrientation(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>States</span>
                  <Switch label="Loop" size="sm" checked={loop} onChange={setLoop} />
                  <Switch label="Show index" size="sm" checked={showIndex} onChange={setShowIndex} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One full slide at a time. Arrows sit outside the track.
                </p>
              </div>
              <CodeBlock code={masterCode(orientation, loop, showIndex)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Three-up</h2>
              <div className={styles.exampleCanvas}>
                <div className={`${styles.previewFill} ${doc.previewPad} ${doc.previewPadWide}`}>
                  <Carousel items={numberedPanels(5)} slidesPerView={3} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Peek adjacent slides with slidesPerView 3.</p>
              </div>
              <CodeBlock
                code={`<Carousel
  items={[panel, panel, panel, panel, panel]}
  slidesPerView={3}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Loop</h2>
              <div className={styles.exampleCanvas}>
                <div className={`${styles.previewFill} ${doc.previewPad}`}>
                  <Carousel items={numberedPanels(5)} loop />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Loop wraps from the last slide back to the first. Prev and next stay enabled.
                </p>
              </div>
              <CodeBlock
                code={`<Carousel
  items={[panel, panel, panel, panel, panel]}
  loop
/>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
