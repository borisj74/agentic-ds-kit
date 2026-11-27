"use client";

import { useState } from "react";
import { Combobox, Field, FilterBar, MultiSelect } from "agentic-ds-kit";
import type { FilterBarFilter, FilterBarSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocNotes } from "./DocNotes";
import { DocTabList } from "./DocTabList";
import { ControlsPanel, SizeControl } from "./ControlsPanel";

const SIZES: FilterBarSize[] = ["sm", "md", "lg"];
const NARROW = { maxWidth: "24rem" } as const;
const CUSTOMERS = [
  { value: "northwind", label: "Northwind Traders" },
  { value: "contoso", label: "Contoso" },
  { value: "litware", label: "Litware" },
];
const STATUSES = [
  { value: "open", label: "Open" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
];
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
          A row of filter chips, with an optional leading search. Add a filter, open one, or clear
          them all. Extra chips collapse into a +N menu. On a narrow screen the row can fold into a
          Filters chip that opens a sheet.
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
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
              </ControlsPanel>
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
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Leading search and narrow sheet</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={NARROW}>
                  <FilterBar
                    filters={filters.slice(0, 3)}
                    onFilterClick={() => undefined}
                    onClear={() => setFilters((current) => current.map((filter) => ({ id: filter.id, label: filter.label })))}
                    leading={<Combobox id="filterbar-customer" ariaLabel="Customer" placeholder="Search customers" options={CUSTOMERS} />}
                    onApply={() => undefined}
                    renderSheet={() => (
                      <>
                        <Field label="Status" htmlFor="filterbar-sheet-status">
                          <MultiSelect id="filterbar-sheet-status" options={STATUSES} defaultValue={["open", "overdue"]} />
                        </Field>
                        <Field label="Customer" htmlFor="filterbar-sheet-customer">
                          <Combobox id="filterbar-sheet-customer" placeholder="Search customers" options={CUSTOMERS} />
                        </Field>
                      </>
                    )}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  leading puts a kit Combobox or search Input before the chips. With renderSheet, a
                  bar narrower than 40rem shows one Filters chip with the applied count. It opens a
                  bottom Drawer with the same fields stacked, Clear all, and Apply as the only primary.
                </p>
              </div>
              <CodeBlock code={"<FilterBar filters={filters} leading={<Combobox id=\"customer\" ariaLabel=\"Customer\" options={customers} />}\n  renderSheet={() => <SheetFields />} onApply={applyFilters} onClear={clearFilters} />"} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
