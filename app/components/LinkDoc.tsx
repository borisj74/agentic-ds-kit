"use client";

import { Link } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocNotes } from "./DocNotes";

export function LinkDoc() {
  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Link</h2>
        <p className={styles.lede}>
          Text that navigates. Inline inside a sentence, standalone on its own line, or external
          when it leaves the app. For actions, use Button.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="link-master">
        <div className={styles.masterHeader}>
          <h2 id="link-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>An inline link keeps the sentence&apos;s type and stays underlined.</p>
        </div>
        <div role="tabpanel" aria-label="Preview">
          <div className={styles.layout}>
            <div className={styles.canvas}>
              <p className={styles.usageBody}>
                Read the <Link href="#billing-guide">billing guide</Link> before you change a plan.
              </p>
            </div>
          </div>
          <DocNotes>
            <div>
              <h3 className={styles.usageTitle}>Usage</h3>
              <p className={styles.usageBody}>
                The link text says where it goes. Pass <code>linkAs</code> (for example Next.js
                Link) for client-side routing.
              </p>
            </div>
            <CodeBlock code={'<p>Read the <Link href="/docs/billing">billing guide</Link> first.</p>'} />
          </DocNotes>
        </div>
      </section>

      <section className={styles.example}>
        <h2 className={styles.exampleTitle}>Standalone</h2>
        <div className={styles.exampleCanvas}>
          <Link href="#team" variant="standalone">
            Manage team
          </Link>
        </div>
        <CodeBlock code={'<Link href="/settings/team" variant="standalone">Manage team</Link>'} />
      </section>

      <section className={styles.example}>
        <h2 className={styles.exampleTitle}>External</h2>
        <div className={styles.exampleCanvas}>
          <p className={styles.usageBody}>
            Check the <Link href="https://example.com/status" external>status page</Link> for incidents.
          </p>
          <Link href="https://example.com/changelog" variant="standalone" external>
            Changelog
          </Link>
        </div>
        <CodeBlock
          code={
            '<Link href="https://status.example.com" external>status page</Link>\n<Link href="https://example.com/changelog" variant="standalone" external>Changelog</Link>'
          }
        />
      </section>
    </div>
  );
}
