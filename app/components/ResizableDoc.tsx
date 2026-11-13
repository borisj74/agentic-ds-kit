"use client";

import { useState } from "react";
import { Resizable } from "agentic-ds-kit";
import type { ResizableOrientation } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocNotes } from "./DocNotes";
import { DocTabList } from "./DocTabList";

const ORIENTATIONS: ResizableOrientation[] = ["horizontal", "vertical"];

export function ResizableDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [orientation, setOrientation] = useState<ResizableOrientation>("horizontal");
  const [size, setSize] = useState(40);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Resizable</h2>
        <p className={styles.lede}>
          Two panels and a separator. Drag it, or focus it and use the arrow keys. Shift steps
          further. Home and End go to the limits.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="resizable-master">
        <div className={styles.masterHeader}>
          <h2 id="resizable-master" className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>horizontal is left and right. vertical is top and bottom. A fixed sidebar is SideNav.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Resizable
                  orientation={orientation}
                  size={size}
                  onSizeChange={setSize}
                  startLabel="List"
                  endLabel="Detail"
                  start={<p>List. {Math.round(size)}%</p>}
                  end={<p>Detail</p>}
                />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Orientation</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Orientation">
                    {ORIENTATIONS.map((step) => (
                      <button key={step} type="button" className={`${styles.sizeTab} ${orientation === step ? styles.sizeTabActive : ""}`} aria-pressed={orientation === step} onClick={() => setOrientation(step)}>{step}</button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>size is the start panel, from 0 to 100. min and max keep the drag inside a range.</p>
              </div>
              <CodeBlock code={'<Resizable orientation="horizontal" start={<p>List</p>} end={<p>Detail</p>} />'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Vertical</h2>
              <div className={styles.exampleCanvas}>
                <Resizable orientation="vertical" defaultSize={35} start={<p>Preview</p>} end={<p>Notes</p>} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Arrow up and down resize a vertical split. The separator stays in the tab order.</p>
              </div>
              <CodeBlock code={'<Resizable orientation="vertical" start={<p>Preview</p>} end={<p>Notes</p>} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
