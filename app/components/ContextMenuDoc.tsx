"use client";

import { useState } from "react";
import { ContextMenu } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocNotes } from "./DocNotes";
import { DocTabList } from "./DocTabList";

const ITEMS = [
  { id: "rename", label: "Rename", shortcut: "⌘R" },
  { id: "duplicate", label: "Duplicate" },
  { id: "archive", label: "Archive", disabled: true },
  { id: "delete", label: "Delete", danger: true },
];

export function ContextMenuDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [last, setLast] = useState("None");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>ContextMenu</h2>
        <p className={styles.lede}>
          Actions for one target. Right-click or press Shift+F10. Arrow keys move, Enter chooses,
          Escape closes.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="contextmenu-master">
        <div className={styles.masterHeader}>
          <h2 id="contextmenu-master" className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>A visible button that opens actions is DropdownMenu, not this.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <ContextMenu items={ITEMS} onSelect={setLast}>
                  <p>Right-click this record. Last action: {last}.</p>
                </ContextMenu>
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Wrap the target. Disabled items are skipped. A danger item is the destructive one.</p>
              </div>
              <CodeBlock code={"<ContextMenu items={actions} onSelect={run}>{record}</ContextMenu>"} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Danger</h2>
              <div className={styles.exampleCanvas}>
                <ContextMenu ariaLabel="Record" items={ITEMS} onSelect={setLast}>
                  <p>Shift+F10 also opens the menu.</p>
                </ContextMenu>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>danger marks a destructive row. It does not confirm — pair AlertDialog when the action cannot be undone.</p>
              </div>
              <CodeBlock code={"<ContextMenu items={[{ id: 'delete', label: 'Delete', danger: true }]} onSelect={remove}>{row}</ContextMenu>"} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
