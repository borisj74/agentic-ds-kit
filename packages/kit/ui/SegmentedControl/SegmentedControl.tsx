"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { LucideByName } from "../Button/lucideName";
import type { SegmentedControlItem, SegmentedControlProps } from "./SegmentedControl.types";
import { cx } from "../shared/cx";
import styles from "./SegmentedControl.module.css";

export type {
  SegmentedControlProps,
  SegmentedControlItem,
  SegmentedControlSize,
} from "./SegmentedControl.types";

const ICON_SIZE = { sm: 14, md: 16 } as const;

function enabledItems(items: SegmentedControlItem[], groupDisabled: boolean) {
  if (groupDisabled) return [];
  return items.filter((item) => !item.disabled);
}

function firstEnabledValue(items: SegmentedControlItem[], preferred?: string) {
  if (preferred && items.some((item) => item.value === preferred && !item.disabled)) {
    return preferred;
  }
  return items.find((item) => !item.disabled)?.value;
}

export function SegmentedControl({
  items,
  ariaLabel,
  value,
  defaultValue,
  onChange,
  size = "md",
  disabled = false,
  className,
  ref,
  ...rest
}: SegmentedControlProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(() => firstEnabledValue(items, defaultValue));
  const selected = isControlled ? value : internal;
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const enabled = enabledItems(items, disabled);
  const tabValue =
    selected && enabled.some((item) => item.value === selected)
      ? selected
      : enabled[0]?.value;

  function select(next: string) {
    const item = items.find((entry) => entry.value === next);
    if (!item || item.disabled || disabled) return;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (enabled.length === 0) return;
    const index = Math.max(
      0,
      enabled.findIndex((item) => item.value === (tabValue ?? selected)),
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
    select(target.value);
    itemRefs.current.get(target.value)?.focus();
  }

  return (
    <div
      {...rest}
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      aria-disabled={disabled || undefined}
      className={cx(styles.root, styles[size], className)}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => {
        const checked = item.value === selected;
        const itemDisabled = disabled || Boolean(item.disabled);
        return (
          <button
            key={item.value}
            ref={(node) => {
              if (node) itemRefs.current.set(item.value, node);
              else itemRefs.current.delete(item.value);
            }}
            type="button"
            role="radio"
            className={styles.item}
            aria-checked={checked}
            tabIndex={item.value === tabValue ? 0 : -1}
            disabled={itemDisabled}
            data-state={checked ? "checked" : "unchecked"}
            onClick={() => select(item.value)}
          >
            <LucideByName name={item.icon} size={ICON_SIZE[size]} className={styles.icon} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
