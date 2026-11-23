"use client";

import { Fragment, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CornerDownRight, MessageCircle } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { AlertDialog } from "../AlertDialog";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { DropdownMenu } from "../DropdownMenu";
import { Empty } from "../Empty";
import { Kbd } from "../Kbd";
import { Skeleton } from "../Skeleton";
import { Textarea } from "../Textarea";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type { CommentMember, CommentThreadProps, ThreadComment } from "./CommentThread.types";
import styles from "./CommentThread.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { CommentThreadProps, ThreadComment, CommentAuthor, CommentMember } from "./CommentThread.types";

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const escapeRe = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Splits a body into text and `@Full Name` mentions of people the thread knows. */
export function splitMentions(body: string, names: string[]): Array<{ text: string; mention: boolean }> {
  const known = [...new Set(names.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!known.length || !body.includes("@")) return [{ text: body, mention: false }];
  const pattern = new RegExp(`@(?:${known.map(escapeRe).join("|")})(?![\\p{L}\\p{N}])`, "gu");
  const parts: Array<{ text: string; mention: boolean }> = [];
  let last = 0;
  for (const match of body.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({ text: body.slice(last, start), mention: false });
    parts.push({ text: match[0], mention: true });
    last = start + match[0].length;
  }
  if (last < body.length) parts.push({ text: body.slice(last), mention: false });
  return parts;
}

/** The "@query" being typed just before the caret, or null. Stops at a newline or a second space. */
export function mentionQuery(text: string, caret: number): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const at = before.lastIndexOf("@");
  if (at < 0) return null;
  if (at > 0 && !/\s/.test(before[at - 1])) return null;
  const query = before.slice(at + 1);
  if (/\n/.test(query) || (query.match(/ /g)?.length ?? 0) > 1 || query.startsWith(" ")) return null;
  return { start: at, query };
}

/** Members whose name starts with the query, or has a word that does. */
export function matchMembers(members: CommentMember[], query: string): CommentMember[] {
  const q = query.trim().toLowerCase();
  if (!q) return members;
  return members.filter((member) => {
    const name = member.name.toLowerCase();
    return name.startsWith(q) || name.split(/\s+/).some((word) => word.startsWith(q));
  });
}

/**
 * One conversation on a document, invoice or task: comments, one level of replies, in-place edit, and a
 * composer. Not the assistant Chat. Built on kit Avatar, Textarea, Button and AlertDialog.
 */
export function CommentThread({
  title,
  comments,
  currentUserId,
  members,
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
  const hintId = useId();
  const rootRef = useRef<HTMLElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const count = comments.length;
  const roots = comments.filter((comment) => !comment.parentId || !comments.some((c) => c.id === comment.parentId));
  const repliesOf = (id: string) => comments.filter((comment) => comment.parentId === id);
  const canPost = value.trim().length > 0 && !submitting;
  const knownNames = [...comments.map((comment) => comment.author.name), ...(members ?? []).map((member) => member.name)];
  const listId = useId();
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const [active, setActive] = useState(0);
  const suggestions = mention && members?.length ? matchMembers(members, mention.query).slice(0, 6) : [];
  const listOpen = suggestions.length > 0;
  const activeIndex = Math.min(active, Math.max(suggestions.length - 1, 0));
  const readMention = (text: string, caret: number) => {
    setMention(members?.length ? mentionQuery(text, caret) : null);
    setActive(0);
  };
  const insertMention = (member: CommentMember) => {
    if (!mention) return;
    const end = mention.start + 1 + mention.query.length;
    const insert = `@${member.name} `;
    onValueChange(value.slice(0, mention.start) + insert + value.slice(end));
    setMention(null);
    const caret = mention.start + insert.length;
    requestAnimationFrame(() => {
      const field = rootRef.current?.querySelector<HTMLTextAreaElement>(`textarea[id="${CSS.escape(composerId)}"]`);
      field?.focus();
      field?.setSelectionRange(caret, caret);
    });
  };
  const renderBody = (body: string): ReactNode =>
    splitMentions(body, knownNames).map((part, index) =>
      part.mention ? (
        <span key={index} className={styles.mention}>
          {part.text}
        </span>
      ) : (
        <Fragment key={index}>{part.text}</Fragment>
      ),
    );

  const focusComposer = () => rootRef.current?.querySelector<HTMLTextAreaElement>(`textarea[id="${CSS.escape(composerId)}"]`)?.focus();
  // Edit and Delete live in the comment's More menu: focus returns to its trigger.
  const focusAction = (id: string) =>
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(`[data-comment="${CSS.escape(id)}"] [data-action="menu"] button`)?.focus());

  const startEdit = (comment: ThreadComment) => {
    setEditingId(comment.id);
    setDraft(comment.body);
  };
  const cancelEdit = () => {
    const id = editingId;
    setEditingId(null);
    if (id) focusAction(id);
  };
  const saveEdit = () => {
    if (!editingId || !draft.trim()) return;
    onEdit?.(editingId, draft.trim());
    cancelEdit();
  };

  const composerKeys = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (listOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActive((activeIndex + step + suggestions.length) % suggestions.length);
        return;
      }
      if ((event.key === "Enter" || event.key === "Tab") && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        insertMention(suggestions[activeIndex]);
        return;
      }
      if (event.key === "Escape") {
        // Close the list and keep the typed text.
        event.preventDefault();
        setMention(null);
        return;
      }
    }
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
    const replies = reply ? [] : repliesOf(comment.id);
    const menuGroups = [
      {
        items: [
          ...(own && onEdit ? [{ id: "edit", label: "Edit", icon: "Pencil" as const }] : []),
          ...(own && onDelete ? [{ id: "delete", label: "Delete", icon: "Trash2" as const, danger: true }] : []),
        ],
      },
    ];
    const hasMenu = menuGroups[0].items.length > 0 && !editing;
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
          <div className={styles.metaRow}>
            <p className={styles.meta}>
              <span id={`${composerId}-author-${comment.id}`} className={styles.author}>
                {comment.author.name}
              </span>
              <span className={styles.time}>
                {comment.createdAt}
                {comment.edited ? " · edited" : null}
              </span>
            </p>
            {hasMenu ? (
              <span data-action="menu" className={styles.menu}>
                <DropdownMenu
                  size="sm"
                  appearance="ghost"
                  mode="neutral"
                  iconStart="Ellipsis"
                  ariaLabel={`More actions on your comment`}
                  align="end"
                  groups={menuGroups}
                  onSelect={(id) => {
                    if (id === "edit") startEdit(comment);
                    if (id === "delete") setDeleteId(comment.id);
                  }}
                />
              </span>
            ) : null}
          </div>
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
            <p className={styles.body}>{renderBody(comment.body)}</p>
          )}
          {replies.length ? (
            <ul className={styles.replies} aria-label={`Replies to ${comment.author.name}`}>
              {replies.map((child) => renderComment(child, true))}
            </ul>
          ) : null}
          {onReply && !reply ? (
            <div className={styles.actions}>
              <Button
                size="sm"
                appearance="ghost"
                mode="neutral"
                iconStart={CornerDownRight}
                data-action="reply"
                aria-describedby={`${composerId}-author-${comment.id}`}
                onClick={() => {
                  onReply(comment.id);
                  focusComposer();
                }}
              >
                Reply
              </Button>
            </div>
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
            {listOpen ? (
              <ul id={listId} role="listbox" aria-label="Mention someone" className={styles.mentionList}>
                {suggestions.map((member, index) => (
                  <li
                    key={member.id}
                    id={`${listId}-${member.id}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={cx(styles.mentionOption, index === activeIndex && styles.mentionActive)}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => insertMention(member)}
                  >
                    <Avatar size="sm" name={member.name} initials={member.initials ?? initialsOf(member.name)} src={member.avatarSrc} />
                    <span className={styles.mentionName}>{member.name}</span>
                    {member.role ? <span className={styles.mentionRole}>{member.role}</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className={styles.composerRow}>
              <Textarea
                id={composerId}
                size="md"
                className={styles.composerField}
                aria-label={`${label}: write a comment`}
                aria-keyshortcuts="Meta+Enter Control+Enter"
                describedBy={hintId}
                rows={1}
                placeholder={placeholder}
                value={value}
                onChange={(next) => {
                  onValueChange(next);
                  const field = rootRef.current?.querySelector<HTMLTextAreaElement>(`textarea[id="${CSS.escape(composerId)}"]`);
                  readMention(next, field?.selectionStart ?? next.length);
                }}
                onKeyDown={composerKeys}
                onBlur={() => setMention(null)}
                role={members?.length ? "combobox" : undefined}
                aria-autocomplete={members?.length ? "list" : undefined}
                aria-expanded={members?.length ? listOpen : undefined}
                aria-controls={listOpen ? listId : undefined}
                aria-activedescendant={listOpen ? `${listId}-${suggestions[activeIndex].id}` : undefined}
                disabled={submitting}
              />
              <Button
                size="md"
                appearance={submitAppearance}
                iconStart={submitting ? "LoaderCircle" : undefined}
                className={submitting ? styles.sending : undefined}
                aria-keyshortcuts="Meta+Enter Control+Enter"
                disabled={!submitting && !canPost}
                onClick={submitting ? undefined : onSubmit}
              >
                {submitting ? "Sending…" : "Comment"}
              </Button>
            </div>
            <p id={hintId} className={styles.hint}>
              <Kbd>⌘ Enter</Kbd> to send
            </p>
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
            if (id) focusAction(id);
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
