"use client";

import { useState } from "react";
import { Button } from "@/ui/Button";
import type { ButtonSize } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SIZES: ButtonSize[] = ["lg", "md", "sm"];

function periodCode(size: ButtonSize, disabled: boolean) {
  const disabledAttr = disabled ? " disabled" : "";
  return [
    '<ButtonGroup ariaLabel="Plan period">',
    `  <Button variant="secondary" size="${size}"${disabledAttr}>Day</Button>`,
    `  <Button variant="secondary" size="${size}"${disabledAttr}>Week</Button>`,
    `  <Button variant="secondary" size="${size}"${disabledAttr}>Month</Button>`,
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
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "variants"}
              className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`}
              onClick={() => setTab("variants")}
            >
              Variants
            </button>
          </div>
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <ButtonGroup ariaLabel="Plan period">
                    <Button variant="secondary" size={size} disabled={disabled}>
                      Day
                    </Button>
                    <Button variant="secondary" size={size} disabled={disabled}>
                      Week
                    </Button>
                    <Button variant="secondary" size={size} disabled={disabled}>
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
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Only wrap kit Buttons. Keep the same size in a row. Do not invent a local segmented control.
                  Still one primary per view.
                </p>
              </div>
              <CodeBlock code={periodCode(size, disabled)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Period switch</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <ButtonGroup ariaLabel="Plan period">
                    <Button variant="secondary" size="md">
                      Day
                    </Button>
                    <Button variant="secondary" size="md">
                      Week
                    </Button>
                    <Button variant="secondary" size="md">
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
                  '  <Button variant="secondary" size="md">Day</Button>',
                  '  <Button variant="secondary" size="md">Week</Button>',
                  '  <Button variant="secondary" size="md">Month</Button>',
                  "</ButtonGroup>",
                ].join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Confirm pair</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <ButtonGroup ariaLabel="Save changes">
                    <Button variant="secondary" size="md">
                      Cancel
                    </Button>
                    <Button variant="primary" size="md">
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
                  '  <Button variant="secondary" size="md">Cancel</Button>',
                  '  <Button variant="primary" size="md">Save</Button>',
                  "</ButtonGroup>",
                ].join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icon toolbar</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <ButtonGroup ariaLabel="Text alignment">
                    <Button variant="secondary" size="md" iconStart="AlignLeft" ariaLabel="Align left" />
                    <Button variant="secondary" size="md" iconStart="AlignCenter" ariaLabel="Align center" />
                    <Button variant="secondary" size="md" iconStart="AlignRight" ariaLabel="Align right" />
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
                  '  <Button variant="secondary" size="md" iconStart="AlignLeft" ariaLabel="Align left" />',
                  '  <Button variant="secondary" size="md" iconStart="AlignCenter" ariaLabel="Align center" />',
                  '  <Button variant="secondary" size="md" iconStart="AlignRight" ariaLabel="Align right" />',
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
