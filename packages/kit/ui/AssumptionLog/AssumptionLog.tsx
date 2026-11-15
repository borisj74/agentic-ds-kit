"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Lightbulb, ListTree } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "../Card";
import { Empty } from "../Empty";
import { Input } from "../Input";
import { Meter } from "../Meter";
import { Popover } from "../Popover";
import { SegmentedControl } from "../SegmentedControl";
import { Tag } from "../Tag";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import {
  LEVEL_LABEL,
  confidenceLevel,
  emptyTitle,
  filterAssumptions,
  openCount,
  plural,
  sortAssumptions,
  weakestOpen,
} from "./assumptionLog.logic";
import type { Assumption, AssumptionFilter, AssumptionLogProps, ConfidenceLevel } from "./AssumptionLog.types";
import styles from "./AssumptionLog.module.css";

export type {
  AssumptionLogProps,
  Assumption,
  AssumptionStatus,
  AssumptionFilter,
  ConfidenceLevel,
} from "./AssumptionLog.types";

const LEVEL_INTENT: Record<ConfidenceLevel, "warning" | "info" | "success"> = { low: "warning", medium: "info", high: "success" };

const FILTERS: { value: AssumptionFilter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "confirmed", label: "Confirmed" },
  { value: "corrected", label: "Corrected" },
  { value: "all", label: "All" },
];

function Confidence({ value }: { value: number }) {
  const level = confidenceLevel(value);
  const percent = Math.round(value * 100);
  return (
    <span className={cx(styles.confidence, styles[level])}>
      <Meter className={styles.meter} size="sm" value={percent} intent={LEVEL_INTENT[level]} label={`Confidence ${percent}%, ${LEVEL_LABEL[level]}`} />
      <span className={styles.level}>{LEVEL_LABEL[level]}</span>
    </span>
  );
}

function StepsPopover({ steps }: { steps: string[] }) {
  return (
    <Popover
      label="Steps that use this assumption"
      trigger={
        <Button size="sm" appearance="ghost" mode="neutral" iconStart={ListTree}>
          {`used in ${plural(steps.length, "step")}`}
        </Button>
      }
    >
      <ol className={styles.steps}>
        {steps.map((step, i) => (
          <li key={`${i}-${step}`}>{step}</li>
        ))}
      </ol>
    </Popover>
  );
}

/**
 * The guesses an agent made without asking, so a person can confirm or correct them before
 * they matter. DecisionCard covers the questions it does ask.
 */
export function AssumptionLog({
  items,
  title = "Assumptions",
  filter: filterProp,
  onFilterChange,
  onConfirm,
  onCorrect,
  compact = false,
  className,
  ref,
  ...rest
}: AssumptionLogProps) {
  const base = useId();
  const [innerFilter, setInnerFilter] = useState<AssumptionFilter>("open");
  const filter = filterProp ?? innerFilter;
  const [editing, setEditing] = useState<{ id: string; draft: string } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const correctRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const rowRefs = useRef(new Map<string, HTMLLIElement | null>());
  const returnFocus = useRef<string | null>(null);
  const returnIndex = useRef(0);
  const listRef = useRef<HTMLUListElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const open = openCount(items);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (returnFocus.current) {
      const id = returnFocus.current;
      const button = correctRefs.current.get(id);
      const row = rowRefs.current.get(id);
      const rowsNow = listRef.current ? Array.from(listRef.current.children) : [];
      // The row may have left the filter (a corrected row under Open): take the row now in its place.
      const fallback = (rowsNow[returnIndex.current] ?? rowsNow[rowsNow.length - 1]) as HTMLElement | undefined;
      if (button?.isConnected) button.focus();
      else if (row?.isConnected) row.focus();
      else if (fallback) fallback.focus();
      else bodyRef.current?.focus();
      returnFocus.current = null;
    }
  }, [editing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (compact) {
    const weakest = weakestOpen(items);
    return (
      <section {...rest} {...nisthaAttr("assumptionlog", rest)} ref={ref} className={cx(styles.compact, className)} aria-label={title}>
        <Lightbulb size={16} strokeWidth={ICON_STROKE} className={styles.compactIcon} aria-hidden="true" />
        <Badge tone={open > 0 ? "warning" : "neutral"} appearance="soft" size="sm">
          {`${open} open`}
        </Badge>
        {weakest ? (
          <span className={styles.compactText}>
            <span className={styles.compactLead}>Weakest:</span> {weakest.text}
          </span>
        ) : (
          <span className={styles.compactText}>No open assumptions</span>
        )}
        {weakest ? <Confidence value={weakest.confidence} /> : null}
      </section>
    );
  }

  function setFilter(next: AssumptionFilter) {
    if (filterProp === undefined) setInnerFilter(next);
    onFilterChange?.(next);
  }

  function startEdit(item: Assumption, index: number) {
    returnIndex.current = index;
    setEditing({ id: item.id, draft: item.correction ?? item.text });
  }

  function cancel() {
    returnFocus.current = editing?.id ?? null;
    setEditing(null);
  }

  function save() {
    if (!editing) return;
    const draft = editing.draft.trim();
    if (!draft) return;
    onCorrect?.(editing.id, draft);
    returnFocus.current = editing.id;
    setEditing(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancel();
    } else if (event.key === "Enter") {
      event.preventDefault();
      save();
    }
  }

  const rows = filterAssumptions(sortAssumptions(items), filter);

  return (
    <Card {...rest} {...nisthaAttr("assumptionlog", rest)} ref={ref} title={title} className={cx(styles.root, className)}>
      <div ref={bodyRef} tabIndex={-1} className={styles.body}>
        <div className={styles.toolbar}>
          <Badge tone={open > 0 ? "warning" : "neutral"} appearance="soft" size="md">
            {`${open} open`}
          </Badge>
          <SegmentedControl
            size="sm"
            ariaLabel="Show assumptions"
            items={FILTERS}
            value={filter}
            onChange={(value) => setFilter(value as AssumptionFilter)}
          />
        </div>

        {rows.length === 0 ? (
          <Empty icon={Lightbulb} title={emptyTitle(filter)} description={filter === "open" ? "Every guess is confirmed or corrected." : undefined} />
        ) : (
          <ul ref={listRef} className={styles.list}>
            {rows.map((item, index) => {
              const isEditing = editing?.id === item.id;
              const steps = item.steps ?? [];
              const inputId = `${base}-${item.id}`;
              return (
                <li
                  key={item.id}
                  ref={(node) => {
                    rowRefs.current.set(item.id, node);
                  }}
                  tabIndex={-1}
                  className={cx(styles.row, styles[item.status])}
                >
                  {isEditing ? (
                    <div className={styles.edit}>
                      <label htmlFor={inputId} className={styles.editLabel}>
                        Correct: {item.text}
                      </label>
                      <Input
                        ref={inputRef}
                        id={inputId}
                        size="sm"
                        value={editing.draft}
                        onChange={(draft) => setEditing({ id: item.id, draft })}
                        onKeyDown={handleKeyDown}
                      />
                      <span className={styles.editActions}>
                        <Button size="sm" appearance="soft" mode="primary" disabled={!editing.draft.trim()} onClick={save}>
                          Save
                        </Button>
                        <Button size="sm" appearance="ghost" mode="neutral" shortcut="Esc" onClick={cancel}>
                          Cancel
                        </Button>
                        {steps.length > 0 ? <span className={styles.redoHint}>{`Agent will redo ${plural(steps.length, "step")}`}</span> : null}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className={styles.main}>
                        {item.status === "corrected" && item.correction ? (
                          <p className={styles.text}>
                            <del className={styles.old}>
                              <span className={styles.srOnly}>Was: </span>
                              {item.text}
                            </del>{" "}
                            <ins className={styles.new}>
                              <span className={styles.srOnly}>Now: </span>
                              {item.correction}
                            </ins>
                          </p>
                        ) : (
                          <p className={styles.text}>{item.text}</p>
                        )}
                        <div className={styles.meta}>
                          <Confidence value={item.confidence} />
                          {item.source ? <Tag size="sm">{item.source}</Tag> : null}
                          {steps.length > 0 ? <StepsPopover steps={steps} /> : null}
                          {item.status === "confirmed" ? <span className={styles.statusWord}>Confirmed</span> : null}
                          {item.status === "corrected" ? (
                            <span className={styles.statusWord}>
                              Corrected{steps.length > 0 ? ` · agent will redo ${plural(steps.length, "step")}` : ""}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {item.status === "open" && (onConfirm || onCorrect) ? (
                        <span className={styles.actions}>
                          {onConfirm ? (
                            <Button size="sm" appearance="outline" mode="neutral" iconStart="Check" onClick={() => onConfirm(item.id)}>
                              Confirm
                            </Button>
                          ) : null}
                          {onCorrect ? (
                            <Button
                              ref={(node) => {
                                correctRefs.current.set(item.id, node);
                              }}
                              size="sm"
                              appearance="ghost"
                              mode="neutral"
                              iconStart="Pencil"
                              onClick={() => startEdit(item, index)}
                            >
                              Correct
                            </Button>
                          ) : null}
                        </span>
                      ) : null}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
