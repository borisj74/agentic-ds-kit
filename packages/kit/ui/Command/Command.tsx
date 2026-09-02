"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { LucideByName } from "../Button/lucideName";
import type { CommandProps } from "./Command.types";
import styles from "./Command.module.css";

export type { CommandProps, CommandGroup, CommandItem } from "./Command.types";

const DEFAULT_PLACEHOLDER = "Type a command or search...";
const DEFAULT_EMPTY = "No results found.";
const DEFAULT_LABEL = "Command menu";

export function Command({
  placeholder = DEFAULT_PLACEHOLDER,
  empty = DEFAULT_EMPTY,
  groups,
  onSelect,
  label = DEFAULT_LABEL,
}: CommandProps) {
  const uid = useId();
  const listboxId = `${uid}-list`;
  const [query, setQuery] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((group) => ({
        heading: group.heading,
        items: q
          ? group.items.filter((item) => item.label.toLowerCase().includes(q))
          : group.items,
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  const enabledIds = useMemo(
    () =>
      visibleGroups.flatMap((group) =>
        group.items.filter((item) => !item.disabled).map((item) => item.id),
      ),
    [visibleGroups],
  );

  const activeId =
    highlightId && enabledIds.includes(highlightId) ? highlightId : (enabledIds[0] ?? null);

  function optionId(id: string) {
    return `${uid}-opt-${id}`;
  }

  function select(id: string) {
    const item = visibleGroups.flatMap((group) => group.items).find((entry) => entry.id === id);
    if (!item || item.disabled) return;
    onSelect?.(id);
  }

  function move(delta: number) {
    if (enabledIds.length === 0) return;
    const current = activeId ? enabledIds.indexOf(activeId) : -1;
    const next = (current + delta + enabledIds.length) % enabledIds.length;
    setHighlightId(enabledIds[next]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
      case "Home":
        event.preventDefault();
        if (enabledIds[0]) setHighlightId(enabledIds[0]);
        break;
      case "End":
        event.preventDefault();
        if (enabledIds.length) setHighlightId(enabledIds[enabledIds.length - 1]);
        break;
      case "Enter":
        event.preventDefault();
        if (activeId) select(activeId);
        break;
      default:
        break;
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.search}>
        <LucideByName name="Search" size={16} className={styles.searchIcon} />
        <input
          type="search"
          role="combobox"
          className={styles.input}
          placeholder={placeholder}
          value={query}
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          aria-expanded={true}
          aria-controls={listboxId}
          aria-activedescendant={activeId ? optionId(activeId) : undefined}
          aria-autocomplete="list"
          aria-label={label}
        />
      </div>
      <div id={listboxId} role="listbox" className={styles.list} aria-label={label}>
        {visibleGroups.length === 0 ? (
          <div className={styles.empty}>{empty}</div>
        ) : (
          visibleGroups.map((group, index) => (
            <div key={group.heading ?? `group-${index}`} className={styles.group}>
              {group.heading ? <div className={styles.heading}>{group.heading}</div> : null}
              {group.items.map((item) => {
                const highlighted = item.id === activeId;
                return (
                  <div
                    key={item.id}
                    id={optionId(item.id)}
                    role="option"
                    aria-selected={highlighted}
                    aria-disabled={item.disabled || undefined}
                    className={`${styles.item}${highlighted ? ` ${styles.itemHighlighted}` : ""}${
                      item.disabled ? ` ${styles.itemDisabled}` : ""
                    }`}
                    onMouseEnter={() => {
                      if (!item.disabled) setHighlightId(item.id);
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      if (!item.disabled) select(item.id);
                    }}
                  >
                    <LucideByName name={item.icon} size={16} className={styles.itemIcon} />
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.shortcut ? <span className={styles.shortcut}>{item.shortcut}</span> : null}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
