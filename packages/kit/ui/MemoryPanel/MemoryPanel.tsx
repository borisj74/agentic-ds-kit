"use client";

import { useId, useState, type FormEvent } from "react";
import { Brain, CircleX, Lock } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { AlertDialog } from "../AlertDialog";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Field } from "../Field";
import { Input } from "../Input";
import { Skeleton } from "../Skeleton";
import { Textarea } from "../Textarea";
import { cx } from "../shared/cx";
import type { MemoryItem, MemoryPanelProps } from "./MemoryPanel.types";
import styles from "./MemoryPanel.module.css";

export type { MemoryPanelProps, MemoryItem } from "./MemoryPanel.types";

function MemoryForm({
  label,
  initial,
  onSave,
  onCancel,
}: {
  label: string;
  initial: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [text, setText] = useState(initial);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (text.trim()) onSave(text.trim());
  }
  return (
    <form
      className={styles.form}
      onSubmit={submit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
        } else if (event.key === "Enter" && !event.shiftKey) {
          submit(event);
        }
      }}
    >
      <Field label={label} htmlFor={id}>
        <Textarea
          id={id}
          rows={2}
          value={text}
          onChange={setText}
          autoFocus
          onFocus={(event) => {
            const end = event.currentTarget.value.length;
            event.currentTarget.setSelectionRange(end, end);
          }}
        />
      </Field>
      <div className={styles.formActions}>
        <Button size="sm" appearance="ghost" mode="neutral" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" appearance="outline" mode="neutral" type="submit" shortcut="⏎">
          Save
        </Button>
      </div>
    </form>
  );
}

/** Facts an agent has stored: pin, edit or forget them, and see which ones this thread used. */
export function MemoryPanel({
  items,
  label = "Memory",
  query = "",
  onQueryChange,
  onAdd,
  onEdit,
  onPin,
  onDelete,
  loading = false,
  error,
  onRetry,
  privacyNote = "Only you and this workspace's agents can read these.",
  className,
  ref,
  ...rest
}: MemoryPanelProps) {
  const titleId = useId();
  const searchId = useId();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const needle = query.trim().toLowerCase();
  const shown = needle ? items.filter((item) => item.content.toLowerCase().includes(needle)) : items;
  const pinned = shown.filter((item) => item.pinned);
  const others = shown.filter((item) => !item.pinned);
  const confirming = items.find((item) => item.id === confirmId);

  const count = loading ? "…" : error ? "–" : needle ? `${shown.length} of ${items.length}` : `${items.length} ${items.length === 1 ? "memory" : "memories"}`;

  function row(item: MemoryItem) {
    if (editingId === item.id) {
      return (
        <li key={item.id} className={styles.editing}>
          <MemoryForm
            label="Edit memory"
            initial={item.content}
            onCancel={() => setEditingId(null)}
            onSave={(content) => {
              onEdit?.(item.id, content);
              setEditingId(null);
            }}
          />
        </li>
      );
    }
    return (
      <li key={item.id} className={styles.item}>
        <Brain size={16} strokeWidth={ICON_STROKE} className={styles.itemIcon} aria-hidden="true" />
        <div className={styles.itemBody}>
          <span className={styles.content}>{item.content}</span>
          <span className={styles.meta}>
            {[item.source, item.age].filter(Boolean).join(" · ")}
            {item.usedHere ? (
              <Badge tone="primary" size="sm">
                Used here
              </Badge>
            ) : null}
          </span>
        </div>
        <span className={cx(styles.actions, item.pinned && styles.actionsPinned)}>
          {onPin ? (
            <Button
              size="sm"
              appearance="ghost"
              mode="neutral"
              iconStart="Pin"
              ariaLabel={`${item.pinned ? "Unpin" : "Pin"}: ${item.content}`}
              aria-pressed={Boolean(item.pinned)}
              className={item.pinned ? styles.pinOn : undefined}
              onClick={() => onPin(item.id, !item.pinned)}
            />
          ) : null}
          {onEdit ? (
            <Button size="sm" appearance="ghost" mode="neutral" iconStart="Pencil" ariaLabel={`Edit: ${item.content}`} onClick={() => setEditingId(item.id)} />
          ) : null}
          {onDelete ? (
            <Button size="sm" appearance="ghost" mode="danger" iconStart="Trash2" ariaLabel={`Forget: ${item.content}`} onClick={() => setConfirmId(item.id)} />
          ) : null}
        </span>
      </li>
    );
  }

  let body;
  if (loading) {
    body = (
      <div className={styles.loading}>
        {[0, 1, 2].map((key) => (
          <div key={key} className={styles.skeletonRow}>
            <Skeleton shape="circle" size="sm" />
            <div className={styles.skeletonText}>
              <Skeleton width="80%" />
              <Skeleton width="40%" size="sm" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (error) {
    body = (
      <p className={styles.error} role="alert">
        <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
        <span className={styles.errorText}>{error}</span>
        {onRetry ? (
          <button type="button" className={styles.retry} onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </p>
    );
  } else if (items.length === 0 && !adding) {
    body = (
      <Empty
        icon="Brain"
        title="Nothing remembered yet"
        description="Agents save useful facts here. You can add your own, pin what matters, or forget anything."
      />
    );
  } else if (shown.length === 0 && !adding) {
    body = <Empty icon="Search" title={`No memories match “${query.trim()}”`} description="Try another word, or add it as a new memory." />;
  } else {
    body = (
      <div className={styles.groups}>
        {adding ? (
          <div className={styles.editing}>
            <MemoryForm
              label="New memory"
              initial={needle ? query.trim() : ""}
              onCancel={() => setAdding(false)}
              onSave={(content) => {
                onAdd?.(content);
                setAdding(false);
              }}
            />
          </div>
        ) : null}
        {pinned.length ? (
          <section aria-label="Pinned">
            <h4 className={styles.groupHead}>Pinned</h4>
            <ul className={styles.list}>{pinned.map(row)}</ul>
          </section>
        ) : null}
        {others.length ? (
          <section aria-label={pinned.length ? "Others" : "Memories"}>
            {pinned.length ? <h4 className={styles.groupHead}>Others</h4> : null}
            <ul className={styles.list}>{others.map(row)}</ul>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <section {...rest} ref={ref} className={cx(styles.panel, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <Brain size={16} strokeWidth={ICON_STROKE} className={styles.titleIcon} aria-hidden="true" />
        <h3 id={titleId} className={styles.title}>
          {label}
        </h3>
        <span className={styles.count}>{count}</span>
        {onAdd ? (
          <Button size="sm" appearance="outline" mode="neutral" iconStart="Plus" className={styles.add} onClick={() => setAdding(true)}>
            Add
          </Button>
        ) : null}
      </header>
      {onQueryChange ? (
        <Input id={searchId} iconStart="Search" ariaLabel="Search memories" placeholder="Search memories" value={query} onChange={onQueryChange} />
      ) : null}
      {body}
      <p className={styles.privacy}>
        <Lock size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
        {privacyNote}
      </p>
      <AlertDialog
        open={Boolean(confirming)}
        title="Forget this memory?"
        description={confirming ? `“${confirming.content}” will be removed for every agent. This can't be undone.` : ""}
        cancelLabel="Keep"
        actionLabel="Forget"
        actionVariant="danger"
        onCancel={() => setConfirmId(null)}
        onAction={() => {
          if (confirmId) onDelete?.(confirmId);
          setConfirmId(null);
        }}
      />
    </section>
  );
}
