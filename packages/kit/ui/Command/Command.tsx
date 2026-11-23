"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { LucideByName } from "../Button/lucideName";
import { Spinner } from "../Spinner";
import { Keycaps, ariaKeyShortcuts } from "../shared/shortcut";
import { useKitLabels } from "../shared/labels";
import type { CommandItem, CommandProps } from "./Command.types";
import { cx } from "../shared/cx";
import styles from "./Command.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { CommandProps, CommandGroup, CommandItem } from "./Command.types";

const DEFAULT_PLACEHOLDER = "Type a command or search...";
const DEFAULT_EMPTY = "No results found.";
const DEFAULT_LABEL = "Command menu";
/** Internal id of the Ask row; never collides with a consumer id because of the NUL prefix. */
const ASK_ID = "\u0000ask";

function matches(item: CommandItem, q: string): boolean {
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.description?.toLowerCase().includes(q)) return true;
  return Boolean(item.keywords?.some((keyword) => keyword.toLowerCase().includes(q)));
}

export function Command({
  placeholder = DEFAULT_PLACEHOLDER,
  empty = DEFAULT_EMPTY,
  groups,
  onSelect,
  label = DEFAULT_LABEL,
  loading = false,
  onAsk,
  className,
  ref,
  ...rest
}: CommandProps) {
  const labels = useKitLabels();
  const uid = useId();
  const listboxId = `${uid}-list`;
  const [query, setQuery] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const trimmed = query.trim();

  const visibleGroups = useMemo(() => {
    const q = trimmed.toLowerCase();
    return groups
      .map((group) => ({
        heading: group.heading,
        items: q ? group.items.filter((item) => matches(item, q)) : group.items,
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, trimmed]);

  const resultCount = useMemo(
    () => visibleGroups.reduce((sum, group) => sum + group.items.length, 0),
    [visibleGroups],
  );

  const enabledIds = useMemo(() => {
    const ids = visibleGroups.flatMap((group) =>
      group.items.filter((item) => !item.disabled).map((item) => item.id),
    );
    if (onAsk) ids.push(ASK_ID);
    return ids;
  }, [visibleGroups, onAsk]);

  const activeId =
    highlightId && enabledIds.includes(highlightId) ? highlightId : (enabledIds[0] ?? null);

  function optionId(id: string) {
    return id === ASK_ID ? `${uid}-ask` : `${uid}-opt-${id}`;
  }

  function select(id: string) {
    if (id === ASK_ID) {
      onAsk?.(trimmed);
      return;
    }
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

  const askHighlighted = activeId === ASK_ID;
  const showEmpty = visibleGroups.length === 0 && !loading;

  return (
    <div {...rest} {...nisthaAttr("command", rest)} ref={ref} className={cx(styles.root, className)}>
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
        <Keycaps shortcut="Esc" className={styles.escHint} />
      </div>
      <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {trimmed && !loading ? labels.resultCount(resultCount) : ""}
      </div>
      <div
        id={listboxId}
        role="listbox"
        className={styles.list}
        aria-label={label}
        aria-busy={loading || undefined}
      >
        {showEmpty ? <div className={styles.empty}>{empty}</div> : null}
        {visibleGroups.map((group, index) => (
          <div key={group.heading ?? `group-${index}`} className={styles.group} role="group" aria-label={group.heading}>
            {group.heading ? (
              <div className={styles.heading} aria-hidden="true">
                {group.heading}
              </div>
            ) : null}
            {group.items.map((item) => {
              const highlighted = item.id === activeId;
              return (
                <div
                  key={item.id}
                  id={optionId(item.id)}
                  role="option"
                  aria-selected={highlighted}
                  aria-disabled={item.disabled || undefined}
                  aria-keyshortcuts={ariaKeyShortcuts(item.shortcut)}
                  className={cx(styles.item, highlighted && styles.itemHighlighted, item.disabled && styles.itemDisabled)}
                  onMouseEnter={() => {
                    if (!item.disabled) setHighlightId(item.id);
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    if (!item.disabled) select(item.id);
                  }}
                >
                  <LucideByName name={item.icon} size={16} className={styles.itemIcon} />
                  <span className={styles.itemText}>
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.description ? <span className={styles.itemDescription}>{item.description}</span> : null}
                  </span>
                  {item.shortcut ? <Keycaps shortcut={item.shortcut} /> : null}
                </div>
              );
            })}
          </div>
        ))}
        {loading ? (
          <div className={styles.loading}>
            <Spinner size="sm" label={labels.loadingResults} />
          </div>
        ) : null}
        {onAsk ? (
          <div className={styles.askGroup} role="group">
            <div
              id={optionId(ASK_ID)}
              role="option"
              aria-selected={askHighlighted}
              className={cx(styles.item, askHighlighted && styles.itemHighlighted)}
              onMouseEnter={() => setHighlightId(ASK_ID)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(ASK_ID)}
            >
              <LucideByName name="MessageCircle" size={16} className={styles.itemIcon} />
              <span className={styles.itemText}>
                <span className={styles.itemLabel}>{labels.ask}</span>
                <span className={styles.itemDescription}>
                  {trimmed ? labels.askAbout(trimmed) : labels.askHint}
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </div>
      <div className={styles.footer} aria-hidden="true">
        <span className={styles.footerKey}>
          <Keycaps shortcut="↑ ↓" />
          {labels.navigate}
        </span>
        <span className={styles.footerKey}>
          <Keycaps shortcut="↵" />
          {labels.openItem}
        </span>
        <span className={cx(styles.footerKey, styles.escHint)}>
          <Keycaps shortcut="Esc" />
          {labels.close}
        </span>
      </div>
    </div>
  );
}
