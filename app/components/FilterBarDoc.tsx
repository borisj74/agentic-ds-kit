"use client";

import { useState } from "react";
import { FilterBar } from "agentic-ds-kit";
import type { FilterBarFilter, FilterBarSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocNotes } from "./DocNotes";
import { DocTabList } from "./DocTabList";

const SIZES: FilterBarSize[] = ["sm", "md"];
const START: FilterBarFilter[] = [
  { id: "status", label: "Status", value: "Pending" },
  { id: "owner", label: "Owner", count: 2 },
  { id: "plan", label: "Plan" },
  { id: "region", label: "Region", value: "EU" },
];

export function FilterBarDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<FilterBarSize>("md");
  const [filters, setFilters] = useState(START);
  const [openId, setOpenId] = useState<string | undefined>();

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>FilterBar</h2>
        <p className={styles.lede}>
          A row of filter chips. Add a filter, open one, or clear them all. Extra chips collapse
          into a +N menu.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="filterbar-master">
        <div className={styles.masterHeader}>
          <h2 id="filterbar-master" className={styles.masterTitle}>Master</h2>
          <p className={styles.masterSummary}>Each chip is a FilterButton. Clear all shows up once a filter has a value or a count.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <FilterBar
                  size={size}
                  filters={filters}
                  openId={openId}
                  maxVisible={3}
                  onFilterClick={(id) => setOpenId(id)}
                  onAdd={() => setFilters((current) => [...current, { id: `tag-${current.length}`, label: "Tag" }])}
                  onClear={() => setFilters((current) => current.map((filter) => ({ id: filter.id, label: filter.label })))}
                />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Size</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Size">
                    {SIZES.map((step) => (
                      <button key={step} type="button" className={`${styles.sizeTab} ${size === step ? styles.sizeTabActive : ""}`} aria-pressed={size === step} onClick={() => setSize(step)}>{step}</button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>One chip is FilterButton. The bar owns the row, the overflow menu, Add filter, and Clear all.</p>
              </div>
              <CodeBlock code={'<FilterBar filters={filters} onFilterClick={openFilter} onAdd={addFilter} onClear={clearFilters} maxVisible={3} />'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>No overflow</h2>
              <div className={styles.exampleCanvas}>
                <FilterBar filters={filters.slice(0, 2)} onFilterClick={() => undefined} onClear={() => undefined} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Leave maxVisible off to show every chip. Clear all stays a ghost button.</p>
              </div>
              <CodeBlock code={"<FilterBar filters={filters} onClear={clearFilters} />"} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
