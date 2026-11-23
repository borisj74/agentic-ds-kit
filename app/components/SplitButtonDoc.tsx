"use client";

import { useState } from "react";
import { Button, SplitButton } from "agentic-ds-kit";
import type { ButtonSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SAVE_CODE = [
  "<SplitButton",
  '  size="sm"',
  "  onClick={save}",
  "  onSelect={(id) => run(id)}",
  "  groups={[{ items: [",
  '    { id: "send", label: "Save and send", icon: "Send" },',
  '    { id: "draft", label: "Save as draft", icon: "FileText" },',
  '    { id: "copy", label: "Save a copy", icon: "Copy" },',
  "  ] }]}",
  ">",
  "  Save invoice",
  "</SplitButton>",
].join("\n");

const SIZES: ButtonSize[] = ["sm", "md", "lg"];

const SAVE_ACTIONS = [
  {
    items: [
      { id: "send", label: "Save and send", icon: "Send" },
      { id: "draft", label: "Save as draft", icon: "FileText" },
      { id: "copy", label: "Save a copy", icon: "Copy" },
    ],
  },
];

const ACTION_LABEL: Record<string, string> = {
  save: "Saved invoice",
  send: "Saved and sent",
  draft: "Saved as draft",
  copy: "Saved a copy",
};

export function SplitButtonDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [last, setLast] = useState<string | null>(null);
  const footer = (
    <>
      <div className={styles.previewRow}>
        <Button appearance="outline" mode="neutral" size="sm" onClick={() => setLast(null)}>
          Cancel
        </Button>
        <SplitButton size="sm" groups={SAVE_ACTIONS} onClick={() => setLast("save")} onSelect={setLast}>
          Save invoice
        </SplitButton>
      </div>
      <p className={styles.usageBody} aria-live="polite">
        {last ? ACTION_LABEL[last] : "Nothing saved yet"}
      </p>
    </>
  );

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>SplitButton</h2>
        <p className={styles.lede}>
          A main action joined to a chevron that opens the other actions. It composes a kit Button and a kit
          DropdownMenu. For actions only: FilterButton stays the split control for filters.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="splitbutton-master">
        <div className={styles.masterHeader}>
          <h2 id="splitbutton-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>An invoice footer: Cancel, and Save invoice with a menu.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>{footer}</div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The label runs the usual action. The chevron opens the rest and is named after the label, like
                  Save invoice options. It still counts as the one solid primary in the view.
                </p>
              </div>
              <CodeBlock code={SAVE_CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Save invoice</h2>
              <div className={styles.exampleCanvas}>{footer}</div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The label runs the usual action. The chevron opens the rest. Other actions in the row stay quiet,
                  so this is the one solid primary.
                </p>
          </div>
          <CodeBlock code={SAVE_CODE} />
        </section>

        <section className={styles.example}>
          <h2 className={styles.exampleTitle}>Sizes and appearances</h2>
          <div className={styles.exampleCanvas}>
            <div className={styles.previewRow}>
              {SIZES.map((size) => (
                <SplitButton key={size} size={size} appearance="outline" mode="neutral" groups={SAVE_ACTIONS}>
                  Save invoice
                </SplitButton>
              ))}
            </div>
            <div className={styles.previewRow}>
              <SplitButton appearance="soft" mode="neutral" groups={SAVE_ACTIONS}>
                Save invoice
              </SplitButton>
              <SplitButton appearance="outline" mode="neutral" groups={SAVE_ACTIONS} loading>
                Save invoice
              </SplitButton>
              <SplitButton appearance="outline" mode="neutral" groups={SAVE_ACTIONS} disabled>
                Save invoice
              </SplitButton>
            </div>
          </div>
          <div>
            <h3 className={styles.usageTitle}>Usage</h3>
            <p className={styles.usageBody}>
              Both parts use the control height: sm 32, md 36, lg 40, and the chevron part is a square.
              Appearance and mode are the Button ones. Loading applies to the main action; disabled applies to
              both parts.
            </p>
          </div>
          <CodeBlock
            code={[
              '<SplitButton appearance="outline" mode="neutral" groups={actions}>Save invoice</SplitButton>',
              '<SplitButton appearance="outline" mode="neutral" groups={actions} loading>Save invoice</SplitButton>',
              '<SplitButton appearance="outline" mode="neutral" groups={actions} disabled>Save invoice</SplitButton>',
            ].join("\n")}
          />
        </section>
          </div>
        )}
      </section>
    </div>
  );
}
