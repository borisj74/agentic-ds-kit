"use client";

import { useEffect, useRef, useState } from "react";
import { Field, FileUpload } from "agentic-ds-kit";
import type { FileUploadItem, FileUploadVariant } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, RadioControl, SwitchControl } from "./ControlsPanel";

const PREVIEW_FILL = { maxWidth: "28rem" } as const;
const TICK_MS = 400;

const VARIANTS: FileUploadVariant[] = ["zone", "compact"];
const LIMITS = "PDF or PNG, max 10 MB, up to 5 files";

const SEED: FileUploadItem[] = [
  { id: "seed-done", name: "invoice-nov-2026.pdf", size: 1_890_000, status: "done" },
  {
    id: "seed-error",
    name: "statement-q3.csv",
    size: 12_600_000,
    status: "error",
    error: "Over the 10 MB limit",
  },
];

const STATES: FileUploadItem[] = [
  { id: "s1", name: "invoice-nov-2026.pdf", size: 1_890_000, status: "done" },
  { id: "s2", name: "northwind-logo.png", size: 240_000, progress: 40, status: "uploading" },
  { id: "s3", name: "statement-q3.csv", size: 12_600_000, status: "error", error: "Over the 10 MB limit" },
];

/** Fake upload loop for the docs only: a timer moves progress. No network. */
function useFakeUploads(initial: FileUploadItem[]) {
  const [files, setFiles] = useState<FileUploadItem[]>(initial);
  const counter = useRef(0);
  const uploading = files.some((file) => file.status === "uploading");

  useEffect(() => {
    if (!uploading) return;
    const timer = window.setInterval(() => {
      setFiles((list) =>
        list.map((file) => {
          if (file.status !== "uploading") return file;
          const next = Math.min(100, (file.progress ?? 0) + 8 + Math.random() * 14);
          return next >= 100
            ? { ...file, progress: 100, status: "done" }
            : { ...file, progress: next };
        }),
      );
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [uploading]);

  const add = (picked: File[]) => {
    setFiles((list) => [
      ...list,
      ...picked.map((file) => {
        counter.current += 1;
        return {
          id: `pick-${counter.current}`,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "uploading" as const,
        };
      }),
    ]);
  };

  const remove = (id: string) => setFiles((list) => list.filter((file) => file.id !== id));

  const retry = (id: string) =>
    setFiles((list) =>
      list.map((file) =>
        file.id === id ? { ...file, status: "uploading", progress: 0, error: undefined } : file,
      ),
    );

  return { files, add, remove, retry };
}

function masterCode(variant: FileUploadVariant, multiple: boolean, disabled: boolean) {
  const lines = ["<FileUpload"];
  if (variant !== "zone") lines.push(`  variant="${variant}"`);
  lines.push('  accept=".pdf,image/png"', `  maxSizeLabel="${LIMITS}"`);
  if (!multiple) lines.push("  multiple={false}");
  if (disabled) lines.push("  disabled");
  lines.push(
    "  files={files}",
    "  onFilesSelected={startUploads}",
    "  onRemove={removeFile}",
    "  onRetry={retryFile}",
    "/>",
  );
  return lines.join("\n");
}

export function FileUploadDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [variant, setVariant] = useState<FileUploadVariant>("zone");
  const [multiple, setMultiple] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const master = useFakeUploads(SEED);
  const inField = useFakeUploads([]);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>FileUpload</h2>
        <p className={styles.lede}>
          A Choose files Button in a dashed drop zone, or on its own in the compact variant, plus
          file rows with progress, done, and error. Presentational: the app does the upload and
          passes the state back. Rows compose kit Progress and Button. Not Dropzone or FileInput.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="fileupload-master">
        <div className={styles.masterHeader}>
          <h2 id="fileupload-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Pick or drop files. A timer fakes progress here; there is no network. The error row
            retries.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <FileUpload
                    variant={variant}
                    accept=".pdf,image/png"
                    maxSizeLabel={LIMITS}
                    multiple={multiple}
                    disabled={disabled}
                    files={master.files}
                    onFilesSelected={master.add}
                    onRemove={master.remove}
                    onRetry={master.retry}
                  />
                </div>
              </div>
              <ControlsPanel>
                <RadioControl label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
                <SwitchControl
                  label="States"
                  items={[
                    { label: "Multiple", checked: multiple, onChange: setMultiple },
                    { label: "Disabled", checked: disabled, onChange: setDisabled },
                  ]}
                />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  onFilesSelected hands you File objects; start the upload, then feed progress,
                  status, and errors back through files. Choose files is a kit Button, so Tab and
                  Enter open the picker. Drag and drop is an extra. Put the limits in
                  maxSizeLabel so people see them before they pick.
                </p>
              </div>
              <CodeBlock code={masterCode(variant, multiple, disabled)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Row states</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <FileUpload
                    maxSizeLabel={LIMITS}
                    files={STATES}
                    onFilesSelected={() => undefined}
                    onRemove={() => undefined}
                    onRetry={() => undefined}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  uploading shows a Progress bar, Uploading and the percent. done shows a check and
                  Complete. error leads with an alert icon and shows the size and message, plus a
                  Retry Button when onRetry is set. Icon plus text, never color alone.
                </p>
              </div>
              <CodeBlock
                code={
                  'files={[\n  { id: "1", name: "invoice-nov-2026.pdf", size: 1890000, status: "done" },\n  { id: "2", name: "northwind-logo.png", size: 240000, progress: 40, status: "uploading" },\n  { id: "3", name: "statement-q3.csv", size: 12600000, status: "error", error: "Over the 10 MB limit" },\n]}'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Compact</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <FileUpload
                    variant="compact"
                    accept=".pdf,image/png"
                    maxSizeLabel={LIMITS}
                    onFilesSelected={() => undefined}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  For drawers and tight forms: the Choose files Button and the limits line on one
                  row. Files dropped on the row still land. Rows render below, the same as zone.
                </p>
              </div>
              <CodeBlock
                code={`<FileUpload variant="compact" maxSizeLabel="${LIMITS}" files={files} onFilesSelected={startUploads} />`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>In a Field</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field
                    label="Attachments"
                    htmlFor="doc-attachments"
                    hint="Files for the November Northwind invoice."
                    error={inField.files.length === 0 ? "Add at least one file" : undefined}
                  >
                    <FileUpload
                      id="doc-attachments"
                      accept=".pdf,image/png"
                      maxSizeLabel={LIMITS}
                      files={inField.files}
                      onFilesSelected={inField.add}
                      onRemove={inField.remove}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Field owns the label, hint, and error. Pass the same id as htmlFor. Field sets
                  describedBy and the error border.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Field label="Attachments" htmlFor="attachments" error="Add at least one file">\n  <FileUpload id="attachments" files={files} onFilesSelected={startUploads} onRemove={removeFile} />\n</Field>'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <FileUpload
                    disabled
                    maxSizeLabel="Uploads are closed for this period"
                    onFilesSelected={() => undefined}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  No picker, no drop. The Choose files Button and row actions are disabled too.
                </p>
              </div>
              <CodeBlock code={"<FileUpload disabled onFilesSelected={startUploads} />"} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
