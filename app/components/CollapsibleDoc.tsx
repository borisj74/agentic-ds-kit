"use client";

import { useState } from "react";
import { Badge } from "@/ui/Badge";
import { Collapsible } from "@/ui/Collapsible";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import demo from "./CollapsibleDoc.module.css";

const MASTER_TRIGGER = "Order #4189";

const CLOSED_CODE = `<Collapsible trigger="Order #4189">
  {children}
</Collapsible>`;

const OPEN_CODE = `<Collapsible trigger="Order #4189" defaultOpen>
  {children}
</Collapsible>`;

const EXTRA_CODE = `<Collapsible trigger="Product details" defaultOpen>
  <Badge tone="info">In stock</Badge>
  <p>Walnut finish. Ships from Belgrade.</p>
</Collapsible>`;

function masterCode() {
  return [
    "<Collapsible",
    `  trigger="${MASTER_TRIGGER}"`,
    "  open={open}",
    "  onOpenChange={setOpen}",
    ">",
    "  {children}",
    "</Collapsible>",
  ].join("\n");
}

function OrderRows() {
  return (
    <>
      <div className={demo.row}>
        <span className={demo.label}>Status</span>
        <span className={demo.value}>Shipped</span>
      </div>
      <div className={`${demo.row} ${demo.stack}`}>
        <span className={demo.kicker}>Shipping address</span>
        <span className={demo.copy}>100 Market St, San Francisco</span>
      </div>
      <div className={`${demo.row} ${demo.stack}`}>
        <span className={demo.kicker}>Items</span>
        <span className={demo.copy}>2x Studio Headphones</span>
      </div>
    </>
  );
}

export function CollapsibleDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [open, setOpen] = useState(true);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Collapsible</h1>
        <p className={styles.lede}>Single show/hide panel. Accordion is the one-open list.</p>
      </header>

      <section className={styles.master} aria-labelledby="collapsible-master">
        <div className={styles.masterHeader}>
          <h2 id="collapsible-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Title on the left. ChevronsUpDown toggles the body. Not Accordion.
          </p>
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
                <div className={styles.previewFill}>
                  <Collapsible trigger={MASTER_TRIGGER} open={open} onOpenChange={setOpen}>
                    <OrderRows />
                  </Collapsible>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Open</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Open">
                    <button
                      type="button"
                      className={`${styles.sizeTab} ${open ? styles.sizeTabActive : ""}`}
                      aria-pressed={open}
                      onClick={() => setOpen(true)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className={`${styles.sizeTab} ${!open ? styles.sizeTabActive : ""}`}
                      aria-pressed={!open}
                      onClick={() => setOpen(false)}
                    >
                      Closed
                    </button>
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One panel. The title is not the button. Use Accordion when two or more related
                  sections open one at a time. Compose kit pieces in children — never a local cousin.
                </p>
              </div>
              <CodeBlock code={masterCode()} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Closed</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Collapsible trigger="Order #4189">
                    <OrderRows />
                  </Collapsible>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Starts shut. defaultOpen is false.</p>
              </div>
              <CodeBlock code={CLOSED_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Open</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Collapsible trigger="Order #4189" defaultOpen>
                    <OrderRows />
                  </Collapsible>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>defaultOpen shows the body on first paint.</p>
              </div>
              <CodeBlock code={OPEN_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Product details</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Collapsible trigger="Product details" defaultOpen>
                    <Badge tone="info">In stock</Badge>
                    <p>Walnut finish. Ships from Belgrade.</p>
                  </Collapsible>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Compose kit Badge in children. Trigger stays a string.
                </p>
              </div>
              <CodeBlock code={EXTRA_CODE} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
