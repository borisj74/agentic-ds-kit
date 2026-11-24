"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Scorecard } from "../Scorecard";
import type { ScoreboardItem, ScoreboardProps } from "./Scoreboard.types";
import { cx } from "../shared/cx";
import styles from "./Scoreboard.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { ScoreboardProps, ScoreboardItem, ScoreboardAppearance } from "./Scoreboard.types";

/** Grid class by count: one row up to six, more wrap on --layout-metrics-min columns. */
function countClass(count: number): string | undefined {
  if (count <= 1) return styles.count1;
  if (count <= 6) return styles[`count${count}`];
  return styles.countMany;
}

const keyOf = (item: ScoreboardItem) => item.id ?? item.label;

/** Next index for an arrow, Home or End key in a strip of `count`, wrapping; null for other keys. */
export function scoreboardKeyTarget(key: string, index: number, count: number): number | null {
  if (count < 1) return null;
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (index + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (index - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

export function Scoreboard({
  items,
  scroll: _scroll,
  appearance = "cards",
  selectable = false,
  value,
  defaultValue,
  onValueChange,
  "aria-label": ariaLabel = "Key metrics",
  className,
  ref,
  ...rest
}: ScoreboardProps) {
  const [internal, setInternal] = useState(() => defaultValue ?? (items[0] ? keyOf(items[0]) : ""));
  const checked = value ?? internal;
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const checkedIndex = Math.max(0, items.findIndex((item) => keyOf(item) === checked));
  const divided = appearance === "divided";
  void _scroll;

  function choose(index: number) {
    const item = items[index];
    if (!item) return;
    const next = keyOf(item);
    if (value === undefined) setInternal(next);
    if (next !== checked) onValueChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>, index: number) {
    const target = scoreboardKeyTarget(event.key, index, items.length);
    if (target === null) return;
    event.preventDefault();
    choose(target);
    cardRefs.current[target]?.focus();
  }

  function card(item: ScoreboardItem, index: number) {
    if (!selectable) {
      return <Scorecard {...item} appearance={divided ? "plain" : item.appearance} fill />;
    }
    const { id: _id, ...cardProps } = item;
    void _id;
    const isChecked = index === checkedIndex;
    return (
      <Scorecard
        {...cardProps}
        ref={(node) => {
          cardRefs.current[index] = node;
        }}
        appearance={divided ? "plain" : cardProps.appearance}
        fill
        selected={isChecked}
        selectionRole="radio"
        tabIndex={isChecked ? 0 : -1}
        onClick={(event) => {
          choose(index);
          cardProps.onClick?.(event);
        }}
        onKeyDown={(event) => onKeyDown(event, index)}
      />
    );
  }

  const groupProps = selectable ? { role: "radiogroup", "aria-label": ariaLabel } : {};

  return (
    <section
      {...rest}
      {...nisthaAttr("scoreboard", rest)}
      ref={ref}
      className={cx(styles.scoreboard, divided && styles.divided, className)}
      aria-label={ariaLabel}
    >
      <div className={cx(styles.grid, countClass(items.length))} {...groupProps}>
        {items.map((item, index) => (
          <div key={keyOf(item)} className={styles.cell}>
            {card(item, index)}
          </div>
        ))}
      </div>
    </section>
  );
}
