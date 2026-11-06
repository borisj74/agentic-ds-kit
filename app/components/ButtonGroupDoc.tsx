"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import type { ButtonSize } from "agentic-ds-kit";
import { ButtonGroup } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: ButtonSize[] = ["sm", "md", "lg"];

function periodCode(size: ButtonSize, disabled: boolean) {
  const disabledAttr = disabled ? " disabled" : "";
  return [
    '<ButtonGroup ariaLabel="Plan period">',
    `  <Button appearance="outline" mode="neutral" size="${size}"${disabledAttr}>Day</Button>`,
    `  <Button appearance="outline" mode="neutral" size="${size}"${disabledAttr}>Week</Button>`,
    `  <Button appearance="outline" mode="neutral" size="${size}"${disabledAttr}>Month</Button>`,
    "</ButtonGroup>",
  ].join("\n");
}

export function ButtonGroupDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ButtonSize>("md");
  const [disabled, setDisabled] = useState(false);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>ButtonGroup</h1>
        <p className={styles.lede}>
          Joined row of kit Buttons. Same size. Only kit Buttons. One primary per view.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="buttongroup-master">
        <div className={styles.masterHeader}>
          <h2 id="buttongroup-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Toggle size and disabled across a joined row of kit Buttons.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <ButtonGroup ariaLabel="Plan period">
                    <Button appearance="outline" mode="neutral" size={size} disabled={disabled}>
                      Day
                    </Button>
                    <Button appearance="outline" mode="neutral" size={size} disabled={disabled}>
                      Week
                    </Button>
                    <Button appearance="outline" mode="neutral" size={size} disabled={disabled}>
                      Month
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
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
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>States</span>
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Only wrap kit Buttons. Keep the same size in a row. Do not invent a local segmented control.
                  Still one primary per view.
                </p>
              </div>
              <CodeBlock code={periodCode(size, disabled)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Period switch</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <ButtonGroup ariaLabel="Plan period">
                    <Button appearance="outline" mode="neutral" size="md">
                      Day
                    </Button>
                    <Button appearance="outline" mode="neutral" size="md">
                      Week
                    </Button>
                    <Button appearance="outline" mode="neutral" size="md">
                      Month
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Related sibling actions that share one size. All secondary so the group stays quiet.
                </p>
              </div>
              <CodeBlock
                code={[
                  '<ButtonGroup ariaLabel="Plan period">',
                  '  <Button appearance="outline" mode="neutral" size="md">Day</Button>',
                  '  <Button appearance="outline" mode="neutral" size="md">Week</Button>',
                  '  <Button appearance="outline" mode="neutral" size="md">Month</Button>',
                  "</ButtonGroup>",
                ].join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Confirm pair</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <ButtonGroup ariaLabel="Save changes">
                    <Button appearance="outline" mode="neutral" size="md">
                      Cancel
                    </Button>
                    <Button appearance="solid" mode="primary" size="md">
                      Save
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Split confirm/cancel. This is the one primary for the view.
                </p>
              </div>
              <CodeBlock
                code={[
                  '<ButtonGroup ariaLabel="Save changes">',
                  '  <Button appearance="outline" mode="neutral" size="md">Cancel</Button>',
                  '  <Button appearance="solid" mode="primary" size="md">Save</Button>',
                  "</ButtonGroup>",
                ].join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icon toolbar</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <ButtonGroup ariaLabel="Text alignment">
                    <Button appearance="outline" mode="neutral" size="md" iconStart="AlignLeft" ariaLabel="Align left" />
                    <Button appearance="outline" mode="neutral" size="md" iconStart="AlignCenter" ariaLabel="Align center" />
                    <Button appearance="outline" mode="neutral" size="md" iconStart="AlignRight" ariaLabel="Align right" />
                  </ButtonGroup>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Icon-only kit Buttons in a group. Each Button sets ariaLabel. Same size. No local segmented control.
                </p>
              </div>
              <CodeBlock
                code={[
                  '<ButtonGroup ariaLabel="Text alignment">',
                  '  <Button appearance="outline" mode="neutral" size="md" iconStart="AlignLeft" ariaLabel="Align left" />',
                  '  <Button appearance="outline" mode="neutral" size="md" iconStart="AlignCenter" ariaLabel="Align center" />',
                  '  <Button appearance="outline" mode="neutral" size="md" iconStart="AlignRight" ariaLabel="Align right" />',
                  "</ButtonGroup>",
                ].join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
