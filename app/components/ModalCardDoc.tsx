"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { ButtonGroup } from "agentic-ds-kit";
import { ModalCard } from "agentic-ds-kit";
import type { ModalCardSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: ModalCardSize[] = ["sm", "md", "lg"];
const BODY = "Update the name and email on this profile. Changes apply on save.";

function masterCode(size: ModalCardSize, showDescription: boolean, showClose: boolean) {
  const lines = [
    "<ModalCard",
    '  title="Edit profile"',
  ];
  if (showDescription) {
    lines.push('  description="Make changes to your profile here."');
  }
  lines.push(`  size="${size}"`);
  if (showClose) lines.push("  onClose={close}");
  lines.push(
    "  footer={",
    '    <ButtonGroup ariaLabel="Modal actions">',
    '      <Button variant="secondary">Cancel</Button>',
    '      <Button variant="primary">Save</Button>',
    "    </ButtonGroup>",
    "  }",
    ">",
    "  Update the name and email on this profile. Changes apply on save.",
    "</ModalCard>",
  );
  return lines.join("\n");
}

function Footer() {
  return (
    <ButtonGroup ariaLabel="Modal actions">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save</Button>
    </ButtonGroup>
  );
}

export function ModalCardDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ModalCardSize>("md");
  const [showDescription, setShowDescription] = useState(true);
  const [showClose, setShowClose] = useState(true);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>ModalCard</h1>
        <p className={styles.lede}>
          Panel chrome for a modal. Not Card. Not InsightCard. Overlay behavior is Modal.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="modalcard-master">
        <div className={styles.masterHeader}>
          <h2 id="modalcard-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            The panel on the canvas. Switch size, description, and close. No overlay.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <ModalCard
                  title="Edit profile"
                  description={showDescription ? "Make changes to your profile here." : undefined}
                  size={size}
                  onClose={showClose ? () => {} : undefined}
                  footer={<Footer />}
                >
                  {BODY}
                </ModalCard>
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
                  <Switch size="sm" label="Description" checked={showDescription} onChange={setShowDescription} />
                  <Switch size="sm" label="Close" checked={showClose} onChange={setShowClose} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Modal always composes ModalCard. Use ModalCard on its own in the catalog, or when a
                  surface needs the same chrome without an overlay. Use Card for a page tile.
                </p>
              </div>
              <CodeBlock code={masterCode(size, showDescription, showClose)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <ModalCard key={step} title={`${step} panel`} size={step} footer={<Footer />}>
                      {BODY}
                    </ModalCard>
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>sm, md, and lg. Default is md.</p>
              </div>
              <CodeBlock
                code={`<ModalCard title="Edit profile" size="sm">...</ModalCard>\n<ModalCard title="Edit profile" size="md">...</ModalCard>\n<ModalCard title="Edit profile" size="lg">...</ModalCard>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With description</h2>
              <div className={styles.exampleCanvas}>
                <ModalCard
                  title="Edit profile"
                  description="Make changes to your profile here."
                  footer={<Footer />}
                >
                  {BODY}
                </ModalCard>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Description is optional supporting copy under the title.</p>
              </div>
              <CodeBlock
                code={`<ModalCard title="Edit profile" description="Make changes to your profile here.">\n  ...\n</ModalCard>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Without description</h2>
              <div className={styles.exampleCanvas}>
                <ModalCard title="Edit profile" footer={<Footer />}>
                  {BODY}
                </ModalCard>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Title and body only when extra copy is not needed.</p>
              </div>
              <CodeBlock code={`<ModalCard title="Edit profile">\n  ...\n</ModalCard>`} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With footer</h2>
              <div className={styles.exampleCanvas}>
                <ModalCard title="Edit profile" footer={<Footer />}>
                  {BODY}
                </ModalCard>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Footer is kit Buttons in a ButtonGroup. No divider.</p>
              </div>
              <CodeBlock
                code={`<ModalCard\n  title="Edit profile"\n  footer={\n    <ButtonGroup ariaLabel="Modal actions">\n      <Button variant="secondary">Cancel</Button>\n      <Button variant="primary">Save</Button>\n    </ButtonGroup>\n  }\n>\n  ...\n</ModalCard>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Without footer</h2>
              <div className={styles.exampleCanvas}>
                <ModalCard title="Edit profile" onClose={() => {}}>
                  {BODY}
                </ModalCard>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Omit footer when the body or close is enough.</p>
              </div>
              <CodeBlock
                code={`<ModalCard title="Edit profile" onClose={close}>\n  ...\n</ModalCard>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With close</h2>
              <div className={styles.exampleCanvas}>
                <ModalCard title="Edit profile" onClose={() => {}} footer={<Footer />}>
                  {BODY}
                </ModalCard>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>The X renders only when onClose is passed.</p>
              </div>
              <CodeBlock
                code={`<ModalCard title="Edit profile" onClose={close} footer={footer}>\n  ...\n</ModalCard>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Without close</h2>
              <div className={styles.exampleCanvas}>
                <ModalCard title="Edit profile" footer={<Footer />}>
                  {BODY}
                </ModalCard>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>No onClose means no X. Footer still has Cancel.</p>
              </div>
              <CodeBlock
                code={`<ModalCard title="Edit profile" footer={footer}>\n  ...\n</ModalCard>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
