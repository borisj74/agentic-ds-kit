"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { CircleAlert, CircleCheck, File as FileIcon } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import { Progress } from "../Progress";
import type { FileUploadItem, FileUploadProps } from "./FileUpload.types";
import { cx } from "../shared/cx";
import styles from "./FileUpload.module.css";
import { useKitLabels } from "../shared/labels";
import { nisthaAttr } from "../shared/inspect";

export type { FileUploadProps, FileUploadItem, FileUploadStatus, FileUploadVariant } from "./FileUpload.types";

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Mirrors the input accept attribute for dropped files (the picker already filters). */
function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return name.endsWith(rule);
      if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

function statusText(file: FileUploadItem): string {
  if (file.status === "done") return "Complete";
  if (file.status === "error") return file.error || "Upload failed";
  return "Uploading";
}

function FileRow({
  file,
  disabled,
  onRemove,
  onRetry,
}: {
  file: FileUploadItem;
  disabled: boolean;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
}) {
  const labels = useKitLabels();
  const rowId = useId();
  const percent = Math.round(Math.min(100, Math.max(0, file.progress ?? 0)));
  const size = formatSize(file.size);

  const failed = file.status === "error";
  const uploading = file.status === "uploading";

  return (
    <li className={styles.row} data-status={file.status}>
      <span className={cx(styles.fileIcon, failed && styles.failed)} aria-hidden>
        {failed ? (
          <CircleAlert size={16} strokeWidth={ICON_STROKE} />
        ) : (
          <FileIcon size={16} strokeWidth={ICON_STROKE} />
        )}
      </span>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span id={`${rowId}-name`} className={styles.name} title={file.name}>
            {file.name}
          </span>
          {uploading ? null : (
            <span className={cx(styles.detail, failed && styles.errorText)}>
              {size ? <span>{size}</span> : null}
              {size && failed ? <span aria-hidden>·</span> : null}
              {file.status === "done" ? (
                <CircleCheck size={16} className={styles.done} strokeWidth={ICON_STROKE} aria-hidden />
              ) : null}
              <span aria-live="polite">{statusText(file)}</span>
            </span>
          )}
        </div>
        {uploading ? (
          <div className={styles.progressRow}>
            <Progress value={percent} size="sm" ariaLabel={labels.uploading(file.name)} className={styles.progress} />
            <span className={styles.detail}>
              <span aria-live="polite">{statusText(file)}</span>
              <span aria-hidden>{percent}%</span>
            </span>
          </div>
        ) : null}
      </div>
      <div className={styles.actions}>
        {failed && onRetry ? (
          <Button
            appearance="outline"
            mode="neutral"
            size="sm"
            iconStart="RotateCcw"
            id={`${rowId}-retry`}
            aria-labelledby={`${rowId}-retry ${rowId}-name`}
            disabled={disabled}
            onClick={() => onRetry(file.id)}
            className={styles.retry}
          >
            {labels.retry}
          </Button>
        ) : null}
        {onRemove ? (
          <Button
            appearance="ghost"
            mode="neutral"
            size="sm"
            iconStart={uploading ? "X" : "Trash2"}
            ariaLabel={labels.removeFile(file.name)}
            disabled={disabled}
            onClick={() => onRemove(file.id)}
          />
        ) : null}
      </div>
    </li>
  );
}

export function FileUpload({
  id,
  variant = "zone",
  accept,
  multiple = true,
  maxSizeLabel,
  disabled = false,
  onFilesSelected,
  files = [],
  onRemove,
  onRetry,
  describedBy,
  error = false,
  className,
  ref,
  ...rest
}: FileUploadProps) {
  const labels = useKitLabels();
  const uid = useId();
  const zoneId = id ?? `${uid}-zone`;
  const hintId = `${uid}-hint`;
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const emit = (list: FileList | null) => {
    if (!list || disabled) return;
    let picked = Array.from(list).filter((file) => matchesAccept(file, accept));
    if (!multiple) picked = picked.slice(0, 1);
    if (picked.length > 0) onFilesSelected(picked);
  };

  const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes("Files");

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (disabled || !hasFiles(event)) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (disabled || !hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = () => {
    if (disabled) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    emit(event.dataTransfer.files);
  };

  const describedByIds = [hintId, describedBy].filter(Boolean).join(" ");
  const hint = maxSizeLabel ?? (multiple ? "Select one or more files" : "Select a file");
  const compact = variant === "compact";

  const chooseButton = (
    <Button
      {...rest}
      ref={ref}
      id={zoneId}
      appearance="outline"
      mode="neutral"
      size="sm"
      iconStart="Upload"
      disabled={disabled}
      aria-describedby={describedByIds}
      onClick={() => inputRef.current?.click()}
    >
      Choose files
    </Button>
  );

  return (
    <div {...nisthaAttr("fileupload")} className={cx(styles.root, className)}>
      <div
        className={cx(
          compact ? styles.compact : styles.zone,
          dragging && styles.dragging,
          error && styles.invalid,
        )}
        data-disabled={disabled || undefined}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {compact ? (
          <span className={styles.compactAction}>{chooseButton}</span>
        ) : dragging ? (
          <span className={styles.dropText}>Drop files here</span>
        ) : (
          <>
            <span className={styles.zoneAction}>{chooseButton}</span>
            <span className={styles.zoneText}>or drag and drop</span>
          </>
        )}
        <span id={hintId} className={styles.zoneHint}>
          {hint}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        className={styles.input}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          emit(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
      />
      {files.length > 0 ? (
        <ul className={styles.list} aria-label={labels.files}>
          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              disabled={disabled}
              onRemove={onRemove}
              onRetry={onRetry}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
