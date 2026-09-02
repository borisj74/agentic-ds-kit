"use client";

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import type { TabsProps } from "./Tabs.types";
import styles from "./Tabs.module.css";

export type { TabsProps, TabItem, TabsSize, TabsVariant } from "./Tabs.types";

function firstEnabledId(items: TabsProps["items"], preferred?: string) {
  if (preferred && items.some((item) => item.id === preferred && !item.disabled)) {
    return preferred;
  }
  return items.find((item) => !item.disabled)?.id;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  size = "md",
  variant = "segmented",
  ariaLabel = "Tabs",
}: TabsProps) {
  const baseId = useId();
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(() => firstEnabledId(items, defaultValue) ?? items[0]?.id);
  const selected = (isControlled ? value : internal) ?? items[0]?.id;
  const selectedItem = items.find((item) => item.id === selected) ?? items.find((item) => !item.disabled) ?? items[0];

  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  function select(id: string) {
    const item = items.find((entry) => entry.id === id);
    if (!item || item.disabled) return;
    if (!isControlled) setInternal(id);
    onChange?.(id);
  }

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
  }, [selected, size, variant, items]);

  function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    const index = enabled.findIndex((item) => item.id === selected);
    const current = index < 0 ? 0 : index;
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % enabled.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + enabled.length) % enabled.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    else return;
    event.preventDefault();
    select(enabled[next].id);
    tabRefs.current.get(enabled[next].id)?.focus();
  }

  if (!selectedItem) return null;
  const showPanel = selectedItem.content != null && selectedItem.content !== false;

  return (
    <div
      className={`${styles.tabs} ${styles[size]} ${styles[variant]}${showPanel ? "" : ` ${styles.listOnly}`}`}
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
        {items.map((item) => {
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
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              data-state={isSelected ? "active" : "inactive"}
              onClick={() => select(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
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
