"use client";

import { Kbd } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocNotes } from "./DocNotes";

export function KbdDoc() {
  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Kbd</h1>
        <p className={styles.lede}>
          A shortcut chip for one key. Put several in a row for a chord.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="kbd-master">
        <div className={styles.masterHeader}>
          <h2 id="kbd-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>One chip per key. The chord is the reading order.</p>
        </div>
        <div role="tabpanel" aria-label="Preview">
          <div className={styles.layout}>
            <div className={styles.canvas}>
              <div className={styles.previewRow}>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </div>
            </div>
          </div>
          <DocNotes>
            <div>
              <h3 className={styles.usageTitle}>Usage</h3>
              <p className={styles.usageBody}>
                Use Kbd for the key name, not Badge. A chord is adjacent chips, not one chip with
                the whole shortcut.
              </p>
            </div>
            <CodeBlock code={"<Kbd>⌘</Kbd>\n<Kbd>K</Kbd>"} />
          </DocNotes>
        </div>
      </section>

      <section className={styles.example}>
        <h2 className={styles.exampleTitle}>In a sentence</h2>
        <div className={styles.exampleCanvas}>
          <p className={styles.usageBody}>
            Open the command menu with <Kbd>⌘</Kbd> <Kbd>K</Kbd>, or jump to search with <Kbd>/</Kbd>.
          </p>
        </div>
        <CodeBlock code={'<p>Open the command menu with <Kbd>⌘</Kbd> <Kbd>K</Kbd>.</p>'} />
      </section>
    </div>
  );
}
