import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ChangeItem } from "../ChangeSummary/ChangeSummary.types";
import type { CommentAuthor } from "../CommentThread/CommentThread.types";
import type { DiffLine } from "../InlineDiff/InlineDiff.types";

/** How the file changed. Sets the row icon and the words in its name. */
export type ChangeReviewFileKind = "added" | "modified" | "deleted";

/** The person's call on a file. */
export type ChangeReviewVerdict = "pending" | "accepted" | "rejected";

export interface ChangeReviewFile {
  id: string;
  /** Repo path, e.g. "src/middleware/rateLimit.ts". The row shows the file name and its folder. */
  path: string;
  kind?: ChangeReviewFileKind;
  /** InlineDiff lines (unified): { type: "context" | "add" | "remove", text, oldNo?, newNo? }[]. */
  lines: DiffLine[];
  /** e.g. "@@ -12,6 +12,14 @@ createApp". */
  hunkHeader?: string;
  /** Added / removed counts. Default: counted from `lines`. */
  additions?: number;
  deletions?: number;
  /** The person has read the file. Separate from accept / reject. */
  reviewed?: boolean;
  /** Default "pending". */
  verdict?: ChangeReviewVerdict;
}

/** A comment on one file, or on one line of it (`line` is the new line number, or the old one for a removed line). */
export interface ChangeReviewComment {
  id: string;
  fileId: string;
  line?: number;
  author: CommentAuthor;
  createdAt: string;
  body: string;
  edited?: boolean;
  /** Replies nest one level, as in CommentThread. */
  parentId?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type ChangeReviewOwnedKeys = "children" | "title" | "onSelect";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface ChangeReviewProps extends Omit<ComponentPropsWithoutRef<"section">, ChangeReviewOwnedKeys> {
  files: ChangeReviewFile[];
  /** What the change moves: ChangeSummary items (before → after, delta, sentiment). */
  summary?: ChangeItem[];
  /** ChangeSummary title. Default "What this change does". */
  summaryTitle?: string;
  /** ChangeSummary period line, e.g. "main → agent/rate-limit". */
  summaryPeriod?: string;
  comments?: ChangeReviewComment[];
  /** The signed-in reviewer: their comments get Edit and Delete. */
  currentUserId?: string;
  /** Controlled selected file id. */
  selectedFileId?: string;
  /** Uncontrolled starting file. Default the first file. */
  defaultSelectedFileId?: string;
  onSelectFile?: (fileId: string) => void;
  /** The Reviewed checkbox or the R key. */
  onReviewedChange?: (fileId: string, reviewed: boolean) => void;
  onAccept?: (fileId: string) => void;
  onReject?: (fileId: string) => void;
  /** Accept all: the view's one solid primary. Accepts every file not yet decided. */
  onAcceptAll?: () => void;
  /** A comment posted on the selected file; `line` when it was left on a line; `parentId` for a reply. */
  onComment?: (fileId: string, body: string, options: { line?: number; parentId?: string }) => void;
  onEditComment?: (commentId: string, body: string) => void;
  onDeleteComment?: (commentId: string) => void;
  /** Who made the change, e.g. "Backend agent". Used in the lead line. */
  agent?: string;
  /** Block heading. Default "Change review". */
  title?: string;
  ref?: Ref<HTMLElement>;
}
