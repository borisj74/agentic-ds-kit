"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { Toast } from "agentic-ds-kit";
import type { ToastSize, ToastStatus } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const STATUSES: ToastStatus[] = ["info", "success", "warning", "danger", "default"];
const SIZES: ToastSize[] = ["sm", "md", "lg"];

const MASTER_TITLE = "Message sent";
const MASTER_DESCRIPTION = "Thanks for sharing your ideas, we can explain the next steps here.";

function masterCode(status: ToastStatus, size: ToastSize) {
  const lines = [
    "<Toast",
    `  title="${MASTER_TITLE}"`,
    `  description="${MASTER_DESCRIPTION}"`,
    `  status="${status}"`,
  ];
  if (size !== "md") lines.push(`  size="${size}"`);
  lines.push("  onClose={() => {}}", "/>");
  return lines.join("\n");
}

export function ToastDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [status, setStatus] = useState<ToastStatus>("info");
  const [size, setSize] = useState<ToastSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Toast</h1>
        <p className={styles.lede}>
          Short non-blocking notice after an action. One piece. Not Alert — Alert stays on the
          page.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="toast-master">
        <div className={styles.masterHeader}>
          <h2 id="toast-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle status and size. Status colors the icon only. Card stays the same.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Toast
                  title={MASTER_TITLE}
                  description={MASTER_DESCRIPTION}
                  status={status}
                  size={size}
                  onClose={() => {}}
                />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Status</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Status">
                    {STATUSES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${status === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={status === option}
                        onClick={() => setStatus(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Size</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Size">
                    {SIZES.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.sizeTab} ${size === step ? styles.sizeTabActive : ""}`}
                        aria-pressed={size === step}
                        onClick={() => setSize(step)}
                      >
                        {step}
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
                  Use Toast for a short confirmation after an action. Title plus optional
                  description and dismiss. Not a page-level Alert.
                </p>
              </div>
              <CodeBlock code={masterCode(status, size)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Info</h2>
              <div className={styles.exampleCanvas}>
                <Toast
                  title="Message sent"
                  description="Thanks for sharing your ideas, we can explain the next steps here."
                  status="info"
                  onClose={() => {}}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Neutral notice after send. Status colors the icon only.</p>
              </div>
              <CodeBlock
                code={`<Toast
  title="Message sent"
  description="Thanks for sharing your ideas, we can explain the next steps here."
  status="info"
  onClose={() => {}}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Success</h2>
              <div className={styles.exampleCanvas}>
                <Toast
                  title="Saved"
                  description="Your changes are live."
                  status="success"
                  onClose={() => {}}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>After a write that already completed.</p>
              </div>
              <CodeBlock
                code={`<Toast title="Saved" description="Your changes are live." status="success" onClose={() => {}} />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Warning</h2>
              <div className={styles.exampleCanvas}>
                <Toast
                  title="Card expires soon"
                  description="Update billing before the 12th."
                  status="warning"
                  onClose={() => {}}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Something they can still fix. Not a blocking dialog.</p>
              </div>
              <CodeBlock
                code={`<Toast title="Card expires soon" description="Update billing before the 12th." status="warning" onClose={() => {}} />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Danger</h2>
              <div className={styles.exampleCanvas}>
                <Toast
                  title="Export failed"
                  description="We could not reach the file store."
                  status="danger"
                  onClose={() => {}}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>A failure they should know about. Still dismissible.</p>
              </div>
              <CodeBlock
                code={`<Toast title="Export failed" description="We could not reach the file store." status="danger" onClose={() => {}} />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Title only</h2>
              <div className={styles.exampleCanvas}>
                <Toast title="Message sent" status="info" onClose={() => {}} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Skip description when the title is enough.</p>
              </div>
              <CodeBlock code={`<Toast title="Message sent" status="info" onClose={() => {}} />`} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With action</h2>
              <div className={styles.exampleCanvas}>
                <Toast
                  title="Saved"
                  description="Your changes are live."
                  status="success"
                  action={<Button size="sm">Undo</Button>}
                  onClose={() => {}}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass a kit Button in action. Sit it under the description. Not ToastAction.
                </p>
              </div>
              <CodeBlock
                code={`<Toast
  title="Saved"
  description="Your changes are live."
  status="success"
  action={<Button size="sm">Undo</Button>}
  onClose={() => {}}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  <Toast size="sm" title="Small" description="Compact padding." status="info" onClose={() => {}} />
                  <Toast size="md" title="Medium" description="Default padding." status="info" onClose={() => {}} />
                  <Toast size="lg" title="Large" description="Roomier padding." status="info" onClose={() => {}} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Size changes padding only. Layout stays two rows: title row, then description.
                </p>
              </div>
              <CodeBlock
                code={[
                  '<Toast size="sm" title="Small" description="Compact padding." status="info" onClose={() => {}} />',
                  '<Toast size="md" title="Medium" description="Default padding." status="info" onClose={() => {}} />',
                  '<Toast size="lg" title="Large" description="Roomier padding." status="info" onClose={() => {}} />',
                ].join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
