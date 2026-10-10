"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { CircleAlert, CircleCheck, File as FileIcon, Upload } from "lucide-react";
import { Button } from "../Button";
import { Progress } from "../Progress";
import type { FileUploadItem, FileUploadProps } from "./FileUpload.types";
import styles from "./FileUpload.module.css";

export type { FileUploadProps, FileUploadItem, FileUploadStatus } from "./FileUpload.types";

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
  const percent = Math.round(Math.min(100, Math.max(0, file.progress ?? 0)));
  const size = formatSize(file.size);

  return (
    <li className={`${styles.row} ${file.status === "error" ? styles.rowError : ""}`}>
      <span className={styles.fileIcon} aria-hidden>
        <FileIcon size={20} />
      </span>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.name} title={file.name}>
            {file.name}
          </span>
          <span className={styles.detail}>
            {size ? <span>{size}</span> : null}
            {file.status === "done" ? (
              <CircleCheck size={14} className={styles.done} aria-hidden />
            ) : null}
            {file.status === "error" ? (
              <CircleAlert size={14} className={styles.failed} aria-hidden />
            ) : null}
            <span
              className={file.status === "error" ? styles.errorText : undefined}
              aria-live="polite"
            >
              {statusText(file)}
            </span>
            {file.status === "uploading" ? <span aria-hidden>{percent}%</span> : null}
          </span>
        </div>
        {file.status === "uploading" ? (
          <Progress value={percent} size="sm" ariaLabel={`Uploading ${file.name}`} />
        ) : null}
      </div>
      <div className={styles.actions}>
        {file.status === "error" && onRetry ? (
          <Button
            variant="tertiary"
            size="sm"
            iconStart="RotateCcw"
            ariaLabel={`Retry ${file.name}`}
            disabled={disabled}
            onClick={() => onRetry(file.id)}
          />
        ) : null}
        {onRemove ? (
          <Button
            variant="tertiary"
            size="sm"
            iconStart={file.status === "uploading" ? "X" : "Trash2"}
            ariaLabel={`Remove ${file.name}`}
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
}: FileUploadProps) {
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

  const onDragEnter = (event: DragEvent<HTMLButtonElement>) => {
    if (disabled || !hasFiles(event)) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };

  const onDragOver = (event: DragEvent<HTMLButtonElement>) => {
    if (disabled || !hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = () => {
    if (disabled) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    emit(event.dataTransfer.files);
  };

  const describedByIds = [hintId, describedBy].filter(Boolean).join(" ");

  return (
    <div className={styles.root}>
      <button
        type="button"
        id={zoneId}
        className={[
          styles.zone,
          dragging ? styles.dragging : "",
          error ? styles.invalid : "",
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        aria-describedby={describedByIds}
        aria-invalid={error || undefined}
        onClick={() => inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <span className={styles.zoneIcon} aria-hidden>
          <Upload size={20} />
        </span>
        <span className={styles.zoneText}>
          <span className={styles.zoneAction}>Click to upload</span> or drag and drop
        </span>
        <span id={hintId} className={styles.zoneHint}>
          {maxSizeLabel ?? (multiple ? "Select one or more files" : "Select a file")}
        </span>
      </button>
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
        <ul className={styles.list} aria-label="Files">
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
