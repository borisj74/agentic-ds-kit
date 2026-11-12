import type { KitIcon } from "../Button/lucideName";
import type { ThreadComment } from "../CommentThread/CommentThread.types";
import type { InlineDiffStatus } from "../InlineDiff/InlineDiff.types";
import type { ListViewItem } from "../ListView/ListView.types";
import type { ChangeReviewComment, ChangeReviewFile, ChangeReviewFileKind } from "./ChangeReview.types";

/** Pure helpers behind ChangeReview. No React here. */

const KIND_ICON: Record<ChangeReviewFileKind, KitIcon> = {
  added: "FilePlus",
  modified: "FileDiff",
  deleted: "FileMinus",
};

const KIND_WORD: Record<ChangeReviewFileKind, string> = {
  added: "New file",
  modified: "",
  deleted: "Deleted",
};

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/** Added and removed line counts: the file's own, else counted from its lines. */
export function lineCounts(file: ChangeReviewFile): { additions: number; deletions: number } {
  return {
    additions: file.additions ?? file.lines.filter((line) => line.type === "add").length,
    deletions: file.deletions ?? file.lines.filter((line) => line.type === "remove").length,
  };
}

/** "rateLimit.ts" from "src/middleware/rateLimit.ts". */
export function fileName(path: string): string {
  return path.split("/").pop() || path;
}

/** "src/middleware" from "src/middleware/rateLimit.ts"; "" at the root. */
export function folderOf(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/");
}

/** The file's review state in words: its verdict, else whether it was read. */
export function stateWord(file: ChangeReviewFile): string {
  if (file.verdict === "accepted") return "Accepted";
  if (file.verdict === "rejected") return "Rejected";
  return file.reviewed ? "Reviewed" : "Not reviewed";
}

/**
 * ListView rows, one per file. The secondary line carries the folder, the counts and the state,
 * so the row's accessible name says all of it (ListView names rows from primary + secondary).
 */
export function fileItems(files: ChangeReviewFile[]): ListViewItem[] {
  return files.map((file) => {
    const { additions, deletions } = lineCounts(file);
    const kind = file.kind ?? "modified";
    const secondary = [KIND_WORD[kind], folderOf(file.path) || "root", `+${additions} −${deletions}`, stateWord(file)]
      .filter(Boolean)
      .join(" · ");
    const badge =
      file.verdict === "accepted"
        ? { badge: "Accepted", badgeTone: "success" as const }
        : file.verdict === "rejected"
          ? { badge: "Rejected", badgeTone: "danger" as const }
          : file.reviewed
            ? { badge: "Reviewed", badgeTone: "neutral" as const }
            : {};
    return { id: file.id, primary: fileName(file.path), secondary, icon: KIND_ICON[kind], ...badge };
  });
}

/** The lead line: files, totals and how far the review has got. */
export function reviewSummary(files: ChangeReviewFile[], agent?: string): string {
  let additions = 0;
  let deletions = 0;
  for (const file of files) {
    const counts = lineCounts(file);
    additions += counts.additions;
    deletions += counts.deletions;
  }
  const reviewed = files.filter((file) => file.reviewed).length;
  const who = agent ? `${agent} changed ` : "";
  return `${who}${plural(files.length, "file")} · +${additions} −${deletions} · ${reviewed} of ${files.length} reviewed`;
}

/** Files still waiting for a verdict: what Accept all accepts. */
export function undecided(files: ChangeReviewFile[]): ChangeReviewFile[] {
  return files.filter((file) => (file.verdict ?? "pending") === "pending");
}

/** The file before (-1) or after (+1) the given one; null at either end. */
export function neighbour(files: ChangeReviewFile[], fileId: string | undefined, step: 1 | -1): string | null {
  const index = files.findIndex((file) => file.id === fileId);
  const next = files[index + step];
  return index === -1 || !next ? null : next.id;
}

/** InlineDiff status for a verdict: accepted and rejected render InlineDiff's one-line row. */
export function diffStatus(file: ChangeReviewFile): InlineDiffStatus {
  if (file.verdict === "accepted" || file.verdict === "rejected") return file.verdict;
  return file.lines.length ? "pending" : "empty";
}

/** CommentThread comments for one file. A line comment starts with its line, e.g. "Line 18 · …". */
export function threadFor(comments: ChangeReviewComment[], fileId: string): ThreadComment[] {
  return comments
    .filter((comment) => comment.fileId === fileId)
    .map(({ id, author, createdAt, body, edited, parentId, line }) => ({
      id,
      author,
      createdAt,
      edited,
      parentId,
      body: line !== undefined ? `Line ${line} · ${body}` : body,
    }));
}

/** Where a new comment goes: the whole file, or one changed line (new number, or old for a removal). */
export function lineTargets(file: ChangeReviewFile): { value: string; label: string }[] {
  const options = [{ value: "file", label: "Whole file" }];
  for (const line of file.lines) {
    if (line.type === "context") continue;
    const number = line.type === "add" ? line.newNo : line.oldNo;
    if (number === undefined) continue;
    const text = line.text.trim();
    const short = text.length > 40 ? `${text.slice(0, 39)}…` : text;
    options.push({ value: String(number), label: `Line ${number} ${line.type === "add" ? "+" : "−"} ${short}` });
  }
  return options;
}

/** Keys that drive the block while focus is in it, but never while typing. */
export function reviewKey(key: string, target: { tagName?: string; isContentEditable?: boolean } | null): "next" | "previous" | "reviewed" | null {
  const tag = target?.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) return null;
  if (key === "j") return "next";
  if (key === "k") return "previous";
  if (key === "r") return "reviewed";
  return null;
}
