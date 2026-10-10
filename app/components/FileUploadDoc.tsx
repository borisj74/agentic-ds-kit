"use client";

import { useEffect, useRef, useState } from "react";
import { Field, FileUpload, Switch } from "agentic-ds-kit";
import type { FileUploadItem } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const PREVIEW_FILL = { maxWidth: "28rem" } as const;
const TICK_MS = 400;

const SEED: FileUploadItem[] = [
  { id: "seed-done", name: "brand-guidelines.pdf", size: 2_480_000, status: "done" },
  {
    id: "seed-error",
    name: "dashboard-export.png",
    size: 860_000,
    status: "error",
    error: "Upload failed. Check your connection and retry.",
  },
];

const STATES: FileUploadItem[] = [
  { id: "s1", name: "contract-signed.pdf", size: 1_120_000, progress: 40, status: "uploading" },
  { id: "s2", name: "logo.svg", size: 18_000, status: "done" },
  { id: "s3", name: "raw-footage.mov", size: 48_000_000, status: "error", error: "File is over 10 MB." },
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

function masterCode(multiple: boolean, disabled: boolean) {
  const lines = [
    "<FileUpload",
    '  accept=".pdf,image/*"',
    '  maxSizeLabel="SVG, PNG or PDF, max 10 MB"',
  ];
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
  const [multiple, setMultiple] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const master = useFakeUploads(SEED);
  const inField = useFakeUploads([]);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>FileUpload</h1>
        <p className={styles.lede}>
          Drop zone plus file rows with progress, done, and error. Presentational: the app does the
          upload and passes the state back. Rows compose kit Progress and Button. Not Dropzone or
          FileInput.
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
                    accept=".pdf,image/*"
                    maxSizeLabel="SVG, PNG or PDF, max 10 MB"
                    multiple={multiple}
                    disabled={disabled}
                    files={master.files}
                    onFilesSelected={master.add}
                    onRemove={master.remove}
                    onRetry={master.retry}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <Switch label="Multiple" size="sm" checked={multiple} onChange={setMultiple} />
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  onFilesSelected hands you File objects; start the upload, then feed progress,
                  status, and errors back through files. The drop zone is a button, so Tab and
                  Enter open the picker. Drag and drop is an extra.
                </p>
              </div>
              <CodeBlock code={masterCode(multiple, disabled)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Row states</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <FileUpload
                    maxSizeLabel="Any file, max 10 MB"
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
                  uploading shows a Progress bar and percent. done shows a check. error shows the
                  message, and a retry Button when onRetry is set. Icon plus text, never color
                  alone.
                </p>
              </div>
              <CodeBlock
                code={
                  'files={[\n  { id: "1", name: "contract-signed.pdf", size: 1120000, progress: 40, status: "uploading" },\n  { id: "2", name: "logo.svg", size: 18000, status: "done" },\n  { id: "3", name: "raw-footage.mov", size: 48000000, status: "error", error: "File is over 10 MB." },\n]}'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>In a Field</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field
                    label="Attachments"
                    htmlFor="doc-attachments"
                    hint="Add receipts for this expense."
                    error={inField.files.length === 0 ? "Add at least one receipt." : undefined}
                  >
                    <FileUpload
                      id="doc-attachments"
                      accept=".pdf,image/*"
                      maxSizeLabel="PNG, JPG or PDF, max 10 MB"
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
                  '<Field label="Attachments" htmlFor="attachments" error="Add at least one receipt.">\n  <FileUpload id="attachments" files={files} onFilesSelected={startUploads} onRemove={removeFile} />\n</Field>'
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
                  No picker, no drop. Row actions are disabled too.
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
