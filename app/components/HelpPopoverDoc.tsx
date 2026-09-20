"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { Field } from "agentic-ds-kit";
import { HelpPopover } from "agentic-ds-kit";
import { Input } from "agentic-ds-kit";
import type { HelpPopoverPlacement } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const PLACEMENTS: HelpPopoverPlacement[] = ["top", "bottom", "left", "right"];

const HELP =
  "We use this date on the PDF. It does not change when payment is recorded.";

function masterCode(placement: HelpPopoverPlacement) {
  return `<HelpPopover title="Invoice date" content="${HELP}" placement="${placement}">
  <Button variant="tertiary" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
</HelpPopover>`;
}

export function HelpPopoverDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [placement, setPlacement] = useState<HelpPopoverPlacement>("bottom");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>HelpPopover</h1>
        <p className={styles.lede}>
          A small help panel: optional title plus one to three short sentences. Hover or focus
          shows it; click or tap pins it. Not Tooltip. Not Field hint. Not Modal.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="helppopover-master">
        <div className={styles.masterHeader}>
          <h2 id="helppopover-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Hover, focus, or click the help control. Pick a placement side.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <HelpPopover title="Invoice date" content={HELP} placement={placement}>
                  <Button variant="tertiary" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
                </HelpPopover>
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
                  Use HelpPopover for a sentence or two of optional explanation. Tooltip is a
                  one-line name. Field hint stays visible. Do not put actions in the panel.
                </p>
              </div>
              <CodeBlock code={masterCode(placement)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Body only</h2>
              <div className={styles.exampleCanvas}>
                <HelpPopover content="Turn this on to email a receipt after each payment.">
                  <Button variant="tertiary" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
                </HelpPopover>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Omit title when the trigger already names the topic.</p>
              </div>
              <CodeBlock
                code={`<HelpPopover content="Turn this on to email a receipt after each payment.">
  <Button variant="tertiary" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
</HelpPopover>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With Field</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                  <Field label="Invoice date" htmlFor="help-invoice-date" help={HELP}>
                    <Input id="help-invoice-date" placeholder="2026-09-20" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Field help sits beside the label. hint stays under the control for required
                  instructions.
                </p>
              </div>
              <CodeBlock
                code={`<Field label="Invoice date" htmlFor="invoice-date" help="${HELP}">
  <Input id="invoice-date" />
</Field>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
