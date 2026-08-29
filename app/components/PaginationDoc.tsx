"use client";

import { useState } from "react";
import { Pagination } from "@/ui/Pagination";
import type { PaginationSize } from "@/ui/Pagination";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: PaginationSize[] = ["sm", "md"];

function masterCode(page: number, size: PaginationSize) {
  const lines = ["<Pagination", `  page={${page}}`, "  pageCount={10}"];
  if (size !== "md") lines.push(`  size="${size}"`);
  lines.push("  onPageChange={() => {}}", "/>");
  return lines.join("\n");
}

export function PaginationDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [page, setPage] = useState(2);
  const [size, setSize] = useState<PaginationSize>("md");
  const [simplePage, setSimplePage] = useState(2);
  const [iconsPage, setIconsPage] = useState(2);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Pagination</h1>
        <p className={styles.lede}>
          Previous, page numbers, ellipsis, Next. Kit Buttons. Not ButtonGroup.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="pagination-master">
        <div className={styles.masterHeader}>
          <h2 id="pagination-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Controlled page 2 of 10. Click pages or Previous/Next to change page. Size lives in the
            panel.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Pagination page={page} pageCount={10} size={size} onPageChange={setPage} />
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
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Page tables, long lists, and search results. Not ButtonGroup. Not Tabs. DataTable
                  may compose Pagination later — do not invent cousins.
                </p>
              </div>
              <CodeBlock code={masterCode(page, size)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Simple</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Pagination
                    page={simplePage}
                    pageCount={10}
                    showPreviousNext={false}
                    onPageChange={setSimplePage}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Page numbers only. Hide Previous and Next with showPreviousNext false.
                </p>
              </div>
              <CodeBlock
                code={`<Pagination
  page={2}
  pageCount={10}
  showPreviousNext={false}
  onPageChange={() => {}}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icons only</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Pagination
                    page={iconsPage}
                    pageCount={10}
                    showPages={false}
                    showLabels={false}
                    onPageChange={setIconsPage}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Previous and Next as icon-only kit Buttons. Hide page numbers with showPages
                  false.
                </p>
              </div>
              <CodeBlock
                code={`<Pagination
  page={2}
  pageCount={10}
  showPages={false}
  showLabels={false}
  onPageChange={() => {}}
/>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
