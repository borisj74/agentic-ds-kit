"use client";

import { useId, useLayoutEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { CalendarDays } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import type { TaskBoardCard, TaskBoardColumn, TaskBoardProps } from "./TaskBoard.types";
import styles from "./TaskBoard.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { TaskBoardProps, TaskBoardColumn, TaskBoardCard } from "./TaskBoard.types";

interface Lifted {
  cardId: string;
  fromColumn: string;
  fromIndex: number;
  column: string;
  index: number;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

/**
 * A Kanban board of columns and task cards, not a full project product. Counts are text. Cards move by drag
 * or by keyboard: Space picks a card up, arrows move it, Space drops and Escape cancels. Built on kit Badge,
 * Avatar, Button and Empty.
 */
export function TaskBoard({
  columns,
  cards,
  title,
  note,
  onMove,
  onAdd,
  onCardClick,
  onNewTask,
  onFilter,
  maxCardsPerColumn,
  emptyTitle = "No tasks on this board",
  emptyDescription = "Create a task, or import from a CSV.",
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: TaskBoardProps) {
  const titleId = useId();
  const helpId = useId();
  const boardRef = useRef<HTMLDivElement>(null);
  const [lifted, setLifted] = useState<Lifted | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [announcement, setAnnouncement] = useState("");
  const focusCard = useRef<string | null>(null);
  const byId = new Map(cards.map((card) => [card.id, card]));
  const total = columns.reduce((sum, column) => sum + column.cardIds.length, 0);

  // Keep focus on the card that moved (it remounts in its new column).
  useLayoutEffect(() => {
    const id = focusCard.current;
    if (!id) return;
    focusCard.current = null;
    boardRef.current?.querySelector<HTMLElement>(`[data-card="${CSS.escape(id)}"]`)?.focus();
  });

  /** Columns as rendered: while a card is lifted it shows at its preview spot. */
  const view: TaskBoardColumn[] = lifted
    ? columns.map((column) => {
        const ids = column.cardIds.filter((id) => id !== lifted.cardId);
        if (column.id === lifted.column) ids.splice(Math.min(lifted.index, ids.length), 0, lifted.cardId);
        return { ...column, cardIds: ids };
      })
    : columns;

  const labelOf = (columnId: string) => columns.find((column) => column.id === columnId)?.label ?? columnId;
  const placeText = (columnId: string, index: number, size: number) => `${labelOf(columnId)}, position ${index + 1} of ${size}`;

  const cardKeys = (event: KeyboardEvent<HTMLButtonElement>, card: TaskBoardCard, columnId: string, index: number) => {
    if (!lifted) {
      if (event.key === "Enter") {
        event.preventDefault();
        onCardClick?.(card.id);
        return;
      }
      if (event.key === " ") {
        event.preventDefault();
        const size = columns.find((column) => column.id === columnId)?.cardIds.length ?? 1;
        setLifted({ cardId: card.id, fromColumn: columnId, fromIndex: index, column: columnId, index });
        setAnnouncement(`${card.title} picked up. ${placeText(columnId, index, size)}. Arrows move, Space drops, Escape cancels.`);
      }
      return;
    }
    if (lifted.cardId !== card.id) return;
    const colIndex = view.findIndex((column) => column.id === lifted.column);
    const size = view[colIndex]?.cardIds.length ?? 1;
    let next: Lifted | null = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const to = view[colIndex + (event.key === "ArrowLeft" ? -1 : 1)];
      if (to) next = { ...lifted, column: to.id, index: Math.min(lifted.index, to.cardIds.filter((id) => id !== card.id).length) };
    } else if (event.key === "ArrowUp") {
      next = { ...lifted, index: Math.max(0, lifted.index - 1) };
    } else if (event.key === "ArrowDown") {
      next = { ...lifted, index: Math.min(size - 1, lifted.index + 1) };
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      setLifted(null);
      focusCard.current = card.id;
      if (lifted.column !== lifted.fromColumn || lifted.index !== lifted.fromIndex) onMove(card.id, lifted.column, lifted.index);
      setAnnouncement(`${card.title} dropped. ${placeText(lifted.column, lifted.index, size)}.`);
      return;
    } else if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") event.preventDefault();
      setLifted(null);
      focusCard.current = event.key === "Escape" ? card.id : null;
      setAnnouncement(`Move cancelled. ${card.title} is back in ${placeText(lifted.fromColumn, lifted.fromIndex, columns.find((c) => c.id === lifted.fromColumn)?.cardIds.length ?? 1)}.`);
      return;
    }
    if (next) {
      event.preventDefault();
      const nextSize = (view.find((column) => column.id === next.column)?.cardIds.filter((id) => id !== card.id).length ?? 0) + 1;
      setLifted(next);
      focusCard.current = card.id;
      setAnnouncement(placeText(next.column, next.index, nextSize));
    }
  };

  const dropOn = (event: DragEvent, columnId: string, index?: number) => {
    event.preventDefault();
    const id = dragId ?? event.dataTransfer.getData("text/plain");
    setDragId(null);
    setDropTarget(null);
    if (!id || !byId.has(id)) return;
    const target = columns.find((column) => column.id === columnId);
    const without = target ? target.cardIds.filter((cardId) => cardId !== id) : [];
    const at = index ?? without.length;
    onMove(id, columnId, at);
    focusCard.current = id;
    setAnnouncement(`${byId.get(id)?.title} moved to ${placeText(columnId, at, without.length + 1)}.`);
  };

  return (
    <section {...rest} {...nisthaAttr("taskboard", rest)} ref={ref} className={cx(styles.board, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {note ? <span className={styles.note}>· {note}</span> : null}
        <span className={styles.spacer} />
        {onFilter ? (
          <Button size="sm" appearance="ghost" mode="neutral" iconStart="Filter" onClick={onFilter}>
            Filter
          </Button>
        ) : null}
        {onNewTask ? (
          <Button size="sm" appearance="outline" mode="neutral" iconStart="Plus" onClick={onNewTask}>
            New task
          </Button>
        ) : null}
      </header>

      {loading ? (
        <div className={styles.columns}>
          {[0, 1, 2, 3].map((column) => (
            <div key={column} className={styles.column}>
              <Skeleton width="50%" size="sm" />
              <Skeleton shape="rect" width="100%" height="var(--space-16)" />
              <Skeleton shape="rect" width="100%" height="var(--space-16)" />
            </div>
          ))}
        </div>
      ) : error ? (
        <LoadError message={error} onRetry={onRetry} />
      ) : columns.length === 0 || total === 0 ? (
        <Empty
          title={emptyTitle}
          description={emptyDescription}
          icon="LayoutGrid"
          actions={
            onNewTask ? (
              <Button size="md" appearance="outline" mode="neutral" iconStart="Plus" onClick={onNewTask}>
                New task
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div ref={boardRef} className={styles.columns}>
          <p id={helpId} className={styles.srOnly}>
            Press Space to pick up a card, arrow keys to move it, Space to drop it and Escape to cancel.
          </p>
          {view.map((column) => {
            const limit = maxCardsPerColumn && !expanded[column.id] ? maxCardsPerColumn : column.cardIds.length;
            const liftedHere = lifted?.column === column.id;
            const shownIds = column.cardIds.slice(0, liftedHere ? Math.max(limit, (lifted?.index ?? 0) + 1) : limit);
            const hidden = column.cardIds.length - shownIds.length;
            const countNow = columns.find((c) => c.id === column.id)?.cardIds.length ?? 0;
            const headingId = `${titleId}-${column.id}`;
            return (
              <section
                key={column.id}
                className={cx(styles.column, dropTarget === column.id && styles.columnDrop)}
                aria-labelledby={headingId}
                onDragOver={(event) => {
                  if (!dragId) return;
                  event.preventDefault();
                  setDropTarget(column.id);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
                }}
                onDrop={(event) => dropOn(event, column.id)}
              >
                <h4 id={headingId} className={styles.columnTitle}>
                  {column.label}
                  <span className={styles.columnCount}>{countNow}</span>
                </h4>
                {column.cardIds.length === 0 ? (
                  <div className={styles.emptyColumn}>
                    <span className={styles.emptyTitle}>No tasks</span>
                    <span className={styles.emptyHint}>Drag a card here</span>
                  </div>
                ) : (
                  <ol className={styles.cards} aria-labelledby={headingId}>
                    {shownIds.map((id, index) => {
                      const card = byId.get(id);
                      if (!card) return null;
                      const isLifted = lifted?.cardId === id;
                      return (
                        <li key={id} className={styles.cardItem}>
                          <button
                            type="button"
                            className={cx(styles.card, isLifted && styles.cardLifted, dragId === id && styles.cardDragging)}
                            data-card={id}
                            draggable
                            aria-describedby={helpId}
                            aria-pressed={isLifted || undefined}
                            onDragStart={(event) => {
                              event.dataTransfer.setData("text/plain", id);
                              event.dataTransfer.effectAllowed = "move";
                              setDragId(id);
                            }}
                            onDragEnd={() => {
                              setDragId(null);
                              setDropTarget(null);
                            }}
                            onDragOver={(event) => {
                              if (dragId && dragId !== id) event.preventDefault();
                            }}
                            onDrop={(event) => {
                              event.stopPropagation();
                              const realIndex = (columns.find((c) => c.id === column.id)?.cardIds ?? []).filter((cardId) => cardId !== dragId).indexOf(id);
                              dropOn(event, column.id, realIndex < 0 ? undefined : realIndex);
                            }}
                            onKeyDown={(event) => cardKeys(event, card, column.id, index)}
                            onBlur={() => {
                              // A move remounts the card and focus follows it; only a real focus loss cancels.
                              requestAnimationFrame(() =>
                                setLifted((current) =>
                                  current && current.cardId === id && document.activeElement?.getAttribute("data-card") !== id ? null : current,
                                ),
                              );
                            }}
                            onClick={(event) => {
                              if (event.detail === 0) return; // keyboard Space/Enter is handled in onKeyDown
                              onCardClick?.(id);
                            }}
                          >
                            <span className={styles.cardTitle}>{card.title}</span>
                            {card.tags?.length ? (
                              <span className={styles.tags}>
                                {card.tags.map((tag) => (
                                  <Badge key={tag} tone="neutral" appearance="outline" size="sm">
                                    {tag}
                                  </Badge>
                                ))}
                              </span>
                            ) : null}
                            <span className={styles.cardFoot}>
                              <span className={cx(styles.due, !card.dueOn && styles.noDue)}>
                                {card.dueOn ? <CalendarDays size={12} strokeWidth={ICON_STROKE} aria-hidden="true" /> : null}
                                {card.dueOn ? `Due ${card.dueOn}` : "No due date"}
                              </span>
                              {card.assignee ? (
                                <Avatar
                                  size="sm"
                                  name={card.assignee.name}
                                  initials={card.assignee.initials ?? initialsOf(card.assignee.name)}
                                  src={card.assignee.avatarSrc}
                                />
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
                {hidden > 0 ? (
                  <button type="button" className={styles.more} onClick={() => setExpanded((current) => ({ ...current, [column.id]: true }))}>
                    + {hidden} more
                  </button>
                ) : null}
                {onAdd ? (
                  <button type="button" className={styles.add} onClick={() => onAdd(column.id)} aria-label={`Add card to ${column.label}`}>
                    + Add card
                  </button>
                ) : null}
              </section>
            );
          })}
          <span className={styles.srOnly} role="status" aria-live="assertive">
            {announcement}
          </span>
        </div>
      )}
    </section>
  );
}
