"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, MessageCircle, X } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Drawer } from "../Drawer";
import { Empty } from "../Empty";
import { SegmentedControl } from "../SegmentedControl";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import type { CommentsFilter, CommentsPanelProps, CommentThreadSummary } from "./CommentsPanel.types";
import styles from "./CommentsPanel.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { CommentsPanelProps, CommentThreadSummary, CommentsFilter } from "./CommentsPanel.types";

/**
 * A side panel hosting the comment threads for a page: Open / Resolved / All, thread previews, and the
 * selected thread (pass a kit CommentThread as children). Built on kit Drawer and SegmentedControl.
 */
export function CommentsPanel({
  threads,
  open,
  onOpenChange,
  selectedId = null,
  onSelect,
  onResolve,
  filter: filterProp,
  onFilterChange,
  children,
  composer,
  label = "Comments",
  emptyTitle = "No comments yet",
  emptyDescription = "Select a line to comment on it, or leave a note for the whole page.",
  inline = false,
  showTrigger,
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: CommentsPanelProps) {
  const [ownFilter, setOwnFilter] = useState<CommentsFilter>("open");
  const filter = filterProp ?? ownFilter;
  const setFilter = (next: CommentsFilter) => {
    if (filterProp === undefined) setOwnFilter(next);
    onFilterChange?.(next);
  };
  const triggerRef = useRef<HTMLButtonElement>(null);
  const countId = useId();
  const openCount = threads.filter((thread) => !thread.resolved).length;
  const resolvedCount = threads.length - openCount;
  const selected = selectedId ? threads.find((thread) => thread.id === selectedId) : undefined;

  const body = (
    <Body
      threads={threads}
      filter={filter}
      setFilter={setFilter}
      openCount={openCount}
      resolvedCount={resolvedCount}
      selected={selected}
      onSelect={onSelect}
      onResolve={onResolve}
      composer={composer}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      loading={loading}
      error={error}
      onRetry={onRetry}
    >
      {children}
    </Body>
  );

  if (inline) {
    return (
      <div {...rest} {...nisthaAttr("commentspanel", rest)} ref={ref} className={cx(styles.inline, className)} role="region" aria-label={label} aria-busy={loading || undefined}>
        <header className={styles.inlineHeader}>
          <MessageCircle size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <h2 className={styles.inlineTitle}>{label}</h2>
          <Badge tone="neutral" size="sm" appearance="outline">
            {loading ? "…" : error ? "—" : String(threads.length)}
          </Badge>
          <span className={styles.spacer} />
          <Button size="sm" appearance="ghost" mode="neutral" iconStart={X} ariaLabel={`Close ${label.toLowerCase()}`} onClick={() => onOpenChange(false)} />
        </header>
        <div className={styles.inlineBody}>{body}</div>
      </div>
    );
  }

  const trigger = showTrigger ?? true;
  return (
    <div {...rest} {...nisthaAttr("commentspanel", rest)} ref={ref} className={cx(styles.root, className)}>
      {trigger ? (
        <span className={styles.trigger}>
          <Button
            ref={triggerRef}
            size="md"
            appearance="outline"
            mode="neutral"
            iconStart={MessageCircle}
            aria-expanded={open}
            aria-describedby={openCount ? countId : undefined}
            onClick={() => onOpenChange(!open)}
          >
            {label}
          </Button>
          {openCount ? (
            <Badge id={countId} className={styles.triggerBadge} tone="info" size="sm">
              {`${openCount} open`}
            </Badge>
          ) : null}
        </span>
      ) : null}
      <Drawer
        open={open}
        title={label}
        description={loading ? undefined : `${openCount} open · ${resolvedCount} resolved`}
        side="right"
        size="sm"
        onClose={() => {
          onOpenChange(false);
          requestAnimationFrame(() => triggerRef.current?.focus());
        }}
      >
        <div className={styles.drawerBody} aria-busy={loading || undefined}>
          {body}
        </div>
      </Drawer>
    </div>
  );
}

function Body({
  threads,
  filter,
  setFilter,
  openCount,
  resolvedCount,
  selected,
  onSelect,
  onResolve,
  composer,
  emptyTitle,
  emptyDescription,
  loading,
  error,
  onRetry,
  children,
}: {
  threads: CommentThreadSummary[];
  filter: CommentsFilter;
  setFilter: (filter: CommentsFilter) => void;
  openCount: number;
  resolvedCount: number;
  selected?: CommentThreadSummary;
  onSelect: (id: string | null) => void;
  onResolve?: (id: string) => void;
  composer?: CommentsPanelProps["composer"];
  emptyTitle: string;
  emptyDescription: string;
  loading: boolean;
  error?: string;
  onRetry?: () => void;
  children?: CommentsPanelProps["children"];
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const titleId = useId();
  const lastSelected = useRef<string | null>(null);
  const pendingBack = useRef(false);
  // Back to the list: focus the thread that was open.
  useLayoutEffect(() => {
    if (!pendingBack.current || selected) return;
    pendingBack.current = false;
    const id = lastSelected.current;
    const target = id ? listRef.current?.querySelector<HTMLElement>(`[data-thread="${CSS.escape(id)}"]`) : null;
    (target ?? listRef.current?.querySelector<HTMLElement>("button"))?.focus();
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <Skeleton shape="rect" width="100%" height="var(--space-8)" />
        {[0, 1, 2].map((row) => (
          <div key={row} className={styles.loadingRow}>
            <Skeleton width="55%" size="sm" />
            <Skeleton width="80%" size="sm" />
          </div>
        ))}
      </div>
    );
  }
  if (error) return <LoadError message={error} onRetry={onRetry} />;

  if (selected) {
    return (
      <div className={styles.detail}>
        <div className={styles.detailBar}>
          <button
            type="button"
            className={styles.back}
            autoFocus
            onClick={() => {
              pendingBack.current = true;
              onSelect(null);
            }}
          >
            <ChevronLeft size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
            All threads
          </button>
          {onResolve && !selected.resolved ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="Check" onClick={() => onResolve(selected.id)}>
              Resolve
            </Button>
          ) : selected.resolved ? (
            <Badge tone="success" size="sm">
              Resolved
            </Badge>
          ) : null}
        </div>
        <h3 id={titleId} className={styles.detailTitle}>
          {selected.title}
        </h3>
        <div className={styles.detailThread} role="group" aria-labelledby={titleId}>
          {children}
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <Empty title={emptyTitle} description={emptyDescription} icon="MessageCircle" />
        {composer}
      </div>
    );
  }

  const shown = threads.filter((thread) => (filter === "all" ? true : filter === "resolved" ? thread.resolved : !thread.resolved));
  return (
    <div className={styles.listView}>
      <SegmentedControl
        size="sm"
        ariaLabel="Show threads"
        value={filter}
        onChange={(value) => setFilter(value as CommentsFilter)}
        items={[
          { value: "open", label: `Open ${openCount}` },
          { value: "resolved", label: `Resolved ${resolvedCount}` },
          { value: "all", label: `All ${threads.length}` },
        ]}
      />
      {shown.length === 0 ? (
        <Empty
          title={filter === "resolved" ? "Nothing resolved yet" : "No open threads"}
          description={filter === "resolved" ? "Resolved threads move here so the open list stays short." : "Every thread on this page is resolved."}
          icon="CircleCheck"
        />
      ) : (
        <ul key={filter} ref={listRef} className={styles.list}>
          {shown.map((thread) => (
            <li key={thread.id}>
              <button
                type="button"
                className={styles.thread}
                data-thread={thread.id}
                onClick={() => {
                  lastSelected.current = thread.id;
                  onSelect(thread.id);
                }}
              >
                <MessageCircle size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.threadIcon} />
                <span className={styles.threadText}>
                  <span className={styles.threadTitle}>
                    {thread.title}
                    {thread.resolved ? <span className={styles.srOnly}> (resolved)</span> : null}
                  </span>
                  <span className={styles.threadPreview}>{thread.preview}</span>
                  <span className={styles.threadCount}>
                    {thread.count} {thread.count === 1 ? "comment" : "comments"}
                  </span>
                </span>
                <time className={styles.threadTime}>{thread.updatedAt}</time>
              </button>
            </li>
          ))}
        </ul>
      )}
      {composer}
    </div>
  );
}
