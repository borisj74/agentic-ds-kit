"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { LucideByName } from "../Button/lucideName";
import type { TileGroupItem, TileGroupProps } from "./TileGroup.types";
import { cx } from "../shared/cx";
import styles from "./TileGroup.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  TileGroupProps,
  TileGroupItem,
  TileGroupSelection,
  TileGroupSingleProps,
  TileGroupMultipleProps,
} from "./TileGroup.types";

function enabledItems(items: TileGroupItem[], groupDisabled: boolean) {
  if (groupDisabled) return [];
  return items.filter((item) => !item.disabled);
}

export function TileGroup({
  items,
  ariaLabel,
  disabled = false,
  selection = "single",
  value,
  defaultValue,
  onChange,
  className,
  ref,
  ...rest
}: TileGroupProps) {
  const multiple = selection === "multiple";
  const isControlled = value !== undefined;
  const [internalSingle, setInternalSingle] = useState(() =>
    typeof defaultValue === "string"
      ? defaultValue
      : items.find((item) => !item.disabled)?.value,
  );
  const [internalMulti, setInternalMulti] = useState<string[]>(() =>
    Array.isArray(defaultValue) ? defaultValue : [],
  );
  const [cursor, setCursor] = useState<string | null>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());

  const selectedSingle = typeof value === "string" ? value : internalSingle;
  const selectedMulti = Array.isArray(value) ? value : internalMulti;
  const enabled = enabledItems(items, disabled);

  function isChecked(id: string) {
    return multiple ? selectedMulti.includes(id) : selectedSingle === id;
  }

  const tabValue =
    cursor && enabled.some((item) => item.value === cursor)
      ? cursor
      : (enabled.find((item) => isChecked(item.value))?.value ?? enabled[0]?.value);

  function selectSingle(next: string) {
    if (multiple || disabled) return;
    const item = items.find((entry) => entry.value === next);
    if (!item || item.disabled) return;
    if (!isControlled) setInternalSingle(next);
    const change = onChange as ((nextValue: string) => void) | undefined;
    change?.(next);
    setCursor(next);
  }

  function toggleMulti(id: string) {
    if (!multiple || disabled) return;
    const item = items.find((entry) => entry.value === id);
    if (!item || item.disabled) return;
    const next = selectedMulti.includes(id)
      ? selectedMulti.filter((entry) => entry !== id)
      : [...selectedMulti, id];
    if (!isControlled) setInternalMulti(next);
    const change = onChange as ((nextValue: string[]) => void) | undefined;
    change?.(next);
    setCursor(id);
  }

  function move(event: KeyboardEvent<HTMLDivElement>) {
    if (enabled.length === 0) return;
    const index = Math.max(
      0,
      enabled.findIndex((item) => item.value === tabValue),
    );
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % enabled.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + enabled.length) % enabled.length;
    } else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    else return;
    event.preventDefault();
    const target = enabled[next];
    if (multiple) {
      setCursor(target.value);
      itemRefs.current.get(target.value)?.focus();
      return;
    }
    selectSingle(target.value);
    itemRefs.current.get(target.value)?.focus();
  }

  return (
    <div
      {...rest} {...nisthaAttr("tilegroup", rest)}
      ref={ref}
      role={multiple ? "group" : "radiogroup"}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-selection={multiple ? "multiple" : "single"}
      className={cx(styles.root, className)}
      onKeyDown={move}
    >
      {items.map((item) => {
        const checked = isChecked(item.value);
        const itemDisabled = disabled || Boolean(item.disabled);
        return (
          <button
            key={item.value}
            ref={(node) => {
              if (node) itemRefs.current.set(item.value, node);
              else itemRefs.current.delete(item.value);
            }}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            className={styles.tile}
            aria-checked={checked}
            tabIndex={item.value === tabValue ? 0 : -1}
            disabled={itemDisabled}
            data-state={checked ? "checked" : "unchecked"}
            onClick={() => (multiple ? toggleMulti(item.value) : selectSingle(item.value))}
          >
            <span className={styles.mark} data-state={checked ? "checked" : "unchecked"} aria-hidden>
              {multiple && checked ? <LucideByName name="Check" size={14} className={styles.markIcon} /> : null}
              {!multiple && checked ? <span className={styles.dot} /> : null}
            </span>
            <span className={styles.copy}>
              <span className={styles.titleRow}>
                <span className={styles.title}>{item.title}</span>
                {item.meta != null && item.meta !== false ? (
                  <span className={styles.meta}>{item.meta}</span>
                ) : null}
              </span>
              {item.description ? <span className={styles.description}>{item.description}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
