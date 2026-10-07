"use client";

import { useState } from "react";
import { FilterButton } from "agentic-ds-kit";
import type { FilterButtonSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: FilterButtonSize[] = ["sm", "md", "lg"];

function masterCode(size: FilterButtonSize, applied: boolean, open: boolean, disabled: boolean) {
  const lines = ["<FilterButton"];
  if (size !== "md") lines.push(`  size="${size}"`);
  if (applied) lines.push("  count={2}");
  if (open) lines.push("  open");
  if (disabled) lines.push("  disabled");
  lines.push("  onClick={() => {}}", ">", "  Status", "</FilterButton>");
  return lines.join("\n");
}

export function FilterButtonDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<FilterButtonSize>("md");
  const [applied, setApplied] = useState(true);
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [statusOn, setStatusOn] = useState(true);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>FilterButton</h1>
        <p className={styles.lede}>
          Filter chip for lists and tables. Same chrome as a secondary Button. Applied shows a kit Count
          in ink. With onToggle the name turns the filter on or off. Not Button. Not Badge.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="filterbutton-master">
        <div className={styles.masterHeader}>
          <h2 id="filterbutton-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Status filter. Size, applied count, open, and disabled live in the panel.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <FilterButton
                  size={size}
                  count={applied ? 2 : 0}
                  open={open}
                  disabled={disabled}
                  onClick={() => setOpen((current) => !current)}
                >
                  Status
                </FilterButton>
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
                  <Switch label="Applied" size="sm" checked={applied} onChange={setApplied} />
                  <Switch label="Open" size="sm" checked={open} onChange={setOpen} />
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass count for applied values. Do not write the number into the label. Compose kit
                  Count; do not invent a split button.
                </p>
              </div>
              <CodeBlock code={masterCode(size, applied, open, disabled)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>No filters</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <FilterButton>Status</FilterButton>
                  <FilterButton>Owner</FilterButton>
                  <FilterButton>Date</FilterButton>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>The quiet default before anything is picked.</p>
              </div>
              <CodeBlock
                code={'<FilterButton>Status</FilterButton>\n<FilterButton>Owner</FilterButton>\n<FilterButton>Date</FilterButton>'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Applied</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <FilterButton count={1}>Status</FilterButton>
                  <FilterButton count={3}>Owner</FilterButton>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Same secondary chrome when applied. Count shows how many, in ink.</p>
              </div>
              <CodeBlock code={'<FilterButton count={1}>Status</FilterButton>\n<FilterButton count={3}>Owner</FilterButton>'} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Value and on/off</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <FilterButton
                    size="sm"
                    value="Pending"
                    toggle={statusOn ? "on" : "off"}
                    onToggle={() => setStatusOn((current) => !current)}
                  >
                    Status
                  </FilterButton>
                  <FilterButton size="sm" count={2} toggle="off" onToggle={() => {}}>
                    Owner
                  </FilterButton>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A set filter shows its value. With onToggle the name turns it on or off; off is dashed
                  and keeps the value.
                </p>
              </div>
              <CodeBlock
                code={
                  '<FilterButton size="sm" value="Pending" toggle="on" onToggle={toggleStatus}>Status</FilterButton>\n<FilterButton size="sm" count={2} toggle="off" onToggle={toggleOwner}>Owner</FilterButton>'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>No dropdown</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <FilterButton size="sm" hasDropdown={false}>
                    Overdue
                  </FilterButton>
                  <FilterButton size="sm" hasDropdown={false} toggle="on">
                    Overdue
                  </FilterButton>
                  <FilterButton size="sm" hasDropdown={false} toggle="off">
                    Overdue
                  </FilterButton>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A plain on/off chip for a filter with nothing to pick, like Overdue.
                </p>
              </div>
              <CodeBlock
                code={
                  '<FilterButton size="sm" hasDropdown={false}>Overdue</FilterButton>\n<FilterButton size="sm" hasDropdown={false} toggle="on">Overdue</FilterButton>'
                }
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
