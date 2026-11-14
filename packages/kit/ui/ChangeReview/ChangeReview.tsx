"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { Button } from "../Button";
import { ChangeSummary } from "../ChangeSummary";
import { Checkbox } from "../Checkbox";
import { CommentThread } from "../CommentThread";
import { Empty } from "../Empty";
import { Field } from "../Field";
import { InlineDiff } from "../InlineDiff";
import { Kbd } from "../Kbd";
import { ListView } from "../ListView";
import { Select } from "../Select";
import { cx } from "../shared/cx";
import {
  diffStatus,
  fileItems,
  fileName,
  lineCounts,
  lineTargets,
  neighbour,
  reviewKey,
  reviewSummary,
  stateWord,
  threadFor,
  undecided,
} from "./changeReview.logic";
import type { ChangeReviewProps } from "./ChangeReview.types";
import styles from "./ChangeReview.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  ChangeReviewProps,
  ChangeReviewFile,
  ChangeReviewFileKind,
  ChangeReviewVerdict,
  ChangeReviewComment,
} from "./ChangeReview.types";

/**
 * Block: review what an agent changed. ChangeSummary on top; the changed files (ListView, with
 * +/− counts and a reviewed state) beside the selected file's InlineDiff, its Reviewed checkbox,
 * Accept / Reject, and its comments (CommentThread, file or line). Accept all is the one solid
 * primary. J / K move between files and R marks the file reviewed while focus is in the block.
 */
export function ChangeReview(props: ChangeReviewProps) {
  const {
    files,
    summary,
    summaryTitle = "What this change does",
    summaryPeriod,
    comments = [],
    currentUserId,
    selectedFileId: selectedProp,
    defaultSelectedFileId,
    onSelectFile,
    onReviewedChange,
    onAccept,
    onReject,
    onAcceptAll,
    onComment,
    onEditComment,
    onDeleteComment,
    agent,
    title = "Change review",
    className,
    onKeyDown,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const fileHeadId = useId();
  const keysId = useId();
  const targetId = useId();
  const reviewedId = useId();
  const [innerSelected, setInnerSelected] = useState(defaultSelectedFileId ?? files[0]?.id);
  const selectedId = selectedProp ?? innerSelected;
  const file = files.find((item) => item.id === selectedId) ?? files[0];
  const [draft, setDraft] = useState("");
  const [lineTarget, setLineTarget] = useState("file");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const items = useMemo(() => fileItems(files), [files]);
  const thread = useMemo(() => (file ? threadFor(comments, file.id) : []), [comments, file]);
  const targets = useMemo(() => (file ? lineTargets(file) : []), [file]);
  const open = undecided(files).length;
  const reviewed = files.filter((item) => item.reviewed).length;

  function select(id: string | null) {
    if (!id || id === file?.id) return;
    if (selectedProp === undefined) setInnerSelected(id);
    // A draft belongs to the file it was written on.
    setDraft("");
    setLineTarget("file");
    setReplyTo(null);
    onSelectFile?.(id);
  }

  function toggleReviewed() {
    if (file) onReviewedChange?.(file.id, !file.reviewed);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const action = reviewKey(event.key.toLowerCase(), event.target as HTMLElement);
    if (!action) return;
    if (action === "reviewed") {
      if (!onReviewedChange) return;
      event.preventDefault();
      toggleReviewed();
      return;
    }
    const next = neighbour(files, file?.id, action === "next" ? 1 : -1);
    if (!next) return;
    event.preventDefault();
    select(next);
  }

  function post() {
    const body = draft.trim();
    if (!file || !body) return;
    onComment?.(file.id, body, {
      line: lineTarget === "file" ? undefined : Number(lineTarget),
      parentId: replyTo ?? undefined,
    });
    setDraft("");
    setReplyTo(null);
  }

  const counts = file ? lineCounts(file) : { additions: 0, deletions: 0 };
  const previous = neighbour(files, file?.id, -1);
  const next = neighbour(files, file?.id, 1);
  const position = file ? files.indexOf(file) + 1 : 0;
  const replyName = replyTo ? comments.find((comment) => comment.id === replyTo)?.author.name : undefined;

  return (
    <section
      {...rest} {...nisthaAttr("changereview", rest)}
      ref={ref}
      className={cx(styles.root, className)}
      aria-labelledby={titleId}
      aria-describedby={keysId}
      onKeyDown={handleKeyDown}
    >
      <header className={styles.head}>
        <div className={styles.heading}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.lead}>{reviewSummary(files, agent)}</p>
        </div>
        {onAcceptAll ? (
          <Button size="md" iconStart="CheckCheck" disabled={open === 0} onClick={onAcceptAll}>
            {open === 0 ? "All files decided" : `Accept all ${open} ${open === 1 ? "file" : "files"}`}
          </Button>
        ) : null}
      </header>

      {summary ? <ChangeSummary className={styles.summary} title={summaryTitle} period={summaryPeriod} items={summary} /> : null}

      <div className={cx("layout-split--secondary", styles.columns)}>
        <div className={styles.files}>
          <ListView
            label={`Changed files, ${files.length} · ${reviewed} reviewed`}
            size="sm"
            selection="single"
            selected={file ? [file.id] : []}
            onSelectedChange={(ids) => select(ids[0] ?? null)}
            truncate="both"
            items={items}
            empty={{ title: "No changed files", description: "Files the agent changes show here.", icon: "FileDiff", outlined: true }}
          />
          <p id={keysId} className={styles.keys}>
            <Kbd>J</Kbd> <Kbd>K</Kbd> next and previous file · <Kbd>R</Kbd> mark reviewed
          </p>
        </div>

        {file ? (
          <section className={styles.detail} aria-labelledby={fileHeadId}>
            <div className={styles.toolbar}>
              <div className={styles.fileHeading}>
                <h3 id={fileHeadId} className={styles.subtitle}>
                  {fileName(file.path)}
                </h3>
                <p className={styles.meta}>
                  File {position} of {files.length} · +{counts.additions} −{counts.deletions} · {stateWord(file)}
                </p>
              </div>
              <div className={styles.nav}>
                <Button
                  size="sm"
                  appearance="ghost"
                  mode="neutral"
                  iconStart="ChevronUp"
                  ariaLabel={previous ? `Previous file: ${fileName(files.find((item) => item.id === previous)!.path)}` : "Previous file"}
                  aria-keyshortcuts="K"
                  disabled={!previous}
                  onClick={() => select(previous)}
                />
                <Button
                  size="sm"
                  appearance="ghost"
                  mode="neutral"
                  iconStart="ChevronDown"
                  ariaLabel={next ? `Next file: ${fileName(files.find((item) => item.id === next)!.path)}` : "Next file"}
                  aria-keyshortcuts="J"
                  disabled={!next}
                  onClick={() => select(next)}
                />
              </div>
            </div>

            <div className={styles.decide}>
              {onReviewedChange ? (
                <Checkbox
                  id={reviewedId}
                  size="sm"
                  label="Reviewed"
                  checked={Boolean(file.reviewed)}
                  onChange={(checked) => onReviewedChange(file.id, checked)}
                  aria-keyshortcuts="R"
                />
              ) : null}
              <span className={styles.spacer} />
              {onReject ? (
                <Button
                  size="sm"
                  appearance="outline"
                  mode="danger"
                  iconStart="X"
                  aria-pressed={file.verdict === "rejected"}
                  onClick={() => onReject(file.id)}
                >
                  Reject file
                </Button>
              ) : null}
              {onAccept ? (
                <Button
                  size="sm"
                  appearance="outline"
                  mode="neutral"
                  iconStart="Check"
                  aria-pressed={file.verdict === "accepted"}
                  onClick={() => onAccept(file.id)}
                >
                  Accept file
                </Button>
              ) : null}
            </div>

            <InlineDiff
              title={file.kind === "added" ? "New file" : file.kind === "deleted" ? "Deleted file" : "Changes"}
              file={file.path}
              hunkHeader={file.hunkHeader}
              lines={file.lines}
              status={diffStatus(file)}
              resolvedSummary={`${file.path} · +${counts.additions} −${counts.deletions}`}
            />

            {onComment ? (
              <div className={styles.comments}>
                <Field label="Comment on" htmlFor={targetId}>
                  <Select id={targetId} size="sm" options={targets} value={lineTarget} onChange={(value) => setLineTarget(String(value))} />
                </Field>
                {replyName ? (
                  <p className={styles.replying}>
                    Replying to {replyName}
                    <Button size="sm" appearance="ghost" mode="neutral" onClick={() => setReplyTo(null)}>
                      Cancel reply
                    </Button>
                  </p>
                ) : null}
                <CommentThread
                  className={styles.thread}
                  title={`Comments on ${fileName(file.path)}`}
                  comments={thread}
                  currentUserId={currentUserId}
                  value={draft}
                  onValueChange={setDraft}
                  onSubmit={post}
                  submitAppearance={onAcceptAll ? "soft" : "solid"}
                  onReply={setReplyTo}
                  onEdit={onEditComment}
                  onDelete={onDeleteComment}
                  placeholder={lineTarget === "file" ? `Comment on ${fileName(file.path)}…` : `Comment on line ${lineTarget}…`}
                  emptyTitle="No comments on this file"
                  emptyDescription="Leave a note on the file or on one changed line."
                />
              </div>
            ) : null}
          </section>
        ) : (
          <Empty outlined icon="FileDiff" title="Nothing to review" description="The agent has not changed any files." />
        )}
      </div>
    </section>
  );
}
