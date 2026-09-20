"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { Tooltip } from "agentic-ds-kit";
import type { TooltipPlacement } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const PLACEMENTS: TooltipPlacement[] = ["top", "bottom", "left", "right"];

function masterCode(placement: TooltipPlacement) {
  return `<Tooltip content="Export includes all projects" placement="${placement}">
  <Button variant="secondary" size="sm">Export</Button>
</Tooltip>`;
}

export function TooltipDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [placement, setPlacement] = useState<TooltipPlacement>("top");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Tooltip</h1>
        <p className={styles.lede}>
          Brief supplementary text on hover or focus. Keep copy short and non-essential. One
          piece. Not a Popover cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="tooltip-master">
        <div className={styles.masterHeader}>
          <h2 id="tooltip-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Hover or focus the trigger. Pick a placement side.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Tooltip content="Export includes all projects" placement={placement}>
                  <Button variant="secondary" size="sm">
                    Export
                  </Button>
                </Tooltip>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Placement</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Placement">
                    {PLACEMENTS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${placement === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={placement === option}
                        onClick={() => setPlacement(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Tooltip for brief, non-essential help on hover or focus. Keep copy short. Use
                  HelpPopover for a sentence or two. Do not put actions in it.
                </p>
              </div>
              <CodeBlock code={masterCode(placement)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icon trigger</h2>
              <div className={styles.exampleCanvas}>
                <Tooltip content="More options">
                  <Button variant="tertiary" size="sm" iconStart="MoreHorizontal" ariaLabel="More options" />
                </Tooltip>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Icon-only triggers need an accessible name. The tooltip supplements; it does not
                  replace the label.
                </p>
              </div>
              <CodeBlock
                code={`<Tooltip content="More options">
  <Button variant="tertiary" size="sm" iconStart="MoreHorizontal" ariaLabel="More options" />
</Tooltip>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
