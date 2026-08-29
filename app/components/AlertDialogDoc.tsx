"use client";

import { useState } from "react";
import { AlertDialog } from "@/ui/AlertDialog";
import type { AlertDialogActionVariant, AlertDialogSize } from "@/ui/AlertDialog";
import { Button } from "@/ui/Button";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: AlertDialogSize[] = ["sm", "md"];
const ACTION_VARIANTS: AlertDialogActionVariant[] = ["primary", "danger"];

const COPY: Record<
  AlertDialogActionVariant,
  { title: string; description: string; actionLabel: string; about: string; heading: string }
> = {
  primary: {
    heading: "Confirm",
    title: "Leave this page?",
    description: "You have unsaved changes. Continue without saving?",
    actionLabel: "Continue",
    about: "Use primary Continue when the choice is not destructive — they must still pick Cancel or Continue.",
  },
  danger: {
    heading: "Destructive",
    title: "Delete project?",
    description: "This cannot be undone.",
    actionLabel: "Delete",
    about: "Use danger Delete for irreversible actions. Cancel stays secondary. Overlay does not close it.",
  },
};

function dialogCode(variant: AlertDialogActionVariant, size: AlertDialogSize) {
  const current = COPY[variant];
  return [
    "<AlertDialog",
    "  open={open}",
    `  title="${current.title}"`,
    `  description="${current.description}"`,
    `  actionLabel="${current.actionLabel}"`,
    `  actionVariant="${variant}"`,
    `  size="${size}"`,
    "  onCancel={close}",
    "  onAction={confirm}",
    "/>",
  ].join("\n");
}

export function AlertDialogDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<AlertDialogSize>("md");
  const [actionVariant, setActionVariant] = useState<AlertDialogActionVariant>("primary");
  const [open, setOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState<AlertDialogActionVariant | null>(null);
  const current = COPY[actionVariant];
  const live = variantOpen ? COPY[variantOpen] : current;
  const liveVariant = variantOpen ?? actionVariant;
  const liveOpen = tab === "preview" ? open : variantOpen !== null;

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>AlertDialog</h1>
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
                  <Button variant="primary" size="md" onClick={() => setOpen(true)}>
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
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Alert for inline status. Use Modal when they can dismiss. Use AlertDialog when they
                  must choose. Escape cancels. Overlay does not close.
                </p>
              </div>
              <CodeBlock code={dialogCode(actionVariant, size)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {ACTION_VARIANTS.map((option) => (
              <section key={option} className={styles.example}>
                <h2 className={styles.exampleTitle}>{COPY[option].heading}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={styles.previewRow}>
                    <Button
                      variant={option === "danger" ? "danger" : "primary"}
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
                <CodeBlock code={dialogCode(option, "md")} />
              </section>
            ))}
          </div>
        )}
      </section>

      <AlertDialog
        open={liveOpen}
        title={live.title}
        description={live.description}
        actionLabel={live.actionLabel}
        actionVariant={liveVariant}
        size={size}
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
