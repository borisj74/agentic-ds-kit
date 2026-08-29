"use client";

import { useState } from "react";
import { HeaderCell } from "@/ui/HeaderCell";
import type { HeaderCellSize, HeaderCellSort } from "@/ui/HeaderCell";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: HeaderCellSize[] = ["sm", "md"];

function masterCode(size: HeaderCellSize, checkbox: boolean, sortable: boolean, sort?: HeaderCellSort): string {
  const lines = ["<HeaderCell", `  size="${size}"`, '  label="Name"'];
  if (checkbox) lines.push("  checkbox");
  if (sortable) {
    lines.push("  sortable");
    if (sort) lines.push(`  sort="${sort}"`);
  }
  lines.push("/>");
  return lines.join("\n");
}

export function HeaderCellDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<HeaderCellSize>("md");
  const [checkbox, setCheckbox] = useState(false);
  const [checked, setChecked] = useState(false);
  const [sortable, setSortable] = useState(false);
  const [sort, setSort] = useState<HeaderCellSort | undefined>(undefined);

  function cycleSort() {
    setSort((current) => (current === "asc" ? "desc" : current === "desc" ? undefined : "asc"));
  }

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>HeaderCell</h1>
        <p className={styles.lede}>
          Column title for DataTable. Optional select-all checkbox. Cell is the body.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="headercell-master">
        <div className={styles.masterHeader}>
          <h2 id="headercell-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Toggle size and checkbox. Framed so sm and md read.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                    <HeaderCell
                      size={size}
                      label="Name"
                      checkbox={checkbox}
                      checked={checked}
                      onCheckedChange={setChecked}
                      sortable={sortable}
                      sort={sort}
                      onSort={cycleSort}
                    />
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
                  <Switch
                    label="Sortable"
                    size="sm"
                    checked={sortable}
                    onChange={(next) => {
                      setSortable(next);
                      if (!next) setSort(undefined);
                    }}
                  />
                  <Switch label="Checkbox" size="sm" checked={checkbox} onChange={setCheckbox} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use in a th. DataTable already does. Body cells are Cell. Do not invent a local
                  header.
                </p>
              </div>
              <CodeBlock code={masterCode(size, checkbox, sortable, sort)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Label</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <HeaderCell label="Name" size="md" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Default column title. Muted label type.</p>
              </div>
              <CodeBlock code={'<HeaderCell label="Name" size="md" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Select all</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <HeaderCell checkbox size="md" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Checkbox only. Kit Checkbox, unlabeled, aria-label Select all rows.
                </p>
              </div>
              <CodeBlock code={"<HeaderCell checkbox size=\"md\" />"} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sortable</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <HeaderCell label="Name" size="md" sortable sort="asc" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  DataTable sets sortable on a column. Click cycles asc, desc, off.
                </p>
              </div>
              <CodeBlock code={'<HeaderCell label="Name" size="md" sortable sort="asc" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Number column</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <HeaderCell label="Projects" size="md" align="end" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>align end for numeric columns.</p>
              </div>
              <CodeBlock code={'<HeaderCell label="Projects" size="md" align="end" />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
