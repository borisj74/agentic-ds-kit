"use client";

import { useState } from "react";
import { AnchorNav } from "agentic-ds-kit";
import type { AnchorNavVariant } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import demo from "./AnchorNavDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const VARIANTS: AnchorNavVariant[] = ["rail", "menu"];

const RAIL = [
  { id: "anchor-demo-details", label: "Details" },
  { id: "anchor-demo-billing", label: "Billing" },
  { id: "anchor-demo-usage", label: "Usage" },
  { id: "anchor-demo-history", label: "History" },
] as const;

const MENU = [
  { id: "anchor-menu-details", label: "Details" },
  { id: "anchor-menu-billing", label: "Billing" },
  { id: "anchor-menu-usage", label: "Usage" },
  { id: "anchor-menu-history", label: "History" },
] as const;

const COPY = [
  ["Details", "Name, owner, and the account this record belongs to."],
  ["Billing", "Terms, the billing day, and the invoice the run writes to."],
  ["Usage", "Metered lines, the rate they are billed at, and this period's totals."],
  ["History", "Every change on the record, newest first."],
] as const;

function Sections({ ids }: { ids: readonly { id: string; label: string }[] }) {
  return (
    <div className={demo.scroller}>
      {ids.map((item, index) => (
        <section key={item.id} id={item.id} className={demo.section}>
          <h3 className={demo.sectionTitle}>{COPY[index]?.[0]}</h3>
          <p className={demo.sectionBody}>{COPY[index]?.[1]}</p>
        </section>
      ))}
    </div>
  );
}

export function AnchorNavDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [variant, setVariant] = useState<AnchorNavVariant>("rail");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>AnchorNav</h2>
        <p className={styles.lede}>
          A list of the sections on one long page. Click a row to jump, and the caret follows the
          section in view. The menu variant is the same list in a popover.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="anchornav-master">
        <div className={styles.masterHeader}>
          <h2 id="anchornav-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Scroll the page beside the rail, or open the menu. The current row keeps the caret and
            the strong line.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                {variant === "menu" ? (
                  <div className={demo.stageMenu}>
                    <AnchorNav variant="menu" items={[...MENU]} offset={8} />
                    <Sections ids={MENU} />
                  </div>
                ) : (
                  <div className={demo.stage}>
                    <AnchorNav items={[...RAIL]} offset={8} />
                    <Sections ids={RAIL} />
                  </div>
                )}
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Variant</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Variant">
                    {VARIANTS.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.sizeTab} ${variant === step ? styles.sizeTabActive : ""}`}
                        aria-pressed={variant === step}
                        onClick={() => setVariant(step)}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass items whose ids match sections on the page. spy follows scroll. offset keeps
                  the jump clear of a sticky header. Use the menu variant on a narrow screen. AppNav
                  is for the product, Tabs switch views, and ProgressSteps is a flow.
                </p>
              </div>
              <CodeBlock code={'<AnchorNav variant="rail" items={[{ id: "details", label: "Details" }]} />'} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Menu</h2>
              <div className={styles.exampleCanvas}>
                <div className={demo.stageMenu}>
                  <AnchorNav variant="menu" ariaLabel="On this page" items={[...MENU]} offset={8} />
                  <Sections ids={MENU} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  variant=&quot;menu&quot; puts the same links in a popover. Escape closes it and
                  returns focus to the trigger.
                </p>
              </div>
              <CodeBlock code={'<AnchorNav variant="menu" items={sections} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
