import type { ComponentPropsWithoutRef, Ref } from "react";

export type FileUploadStatus = "uploading" | "done" | "error";

/** zone: dashed drop area with a Choose files Button. compact: the Button and the limits line only, for drawers and tight forms. */
export type FileUploadVariant = "zone" | "compact";

export interface FileUploadItem {
  id: string;
  name: string;
  /** Bytes. Shown as KB / MB. */
  size: number;
  /** 0 to 100. Used while status is uploading. */
  progress?: number;
  status: FileUploadStatus;
  /** Shown when status is error. */
  error?: string;
}

/** Native button attributes the kit sets itself (or replaces with its own prop). */
type FileUploadOwnedKeys =
  | "children"
  | "type"
  | "onClick"
  | "onDragEnter"
  | "onDragOver"
  | "onDragLeave"
  | "onDrop"
  | "aria-disabled"
  | "aria-describedby"
  | "aria-invalid"
  | "draggable";

/**
 * The Choose files `<button>` is the focusable control: `ref` and other native attributes go to it.
 * `className` goes to the root wrapper. The hidden file `<input>` stays kit-owned.
 */
export interface FileUploadProps extends Omit<ComponentPropsWithoutRef<"button">, FileUploadOwnedKeys> {
  /** Choose files button id. Pass the same value as Field htmlFor. */
  id?: string;
  /** zone (default) or compact. Both accept dropped files. */
  variant?: FileUploadVariant;
  accept?: string;
  multiple?: boolean;
  /** Limits line, e.g. "PDF or PNG, max 10 MB, up to 5 files". */
  maxSizeLabel?: string;
  disabled?: boolean;
  onFilesSelected: (files: File[]) => void;
  files?: FileUploadItem[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  /** Set by Field. */
  describedBy?: string;
  /** Set by Field when it has an error. */
  error?: boolean;
  ref?: Ref<HTMLButtonElement>;
}
