"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { Tooltip } from "agentic-ds-kit";
import type { TooltipPlacement } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, RadioControl } from "./ControlsPanel";

const PLACEMENTS: TooltipPlacement[] = ["top", "bottom", "left", "right"];

function masterCode(placement: TooltipPlacement) {
  return `<Tooltip content="Export includes all projects" placement="${placement}">
  <Button appearance="outline" mode="neutral" size="sm">Export</Button>
</Tooltip>`;
}

export function TooltipDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [placement, setPlacement] = useState<TooltipPlacement>("top");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Tooltip</h2>
        <p className={styles.lede}>
          A short name for a control on hover or focus. On touch a tap pins it. It flips to the
          other side when there is no room and stays on screen.
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
                  <Button appearance="outline" mode="neutral" size="sm">
                    Export
                  </Button>
                </Tooltip>
              </div>
              <ControlsPanel>
                <RadioControl label="Placement" options={PLACEMENTS} value={placement} onChange={setPlacement} />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Tooltip names a control in a few words. HelpPopover explains it in one to three
                  sentences. Popover holds fields or actions. Do not put links or buttons in a
                  Tooltip.
                </p>
              </div>
              <CodeBlock code={masterCode(placement)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icon trigger</h2>
              <div className={styles.exampleCanvas}>
                <Tooltip content="More options">
                  <Button appearance="ghost" mode="neutral" size="sm" iconStart="MoreHorizontal" ariaLabel="More options" />
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
  <Button appearance="ghost" mode="neutral" size="sm" iconStart="MoreHorizontal" ariaLabel="More options" />
</Tooltip>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
