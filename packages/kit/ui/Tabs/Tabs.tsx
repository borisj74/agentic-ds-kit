"use client";

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import type { TabItem, TabsProps } from "./Tabs.types";
import { Count } from "../Count";
import { DropdownMenu } from "../DropdownMenu";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useKitLabels } from "../shared/labels";
import styles from "./Tabs.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { TabsProps, TabItem, TabsSize, TabsVariant, TabsOverflow, TabsActivation } from "./Tabs.types";

function firstEnabledId(items: TabsProps["items"], preferred?: string) {
  if (preferred && items.some((item) => item.id === preferred && !item.disabled)) {
    return preferred;
  }
  return items.find((item) => !item.disabled)?.id;
}

function px(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** The tabs shown in the list: the first `count`, with the selected tab swapped in when it would be hidden. */
function visibleTabs(items: TabItem[], count: number, selected: string | undefined) {
  if (count >= items.length) return items;
  const shown = items.slice(0, Math.max(1, count));
  if (selected && !shown.some((item) => item.id === selected)) {
    const picked = items.find((item) => item.id === selected);
    if (picked) shown[shown.length - 1] = picked;
  }
  return shown;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  size = "md",
  variant = "line",
  overflow = "scroll",
  activation = "automatic",
  fill = false,
  ariaLabel = "Tabs",
  className,
  ref,
  ...rest
}: TabsProps) {
  const labels = useKitLabels();
  const baseId = useId();
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(() => firstEnabledId(items, defaultValue) ?? items[0]?.id);
  const selected = (isControlled ? value : internal) ?? items[0]?.id;
  const selectedItem = items.find((item) => item.id === selected) ?? items.find((item) => !item.disabled) ?? items[0];
  const [focusId, setFocusId] = useState<string | undefined>(undefined);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const tabWidths = useRef(new Map<string, number>());
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });
  const [visibleCount, setVisibleCount] = useState(items.length);

  const isMore = overflow === "more";
  const shown = isMore ? visibleTabs(items, visibleCount, selectedItem?.id) : items;
  const hidden = isMore ? items.filter((item) => !shown.includes(item)) : [];
  // Re-measure tab widths when anything that changes them changes.
  const signature = `${size}|${variant}|${items
    .map((item) => `${item.id}:${item.label}:${item.count ?? ""}:${item.icon ? 1 : 0}`)
    .join(",")}`;

  function select(id: string) {
    const item = items.find((entry) => entry.id === id);
    if (!item || item.disabled) return;
    setFocusId(id);
    if (!isControlled) setInternal(id);
    onChange?.(id);
  }

  useLayoutEffect(() => {
    tabWidths.current.clear();
  }, [signature]);

  // overflow="more": fit as many tabs as the row holds and move the rest into the More menu.
  useLayoutEffect(() => {
    if (!isMore) return;
    function measure() {
      const root = rootRef.current;
      const list = listRef.current;
      if (!root || !list) return;
      tabRefs.current.forEach((node, id) => tabWidths.current.set(id, node.offsetWidth));
      if (items.some((item) => !tabWidths.current.has(item.id))) {
        setVisibleCount(items.length);
        return;
      }
      const listStyle = getComputedStyle(list);
      const gap = px(listStyle.columnGap);
      const padding = px(listStyle.paddingLeft) + px(listStyle.paddingRight);
      const available = root.clientWidth;
      const widths = items.map((item) => tabWidths.current.get(item.id) ?? 0);
      const total = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, items.length - 1) + padding;
      let next = items.length;
      if (total > available) {
        const more = moreRef.current;
        const moreWidth = more ? more.offsetWidth + px(getComputedStyle(more).marginLeft) : 0;
        const budget = available - moreWidth - padding;
        let used = 0;
        next = 0;
        for (const width of widths) {
          const add = (next === 0 ? 0 : gap) + width;
          if (used + add > budget) break;
          used += add;
          next += 1;
        }
        next = Math.max(1, next);
      }
      setVisibleCount((current) => (current === next ? current : next));
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [isMore, signature, visibleCount, items]);

  useLayoutEffect(() => {
    function update() {
      const list = listRef.current;
      const active = selected ? tabRefs.current.get(selected) : undefined;
      if (!list || !active) {
        setIndicator((current) => ({ ...current, ready: false }));
        return;
      }
      setIndicator({
        left: active.offsetLeft,
        top: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
        ready: true,
      });
    }

    update();
    const observer = new ResizeObserver(update);
    if (listRef.current) observer.observe(listRef.current);
    tabRefs.current.forEach((node) => observer.observe(node));
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [selected, size, variant, items, visibleCount]);

  function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = shown.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    const from = activation === "manual" ? (focusId ?? selected) : selected;
    const index = enabled.findIndex((item) => item.id === from);
    const current = index < 0 ? 0 : index;
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % enabled.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + enabled.length) % enabled.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    else return;
    event.preventDefault();
    const target = enabled[next].id;
    if (activation === "manual") setFocusId(target);
    else select(target);
    tabRefs.current.get(target)?.focus();
  }

  if (!selectedItem) return null;
  const showPanel = selectedItem.content != null && selectedItem.content !== false;
  const stopId = activation === "manual" && focusId && shown.some((item) => item.id === focusId) ? focusId : selected;

  return (
    <div
      {...rest} {...nisthaAttr("tabs", rest)}
      ref={mergeRefs(ref, rootRef)}
      className={cx(
        styles.tabs,
        styles[size],
        styles[variant],
        styles[overflow],
        !showPanel && styles.listOnly,
        fill && showPanel && styles.fill,
        className,
      )}
    >
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        className={styles.list}
        onKeyDown={onListKeyDown}
      >
        <span
          className={styles.indicator}
          data-ready={indicator.ready ? "" : undefined}
          aria-hidden
          style={{
            transform: `translate(${indicator.left}px, ${indicator.top}px)`,
            width: indicator.width,
            height: indicator.height,
          }}
        />
        {shown.map((item) => {
          const isSelected = item.id === selected;
          const triggerId = `${baseId}-trigger-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;
          return (
            <button
              key={item.id}
              id={triggerId}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              className={styles.trigger}
              aria-selected={isSelected}
              aria-controls={showPanel ? panelId : undefined}
              tabIndex={item.id === stopId ? 0 : -1}
              disabled={item.disabled}
              data-state={isSelected ? "active" : "inactive"}
              onClick={() => select(item.id)}
            >
              {item.icon ? <LucideByName name={item.icon} size={16} className={styles.icon} /> : null}
              {item.label}
              {typeof item.count === "number" ? (
                <Count count={item.count} intent="neutral" subtle size={size === "lg" ? "md" : "sm"} disabled={item.disabled} />
              ) : null}
            </button>
          );
        })}
      </div>
      {isMore ? (
        <div ref={moreRef} className={cx(styles.moreSlot, hidden.length === 0 && styles.moreSlotIdle)} aria-hidden={hidden.length === 0 || undefined}>
          <DropdownMenu
            trigger={labels.moreTabs}
            iconEnd="ChevronDown"
            appearance="ghost"
            mode="neutral"
            size={size === "lg" ? "md" : "sm"}
            align="end"
            disabled={hidden.length === 0}
            groups={[
              {
                items: hidden.map((item) => ({
                  id: item.id,
                  label: typeof item.count === "number" ? `${item.label} (${item.count})` : item.label,
                  icon: item.icon,
                  disabled: item.disabled,
                })),
              },
            ]}
            onSelect={select}
          />
        </div>
      ) : null}
      {showPanel ? (
        <div
          id={`${baseId}-panel-${selectedItem.id}`}
          role="tabpanel"
          className={styles.content}
          aria-labelledby={`${baseId}-trigger-${selectedItem.id}`}
          tabIndex={0}
        >
          {selectedItem.content}
        </div>
      ) : null}
    </div>
  );
}
