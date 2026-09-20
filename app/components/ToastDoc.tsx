"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { Toast } from "agentic-ds-kit";
import type { ToastStatus } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const STATUSES: ToastStatus[] = ["info", "success", "warning", "danger"];

const COPY: Record<
  ToastStatus,
  { heading: string; title: string; description: string; actionLabel?: string; about: string }
> = {
  info: {
    heading: "Info",
    title: "Saved successfully",
    description: "Your changes have been saved.",
    actionLabel: "Undo",
    about: "Info counts down 5 seconds. Undo is still there. Point at the toast to pause.",
  },
  success: {
    heading: "Success",
    title: "Invoice sent",
    description: "INV-1042 went to billing@acme.com.",
    about: "Success counts down 5 seconds. Point at the toast to pause.",
  },
  warning: {
    heading: "Warning",
    title: "Sync delayed",
    description: "Changes will sync when you are back online.",
    about: "Warning counts down 5 seconds. Status colors the icon and the bar.",
  },
  danger: {
    heading: "Danger",
    title: "Couldn't delete",
    description: "The account still has open invoices.",
    actionLabel: "Try again",
    about: "Danger counts down 5 seconds. role=alert. Try again still runs before it closes.",
  },
};

const STAYS_OPEN = {
  heading: "Stays open",
  title: "Export ready",
  description: "Your report is ready to download.",
  actionLabel: "Download",
  about: "duration={null} keeps the toast until it is closed, with no countdown bar.",
} as const;

function toastCode(
  current: { title: string; description: string; actionLabel?: string },
  status: ToastStatus,
  durationNull = false,
) {
  const lines = [
    "<Toast",
    "  open={open}",
    "  onClose={() => setOpen(false)}",
    `  title="${current.title}"`,
    `  description="${current.description}"`,
  ];
  if (status !== "info") lines.push(`  status="${status}"`);
  if (current.actionLabel) {
    lines.push(`  actionLabel="${current.actionLabel}"`);
    lines.push("  onAction={onAction}");
  }
  if (durationNull) lines.push("  duration={null}");
  lines.push("/>");
  return lines.join("\n");
}

export function ToastDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [status, setStatus] = useState<ToastStatus>("info");
  const [masterOpen, setMasterOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState<Partial<Record<ToastStatus | "stays", boolean>>>({});
  const current = COPY[status];

  function closeAll() {
    setMasterOpen(false);
    setVariantOpen({});
  }

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Toast</h1>
        <p className={styles.lede}>
          A short note that floats in after an action, like Saved successfully, and goes away on
          its own after a few seconds, with an optional Undo.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="toast-master">
        <div className={styles.masterHeader}>
          <h2 id="toast-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Every status counts down 5 seconds. Point at the toast to pause. Pass duration null when
            it must stay until closed.
          </p>
          <DocTabList
            value={tab}
            onChange={(id) => {
              setTab(id as "preview" | "variants");
              closeAll();
            }}
          />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Button variant="secondary" size="md" onClick={() => setMasterOpen(true)}>
                    {`Show ${status} toast`}
                  </Button>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Status</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Status">
                    {STATUSES.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="toast-status"
                          value={option}
                          checked={status === option}
                          onChange={() => setStatus(option)}
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
                  Use Toast to confirm an action people just took, or to offer a quick Undo. Render
                  it with open and onClose, and set open when the action happens. It floats at the
                  bottom right; several stack. Status colors the icon and the bar. For messages that
                  must stay on the page, use Alert.
                </p>
              </div>
              <CodeBlock code={toastCode(current, status)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {STATUSES.map((option) => (
              <section key={option} className={styles.example}>
                <h2 className={styles.exampleTitle}>{COPY[option].heading}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={styles.previewRow}>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setVariantOpen((prev) => ({ ...prev, [option]: true }))}
                    >
                      {`Show ${option} toast`}
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{COPY[option].about}</p>
                </div>
                <CodeBlock code={toastCode(COPY[option], option)} />
              </section>
            ))}

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>{STAYS_OPEN.heading}</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setVariantOpen((prev) => ({ ...prev, stays: true }))}
                  >
                    Show toast
                  </Button>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>{STAYS_OPEN.about}</p>
              </div>
              <CodeBlock code={toastCode(STAYS_OPEN, "info", true)} />
            </section>
          </div>
        )}
      </section>

      <Toast
        key={status}
        open={masterOpen}
        onClose={() => setMasterOpen(false)}
        title={current.title}
        description={current.description}
        status={status}
        actionLabel={current.actionLabel}
        onAction={current.actionLabel ? () => setMasterOpen(false) : undefined}
      />
      {STATUSES.map((option) => (
        <Toast
          key={option}
          open={Boolean(variantOpen[option])}
          onClose={() => setVariantOpen((prev) => ({ ...prev, [option]: false }))}
          title={COPY[option].title}
          description={COPY[option].description}
          status={option}
          actionLabel={COPY[option].actionLabel}
          onAction={
            COPY[option].actionLabel
              ? () => setVariantOpen((prev) => ({ ...prev, [option]: false }))
              : undefined
          }
        />
      ))}
      <Toast
        open={Boolean(variantOpen.stays)}
        onClose={() => setVariantOpen((prev) => ({ ...prev, stays: false }))}
        title={STAYS_OPEN.title}
        description={STAYS_OPEN.description}
        actionLabel={STAYS_OPEN.actionLabel}
        onAction={() => setVariantOpen((prev) => ({ ...prev, stays: false }))}
        duration={null}
      />
    </div>
  );
}

export function ToastGalleryTile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Show toast
      </Button>
      <Toast
        open={open}
        onClose={() => setOpen(false)}
        title="Saved"
        description="Draft updated."
        status="success"
      />
    </>
  );
}
