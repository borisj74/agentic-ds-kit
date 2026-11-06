"use client";

import { useState } from "react";
import { Button, Popover } from "agentic-ds-kit";
import type { PopoverPlacement } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocNotes } from "./DocNotes";
import { DocTabList } from "./DocTabList";

const PLACEMENTS: PopoverPlacement[] = ["bottom", "top", "left", "right"];

export function PopoverDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [placement, setPlacement] = useState<PopoverPlacement>("bottom");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Popover</h1>
        <p className={styles.lede}>
          A panel anchored to a trigger. Click opens it. Escape and a click outside close it and
          return focus to the trigger.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="popover-master">
        <div className={styles.masterHeader}>
          <h2 id="popover-master" className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Help text is HelpPopover. A menu of commands is DropdownMenu. A blocking step is Modal.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Popover
                  label="Share"
                  placement={placement}
                  trigger={<Button appearance="outline" mode="neutral">Share</Button>}
                >
                  Copy the link, or invite someone from the team.
                </Popover>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Placement</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Placement">
                    {PLACEMENTS.map((step) => (
                      <button key={step} type="button" className={`${styles.sizeTab} ${placement === step ? styles.sizeTabActive : ""}`} aria-pressed={placement === step} onClick={() => setPlacement(step)}>{step}</button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>The trigger is one focusable control. The panel is a dialog named by label.</p>
              </div>
              <CodeBlock code={'<Popover label="Share" trigger={<Button appearance="outline" mode="neutral">Share</Button>}>Copy the link.</Popover>'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With an action</h2>
              <div className={styles.exampleCanvas}>
                <Popover label="Invite" trigger={<Button appearance="outline" mode="neutral">Invite</Button>}>
                  <p>Send a link to the workspace.</p>
                </Popover>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Put short content in the panel. A decision that blocks the page is Modal.</p>
              </div>
              <CodeBlock code={'<Popover label="Invite" trigger={<Button appearance="outline" mode="neutral">Invite</Button>}>Send a link.</Popover>'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
