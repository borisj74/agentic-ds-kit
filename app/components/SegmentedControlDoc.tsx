"use client";

import { useState } from "react";
import { SegmentedControl } from "agentic-ds-kit";
import type { SegmentedControlSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: SegmentedControlSize[] = ["sm", "md"];

const BILLING = [
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

const WITH_ICONS = [
  { value: "list", label: "List", icon: "List" as const },
  { value: "grid", label: "Grid", icon: "LayoutGrid" as const },
  { value: "board", label: "Board", icon: "SquareKanban" as const, disabled: true },
];

function masterCode(size: SegmentedControlSize, value: string, disabled: boolean) {
  const lines = [
    "<SegmentedControl",
    '  ariaLabel="Billing"',
    `  size="${size}"`,
    `  value="${value}"`,
  ];
  if (disabled) lines.push("  disabled");
  lines.push("  onChange={() => {}}", "  items={[{ value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly' }]}", "/>");
  return lines.join("\n");
}

export function SegmentedControlDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<SegmentedControlSize>("md");
  const [value, setValue] = useState("month");
  const [disabled, setDisabled] = useState(false);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>SegmentedControl</h1>
        <p className={styles.lede}>
          One choice in a joined track. Controlled or uncontrolled, sm or md, icons optional.
          role=radiogroup with arrow keys.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="segmented-master">
        <div className={styles.masterHeader}>
          <h2 id="segmented-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Click a segment or focus it and use the arrow keys. Size and disabled live in the panel.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <SegmentedControl
                  ariaLabel="Billing"
                  size={size}
                  items={BILLING}
                  value={value}
                  onChange={setValue}
                  disabled={disabled}
                />
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
                  <span className={styles.panelLabel}>State</span>
                  <button
                    type="button"
                    className={`${styles.sizeTab} ${disabled ? styles.sizeTabActive : ""}`}
                    aria-pressed={disabled}
                    onClick={() => setDisabled((current) => !current)}
                  >
                    Disabled
                  </button>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass value and onChange for a controlled group, or defaultValue for uncontrolled.
                  Arrow keys move the checked segment. Disabled segments are skipped.
                </p>
              </div>
              <CodeBlock code={masterCode(size, value, disabled)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Uncontrolled</h2>
              <div className={styles.exampleCanvas}>
                <SegmentedControl ariaLabel="Billing" defaultValue="year" items={BILLING} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  defaultValue selects the first checked segment. The group keeps its own state.
                </p>
              </div>
              <CodeBlock code={'<SegmentedControl ariaLabel="Billing" defaultValue="year" items={items} />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icons</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  <SegmentedControl ariaLabel="Density" size="sm" defaultValue="list" items={WITH_ICONS} />
                  <SegmentedControl ariaLabel="Density" size="md" defaultValue="grid" items={WITH_ICONS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  icon is optional on each item. A disabled item stays in the track and is skipped
                  by the arrow keys.
                </p>
              </div>
              <CodeBlock
                code={
                  '<SegmentedControl ariaLabel="Density" defaultValue="list" items={[\n  { value: \'list\', label: \'List\', icon: \'List\' },\n  { value: \'grid\', label: \'Grid\', icon: \'LayoutGrid\' },\n  { value: \'board\', label: \'Board\', icon: \'SquareKanban\', disabled: true },\n]} />'
                }
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
