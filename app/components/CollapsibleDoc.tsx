"use client";

import { useState } from "react";
import { Badge } from "@/ui/Badge";
import { Card } from "@/ui/Card";
import { Collapsible } from "@/ui/Collapsible";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const MASTER_TRIGGER = "Product details";

const CLOSED_CODE = `<Collapsible trigger="Product details">
  <p>SKU FL-204. Natural oak, 120 × 80 cm.</p>
  <p>Made to order. Lead time two weeks.</p>
</Collapsible>`;

const OPEN_CODE = `<Collapsible trigger="Product details" defaultOpen>
  <p>SKU FL-204. Natural oak, 120 × 80 cm.</p>
  <p>Made to order. Lead time two weeks.</p>
</Collapsible>`;

const EXTRA_CODE = `<Collapsible trigger="Extra details" defaultOpen>
  <Badge tone="info">In stock</Badge>
  <p>Walnut finish. Ships from Belgrade.</p>
</Collapsible>`;

const CARD_CODE = `<Card>
  <Collapsible trigger="Order #4189" defaultOpen>
    <Badge tone="success">Shipped</Badge>
    <p>Left the studio this morning. Tracking updates in the next hour.</p>
  </Collapsible>
</Card>`;

function masterCode() {
  return [
    "<Collapsible",
    `  trigger="${MASTER_TRIGGER}"`,
    "  open={open}",
    "  onOpenChange={setOpen}",
    ">",
    "  <p>SKU FL-204. Natural oak, 120 × 80 cm.</p>",
    "  <p>Made to order. Lead time two weeks.</p>",
    "</Collapsible>",
  ].join("\n");
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
            One disclosure. Compose kit pieces in the body. Not Accordion.
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
                    <p>SKU FL-204. Natural oak, 120 × 80 cm.</p>
                    <p>Made to order. Lead time two weeks.</p>
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
                  One panel. Use Accordion when two or more related sections open one at a time. Use
                  Tabs for peer views. Compose kit Badge, Field, or Card in children — never a local
                  cousin.
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
                  <Collapsible trigger="Product details">
                    <p>SKU FL-204. Natural oak, 120 × 80 cm.</p>
                    <p>Made to order. Lead time two weeks.</p>
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
                  <Collapsible trigger="Product details" defaultOpen>
                    <p>SKU FL-204. Natural oak, 120 × 80 cm.</p>
                    <p>Made to order. Lead time two weeks.</p>
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
              <h2 className={styles.exampleTitle}>Extra details</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Collapsible trigger="Extra details" defaultOpen>
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

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With Card</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Card>
                    <Collapsible trigger="Order #4189" defaultOpen>
                      <Badge tone="success">Shipped</Badge>
                      <p>Left the studio this morning. Tracking updates in the next hour.</p>
                    </Collapsible>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Nest Collapsible in kit Card. Badge lives in the body, not the trigger row.
                </p>
              </div>
              <CodeBlock code={CARD_CODE} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
