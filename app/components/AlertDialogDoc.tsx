"use client";

import { useState } from "react";
import { AlertDialog } from "agentic-ds-kit";
import type { AlertDialogActionVariant, AlertDialogSize, ModalCardTone } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: AlertDialogSize[] = ["sm", "md"];
const ACTION_VARIANTS: AlertDialogActionVariant[] = ["primary", "danger"];
type Example = AlertDialogActionVariant | "typed";
const EXAMPLES: Example[] = ["primary", "danger", "typed"];

interface Copy {
  heading: string;
  title: string;
  description: string;
  actionLabel: string;
  actionVariant: AlertDialogActionVariant;
  about: string;
  tone?: ModalCardTone;
  eyebrow?: string;
  cancelLabel?: string;
  consequences?: string[];
  confirmText?: string;
}

const COPY: Record<Example, Copy> = {
  primary: {
    heading: "Confirm",
    title: "Leave this page?",
    description: "You have unsaved changes to INV-2042.",
    actionLabel: "Leave page",
    actionVariant: "primary",
    eyebrow: "Invoices",
    about: "Use primary when the choice is not destructive. They still pick Cancel or the action.",
  },
  danger: {
    heading: "Destructive",
    title: "Disconnect Stripe?",
    description: "Syncing stops right away. Invoices already in the ledger stay. You can reconnect later.",
    actionLabel: "Disconnect",
    actionVariant: "danger",
    tone: "warning",
    eyebrow: "Integrations",
    cancelLabel: "Keep connected",
    about: "danger replaces the primary. The tone shows as an icon and a word. Focus starts on Keep connected; the overlay does not close it.",
  },
  typed: {
    heading: "Type to confirm",
    title: "Delete workspace?",
    description: "Northwind and its 1,284 invoices are removed for everyone.",
    actionLabel: "Delete workspace",
    actionVariant: "danger",
    tone: "warning",
    eyebrow: "Workspace",
    consequences: ["Stripe and QuickBooks disconnect.", "Exports you already downloaded stay on your computer."],
    confirmText: "northwind",
    about: "consequences list what happens. confirmText keeps the action off until it is typed; focus starts in that field.",
  },
};

function dialogCode(example: Example, size: AlertDialogSize) {
  const current = COPY[example];
  const lines = ["<AlertDialog", "  open={open}", `  size="${size}"`];
  if (current.tone) lines.push(`  tone="${current.tone}"`);
  if (current.eyebrow) lines.push(`  eyebrow="${current.eyebrow}"`);
  lines.push(`  title="${current.title}"`, `  description="${current.description}"`);
  if (current.consequences) lines.push(`  consequences={${JSON.stringify(current.consequences)}}`);
  if (current.confirmText) lines.push(`  confirmText="${current.confirmText}"`);
  if (current.cancelLabel) lines.push(`  cancelLabel="${current.cancelLabel}"`);
  lines.push(`  actionLabel="${current.actionLabel}"`, `  actionVariant="${current.actionVariant}"`, "  onCancel={close}", "  onAction={confirm}", "/>");
  return lines.join("\n");
}

export function AlertDialogDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<AlertDialogSize>("sm");
  const [actionVariant, setActionVariant] = useState<AlertDialogActionVariant>("danger");
  const [open, setOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState<Example | null>(null);
  const live = COPY[variantOpen ?? actionVariant];
  const liveOpen = tab === "preview" ? open : variantOpen !== null;

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>AlertDialog</h2>
        <p className={styles.lede}>Must-choose overlay. Not Alert. Not Modal.</p>
      </header>

      <section className={styles.master} aria-labelledby="alertdialog-master">
        <div className={styles.masterHeader}>
          <h2 id="alertdialog-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Open the dialog, then switch size and action variant. Escape cancels. Overlay click does not.
          </p>
          <DocTabList
            value={tab}
            onChange={(id) => {
              setTab(id as "preview" | "variants");
              if (id === "preview") setVariantOpen(null);
              else setOpen(false);
            }}
          />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Button appearance="solid" mode="primary" size="md" onClick={() => setOpen(true)}>
                    Show dialog
                  </Button>
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
                  <span className={styles.panelLabel}>Action variant</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Action variant">
                    {ACTION_VARIANTS.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="alertdialog-action-variant"
                          value={option}
                          checked={actionVariant === option}
                          onChange={() => setActionVariant(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Alert for inline status. Use Modal when they can dismiss. Use AlertDialog when they
                  must choose. Escape cancels. Overlay does not close.
                </p>
              </div>
              <CodeBlock code={dialogCode(actionVariant, size)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {EXAMPLES.map((option) => (
              <section key={option} className={styles.example}>
                <h2 className={styles.exampleTitle}>{COPY[option].heading}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={styles.previewRow}>
                    <Button
                      appearance="solid"
                      mode={COPY[option].actionVariant}
                      size="md"
                      onClick={() => setVariantOpen(option)}
                    >
                      Show dialog
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{COPY[option].about}</p>
                </div>
                <CodeBlock code={dialogCode(option, option === "typed" ? "md" : "sm")} />
              </section>
            ))}
          </div>
        )}
      </section>

      <AlertDialog
        open={liveOpen}
        title={live.title}
        description={live.description}
        tone={live.tone}
        eyebrow={live.eyebrow}
        consequences={live.consequences}
        confirmText={live.confirmText}
        cancelLabel={live.cancelLabel}
        actionLabel={live.actionLabel}
        actionVariant={live.actionVariant}
        size={variantOpen === "typed" ? "md" : variantOpen ? "sm" : size}
        onCancel={() => {
          setOpen(false);
          setVariantOpen(null);
        }}
        onAction={() => {
          setOpen(false);
          setVariantOpen(null);
        }}
      />
    </div>
  );
}
