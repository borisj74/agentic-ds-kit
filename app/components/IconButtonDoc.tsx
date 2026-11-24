"use client";

import { useState } from "react";
import { ButtonGroup, IconButton } from "agentic-ds-kit";
import type { ButtonSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const TOOLBAR_CODE = [
  '<ButtonGroup ariaLabel="Invoice actions">',
  '  <IconButton appearance="outline" mode="neutral" icon="Download" ariaLabel="Download" />',
  '  <IconButton appearance="outline" mode="neutral" icon="Ellipsis" ariaLabel="More" />',
  '  <IconButton appearance="outline" mode="neutral" icon="Plus" ariaLabel="Add invoice" />',
  "</ButtonGroup>",
].join("\n");

function Toolbar() {
  return (
    <ButtonGroup ariaLabel="Invoice actions">
      <IconButton appearance="outline" mode="neutral" icon="Download" ariaLabel="Download" />
      <IconButton appearance="outline" mode="neutral" icon="Ellipsis" ariaLabel="More" />
      <IconButton appearance="outline" mode="neutral" icon="Plus" ariaLabel="Add invoice" />
    </ButtonGroup>
  );
}

const SIZES: ButtonSize[] = ["sm", "md", "lg"];

export function IconButtonDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>IconButton</h2>
        <p className={styles.lede}>
          A kit Button with an icon and no label. It is a typed export of Button, so it looks the same and takes
          the same appearance, mode and size. The icon and ariaLabel are required.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="iconbutton-master">
        <div className={styles.masterHeader}>
          <h2 id="iconbutton-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>An invoice toolbar: Download, More and Add invoice.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Toolbar />
                </div>
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Each IconButton has an ariaLabel that names the action. Join related icon actions in a
                  ButtonGroup. When the icon alone could be misread, use a Button with a label.
                </p>
              </div>
              <CodeBlock code={TOOLBAR_CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Toolbar</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Toolbar />
                </div>
          </div>
          <div>
            <h3 className={styles.usageTitle}>Usage</h3>
            <p className={styles.usageBody}>
              Download, More and Add invoice. Each one has an ariaLabel that names the action. Join related icon
              actions in a ButtonGroup.
            </p>
          </div>
          <CodeBlock code={TOOLBAR_CODE} />
        </section>

        <section className={styles.example}>
          <h2 className={styles.exampleTitle}>Sizes</h2>
          <div className={styles.exampleCanvas}>
            <div className={styles.previewRow}>
              {SIZES.map((size) => (
                <IconButton
                  key={size}
                  size={size}
                  appearance="outline"
                  mode="neutral"
                  icon="Plus"
                  ariaLabel={`Add invoice, ${size}`}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className={styles.usageTitle}>Usage</h3>
            <p className={styles.usageBody}>
              A square of the control height: sm 32, md 36, lg 40. It lines up with a Button, Input, Select or
              FilterButton of the same size.
            </p>
          </div>
          <CodeBlock
            code={SIZES.map(
              (size) =>
                `<IconButton size="${size}" appearance="outline" mode="neutral" icon="Plus" ariaLabel="Add invoice" />`,
            ).join("\n")}
          />
        </section>

        <section className={styles.example}>
          <h2 className={styles.exampleTitle}>Appearances and states</h2>
          <div className={styles.exampleCanvas}>
            <div className={styles.previewRow}>
              <IconButton appearance="ghost" mode="neutral" icon="Download" ariaLabel="Download" />
              <IconButton appearance="soft" mode="neutral" icon="Download" ariaLabel="Download" />
              <IconButton appearance="outline" mode="danger" icon="Trash2" ariaLabel="Delete invoice" />
              <IconButton appearance="outline" mode="neutral" icon="Download" ariaLabel="Download" loading />
              <IconButton appearance="outline" mode="neutral" icon="Download" ariaLabel="Download" disabled />
            </div>
          </div>
          <div>
            <h3 className={styles.usageTitle}>Usage</h3>
            <p className={styles.usageBody}>
              Ghost is the quiet toolbar look. While loading, the spinner takes the place of the icon and the
              button keeps its name and its size.
            </p>
          </div>
          <CodeBlock
            code={[
              '<IconButton appearance="ghost" mode="neutral" icon="Download" ariaLabel="Download" />',
              '<IconButton appearance="outline" mode="danger" icon="Trash2" ariaLabel="Delete invoice" />',
              '<IconButton appearance="outline" mode="neutral" icon="Download" ariaLabel="Download" loading />',
            ].join("\n")}
          />
        </section>
          </div>
        )}
      </section>
    </div>
  );
}
