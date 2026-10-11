import type { ComponentPropsWithoutRef, Ref } from "react";

export type FileUploadStatus = "uploading" | "done" | "error";

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
  | "aria-invalid";

/**
 * The drop zone `<button>` is the focusable control: `ref` and other native attributes go to it.
 * `className` goes to the root wrapper. The hidden file `<input>` stays kit-owned.
 */
export interface FileUploadProps extends Omit<ComponentPropsWithoutRef<"button">, FileUploadOwnedKeys> {
  /** Drop zone button id. Pass the same value as Field htmlFor. */
  id?: string;
  accept?: string;
  multiple?: boolean;
  /** Hint under the drop zone text, e.g. "SVG, PNG or PDF, max 10 MB". */
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
