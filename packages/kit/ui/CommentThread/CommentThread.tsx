"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AtSign, MessageCircle } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { AlertDialog } from "../AlertDialog";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { Textarea } from "../Textarea";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type { CommentThreadProps, ThreadComment } from "./CommentThread.types";
import styles from "./CommentThread.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { CommentThreadProps, ThreadComment, CommentAuthor } from "./CommentThread.types";

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

/**
 * One conversation on a document, invoice or task: comments, one level of replies, in-place edit, and a
 * composer. Not the assistant Chat. Built on kit Avatar, Textarea, Button and AlertDialog.
 */
export function CommentThread({
  title,
  comments,
  currentUserId,
  value,
  onValueChange,
  onSubmit,
  submitting = false,
  submitAppearance = "solid",
  onReply,
  onEdit,
  onDelete,
  placeholder = "Reply or @mention…",
  label = "Comments",
  emptyTitle = "No comments yet",
  emptyDescription = "Start the conversation. Mention someone with @ to notify them.",
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: CommentThreadProps) {
  const titleId = useId();
  const composerId = useId();
  const rootRef = useRef<HTMLElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const count = comments.length;
  const roots = comments.filter((comment) => !comment.parentId || !comments.some((c) => c.id === comment.parentId));
  const repliesOf = (id: string) => comments.filter((comment) => comment.parentId === id);
  const canPost = value.trim().length > 0 && !submitting;

  const focusComposer = () => rootRef.current?.querySelector<HTMLTextAreaElement>(`textarea[id="${CSS.escape(composerId)}"]`)?.focus();
  const focusAction = (id: string, action: string) =>
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(`[data-comment="${CSS.escape(id)}"] [data-action="${action}"]`)?.focus());

  const startEdit = (comment: ThreadComment) => {
    setEditingId(comment.id);
    setDraft(comment.body);
  };
  const cancelEdit = () => {
    const id = editingId;
    setEditingId(null);
    if (id) focusAction(id, "edit");
  };
  const saveEdit = () => {
    if (!editingId || !draft.trim()) return;
    onEdit?.(editingId, draft.trim());
    cancelEdit();
  };

  const composerKeys = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (canPost) onSubmit();
    }
  };
  const editKeys = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  };

  const renderComment = (comment: ThreadComment, reply: boolean) => {
    const own = Boolean(currentUserId) && comment.author.id === currentUserId;
    const editing = editingId === comment.id;
    return (
      <li key={comment.id} className={cx(styles.comment, reply && styles.reply)} data-comment={comment.id}>
        <Avatar
          className={styles.avatar}
          size="sm"
          name={comment.author.name}
          initials={comment.author.initials ?? initialsOf(comment.author.name)}
          src={comment.author.avatarSrc}
        />
        <div className={styles.content}>
          <p className={styles.meta}>
            <span className={styles.author}>{comment.author.name}</span>
            <span className={styles.time}>{comment.createdAt}</span>
            {comment.edited ? <span className={styles.edited}>· edited</span> : null}
          </p>
          {editing ? (
            <div className={styles.editor}>
              <Textarea
                id={`${composerId}-edit-${comment.id}`}
                aria-label={`Edit your comment`}
                rows={2}
                value={draft}
                onChange={setDraft}
                onKeyDown={editKeys}
                autoFocus
              />
              <div className={styles.editActions}>
                <Button size="sm" appearance="ghost" mode="neutral" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" appearance="outline" mode="neutral" shortcut="⏎" aria-keyshortcuts="Enter" disabled={!draft.trim()} onClick={saveEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className={styles.body}>{comment.body}</p>
              <div className={styles.actions}>
                {onReply && !reply ? (
                  <button
                    type="button"
                    className={styles.textButton}
                    data-action="reply"
                    aria-label={`Reply to ${comment.author.name}`}
                    onClick={() => {
                      onReply(comment.id);
                      focusComposer();
                    }}
                  >
                    Reply
                  </button>
                ) : null}
                {onReply && reply ? (
                  <button
                    type="button"
                    className={styles.textButton}
                    data-action="reply"
                    aria-label={`Reply to ${comment.author.name}`}
                    onClick={() => {
                      onReply(comment.parentId ?? comment.id);
                      focusComposer();
                    }}
                  >
                    Reply
                  </button>
                ) : null}
                {own && onEdit ? (
                  <button type="button" className={styles.textButton} data-action="edit" onClick={() => startEdit(comment)}>
                    Edit
                  </button>
                ) : null}
                {own && onDelete ? (
                  <button type="button" className={styles.textButton} data-action="delete" onClick={() => setDeleteId(comment.id)}>
                    Delete
                  </button>
                ) : null}
              </div>
            </>
          )}
          {!reply && repliesOf(comment.id).length ? (
            <ul className={styles.replies} aria-label={`Replies to ${comment.author.name}`}>
              {repliesOf(comment.id).map((child) => renderComment(child, true))}
            </ul>
          ) : null}
        </div>
      </li>
    );
  };

  return (
    <section
      {...rest} {...nisthaAttr("commentthread", rest)}
      ref={mergeRefs(rootRef, ref)}
      className={cx(styles.thread, title && styles.card, className)}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : label}
      aria-busy={loading || submitting || undefined}
    >
      {title ? (
        <header className={styles.header}>
          <MessageCircle size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.headerIcon} />
          <h3 id={titleId} className={styles.title}>
            {title}
          </h3>
          <span className={styles.count}>· {loading ? "…" : error ? "—" : `${count} ${count === 1 ? "comment" : "comments"}`}</span>
        </header>
      ) : null}

      {loading ? (
        <div className={styles.loading}>
          {[0, 1, 2].map((row) => (
            <div key={row} className={styles.loadingRow}>
              <Skeleton shape="circle" width="var(--space-6)" height="var(--space-6)" />
              <div className={styles.loadingText}>
                <Skeleton width="30%" size="sm" />
                <Skeleton width="85%" size="sm" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <LoadError message={error} onRetry={onRetry} />
      ) : (
        <>
          {count === 0 ? (
            emptyTitle ? <Empty title={emptyTitle} description={emptyDescription} icon="MessageCircle" /> : null
          ) : (
            <ul className={styles.list} aria-label={label}>
              {roots.map((comment) => renderComment(comment, false))}
            </ul>
          )}

          <div className={styles.composer}>
            <Textarea
              id={composerId}
              className={styles.composerField}
              aria-label={`${label}: write a comment`}
              rows={2}
              placeholder={placeholder}
              value={value}
              onChange={onValueChange}
              onKeyDown={composerKeys}
              disabled={submitting}
            />
            <div className={styles.composerBar}>
              <AtSign size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.mentionHint} />
              <span className={styles.spacer} />
              <span className={styles.keyHint} aria-hidden="true">
                ⌘⏎
              </span>
              <Button
                size="sm"
                appearance={submitAppearance}
                iconStart={submitting ? "LoaderCircle" : "Send"}
                className={submitting ? styles.sending : undefined}
                aria-keyshortcuts="Meta+Enter Control+Enter"
                disabled={!submitting && !canPost}
                onClick={submitting ? undefined : onSubmit}
              >
                {submitting ? "Sending…" : "Comment"}
              </Button>
            </div>
            <span className={styles.srOnly} role="status">
              {submitting ? "Sending your comment" : ""}
            </span>
          </div>
        </>
      )}

      {onDelete ? (
        <AlertDialog
          open={deleteId !== null}
          title="Delete this comment?"
          description="It's removed for everyone on this thread. Replies stay."
          cancelLabel="Keep"
          actionLabel="Delete"
          actionVariant="danger"
          onCancel={() => {
            const id = deleteId;
            setDeleteId(null);
            if (id) focusAction(id, "delete");
          }}
          onAction={() => {
            const id = deleteId;
            setDeleteId(null);
            if (id) onDelete(id);
            requestAnimationFrame(() => focusComposer());
          }}
        />
      ) : null}
    </section>
  );
}
