"use client";

import { useEffect, useState } from "react";
import { Button } from "agentic-ds-kit";
import { Toast } from "agentic-ds-kit";
import type { ToastSize, ToastStatus } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, RadioControl, SizeControl } from "./ControlsPanel";

const STATUSES: ToastStatus[] = ["info", "success", "warning", "danger"];
const SIZES: ToastSize[] = ["sm", "md", "lg"];

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
    description: "INV-1842 went to billing@northwind.com.",
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
    title: "Couldn't send reminders",
    description: "2 of 5 failed. The other 3 went out.",
    actionLabel: "Try again",
    about: "Danger stays open until it is closed, with no countdown bar. role=alert.",
  },
};

const PROGRESS = {
  heading: "Progress",
  title: "Exporting invoices",
  description: "Northwind, Q3. You can keep working.",
  about: "progress (0 to 100) shows a bar and keeps the toast open. When the work ends, clear progress and switch status to success; the 5 second countdown starts then.",
} as const;

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
  extra: { size?: ToastSize; timestamp?: string } = {},
) {
  const lines = [
    "<Toast",
    "  open={open}",
    "  onClose={() => setOpen(false)}",
    `  title="${current.title}"`,
    `  description="${current.description}"`,
  ];
  if (status !== "info") lines.push(`  status="${status}"`);
  if (extra.size && extra.size !== "md") lines.push(`  size="${extra.size}"`);
  if (extra.timestamp) lines.push(`  timestamp="${extra.timestamp}"`);
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
  const [size, setSize] = useState<ToastSize>("md");
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [masterOpen, setMasterOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState<Partial<Record<ToastStatus | "stays" | "progress", boolean>>>({});
  const current = COPY[status];

  // Demo only: advance the export, then hand over to a success countdown.
  useEffect(() => {
    if (progress === undefined) return undefined;
    const timer = window.setTimeout(() => setProgress(progress >= 100 ? undefined : progress + 20), 600);
    return () => window.clearTimeout(timer);
  }, [progress]);

  function showProgress() {
    setProgress(0);
    setVariantOpen((prev) => ({ ...prev, progress: true }));
  }

  function closeAll() {
    setMasterOpen(false);
    setVariantOpen({});
  }

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Toast</h2>
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
            Info, success and warning count down 5 seconds. Danger stays until closed. Point at the
            toast to pause. The stack shows at most three.
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
                  <Button appearance="outline" mode="neutral" size="md" onClick={() => setMasterOpen(true)}>
                    {`Show ${status} toast`}
                  </Button>
                </div>
              </div>
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
                <RadioControl label="Status" options={STATUSES} value={status} onChange={setStatus} />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Toast to confirm an action people just took, or to offer a quick Undo. Render
                  it with open and onClose, and set open when the action happens. It floats at the
                  bottom right; several stack. Status colors the icon and the bar. For messages that
                  must stay on the page, use Alert.
                </p>
              </div>
              <CodeBlock code={toastCode(current, status, false, { size, timestamp: "Now" })} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {STATUSES.map((option) => (
              <section key={option} className={styles.example}>
                <h2 className={styles.exampleTitle}>{COPY[option].heading}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={styles.previewRow}>
                    <Button
                      appearance="outline" mode="neutral"
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
              <h2 className={styles.exampleTitle}>{PROGRESS.heading}</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Button appearance="outline" mode="neutral" size="md" onClick={showProgress}>
                    Start export
                  </Button>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>{PROGRESS.about}</p>
              </div>
              <CodeBlock
                code={`<Toast\n  open={open}\n  onClose={() => setOpen(false)}\n  title={done ? "Export ready" : "${PROGRESS.title}"}\n  status={done ? "success" : "info"}\n  progress={done ? undefined : percent}\n/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>{STAYS_OPEN.heading}</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Button
                    appearance="outline" mode="neutral"
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
        size={size}
        timestamp="Now"
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
        open={Boolean(variantOpen.progress)}
        onClose={() => {
          setProgress(undefined);
          setVariantOpen((prev) => ({ ...prev, progress: false }));
        }}
        title={progress === undefined ? "Export ready" : PROGRESS.title}
        description={progress === undefined ? "invoices-q3.csv is in Downloads." : PROGRESS.description}
        status={progress === undefined ? "success" : "info"}
        progress={progress}
      />
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
      <Button appearance="outline" mode="neutral" size="sm" onClick={() => setOpen(true)}>
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
