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

export interface FileUploadProps {
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
}
