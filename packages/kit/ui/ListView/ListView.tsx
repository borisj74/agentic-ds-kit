"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { Checkbox } from "../Checkbox";
import { DropdownMenu } from "../DropdownMenu";
import { Empty } from "../Empty";
import type { ListViewGroup, ListViewItem, ListViewProps } from "./ListView.types";
import styles from "./ListView.module.css";

export type {
  ListViewAction,
  ListViewEmpty,
  ListViewGroup,
  ListViewInteraction,
  ListViewItem,
  ListViewProps,
  ListViewSelection,
  ListViewSize,
} from "./ListView.types";

const GROUP_PREFIX = "group:";

function hasAvatar(item: ListViewItem): boolean {
  return Boolean(item.name || item.src || item.initials);
}

function bindInertControls(el: HTMLElement | null) {
  el?.querySelectorAll("button, input").forEach((node) => {
    (node as HTMLElement).tabIndex = -1;
  });
}

function sectionsOf(items: ListViewItem[], groups?: ListViewGroup[]): { group: ListViewGroup | null; items: ListViewItem[] }[] {
  if (!groups?.length) return [{ group: null, items }];
  const known = new Set(groups.map((group) => group.id));
  const byGroup = new Map<string, ListViewItem[]>();
  const loose: ListViewItem[] = [];
  for (const item of items) {
    if (item.group && known.has(item.group)) {
      const list = byGroup.get(item.group) ?? [];
      list.push(item);
      byGroup.set(item.group, list);
    } else {
      loose.push(item);
    }
  }
  const sections: { group: ListViewGroup | null; items: ListViewItem[] }[] = [];
  if (loose.length) sections.push({ group: null, items: loose });
  for (const group of groups) {
    const list = byGroup.get(group.id);
    if (list?.length) sections.push({ group, items: list });
  }
  return sections;
}

export function ListView({
  items,
  label,
  size = "md",
  selection = "none",
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  interaction = "none",
  onOpen,
  onAction,
  groups,
  collapsibleGroups = false,
  empty,
}: ListViewProps) {
  const uid = useId();
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const selectedControlled = selectedProp !== undefined;
  const [selectedUncontrolled, setSelectedUncontrolled] = useState<string[]>(defaultSelected ?? []);
  const selectedIds = selectedControlled ? selectedProp : selectedUncontrolled;
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const sections = useMemo(() => sectionsOf(items, groups), [items, groups]);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const collapsedSet = useMemo(() => new Set(collapsed), [collapsed]);
  const shown = useMemo(() => {
    const keys: string[] = [];
    for (const section of sections) {
      if (section.group && collapsibleGroups) keys.push(`${GROUP_PREFIX}${section.group.id}`);
      if (section.group && collapsedSet.has(section.group.id)) continue;
      for (const item of section.items) keys.push(item.id);
    }
    return keys;
  }, [sections, collapsibleGroups, collapsedSet]);
  const [focusedKey, setFocusedKey] = useState<string | null>(shown[0] ?? null);
  const selectable = selection !== "none";
  const drill = interaction === "drill";
  const listRole = selectable ? "listbox" : "list";
  const itemRole = selectable ? "option" : "listitem";
  const iconPx = size === "sm" ? 16 : 18;
  const avatarSize = size === "sm" ? "sm" : "md";
  const checkSize = size === "sm" ? "sm" : "md";

  function setSelected(next: string[]) {
    if (!selectable) return;
    if (!selectedControlled) setSelectedUncontrolled(next);
    onSelectedChange?.(next);
  }

  function applySelection(id: string) {
    const item = items.find((entry) => entry.id === id);
    if (!item || item.disabled || !selectable) return;
    if (selection === "single") {
      setSelected([id]);
      return;
    }
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected([...next]);
  }

  function focusKey(key: string) {
    setFocusedKey(key);
    requestAnimationFrame(() => itemRefs.current.get(key)?.focus());
  }

  function toggleGroup(id: string) {
    if (!collapsibleGroups) return;
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed([...next]);
  }

  function openItem(item: ListViewItem) {
    if (!drill || item.disabled) return;
    onOpen?.(item.id);
  }

  function onListKeyDown(event: KeyboardEvent<HTMLElement>, key: string) {
    if (event.currentTarget !== event.target) return;
    const index = shown.indexOf(key);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = shown[index + 1];
      if (next) focusKey(next);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = shown[index - 1];
      if (prev) focusKey(prev);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      if (shown[0]) focusKey(shown[0]);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const last = shown[shown.length - 1];
      if (last) focusKey(last);
      return;
    }
    if (key.startsWith(GROUP_PREFIX)) {
      const groupId = key.slice(GROUP_PREFIX.length);
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const open = !collapsedSet.has(groupId);
        if (event.key === "ArrowRight" && open) return;
        if (event.key === "ArrowLeft" && !open) return;
        toggleGroup(groupId);
      }
      return;
    }
    const item = items.find((entry) => entry.id === key);
    if (!item || item.disabled) return;
    if (event.key === " ") {
      event.preventDefault();
      applySelection(item.id);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (drill) openItem(item);
      else applySelection(item.id);
    }
  }

  function onRowClick(event: MouseEvent<HTMLElement>, item: ListViewItem) {
    if ((event.target as HTMLElement).closest("button, input, a")) return;
    if (item.disabled) return;
    applySelection(item.id);
    if (drill) openItem(item);
  }

  function renderLeading(item: ListViewItem): ReactNode {
    if (hasAvatar(item)) {
      return (
        <span className={styles.leading}>
          <Avatar
            name={item.name ?? item.primary}
            src={item.src}
            initials={item.initials}
            size={avatarSize}
          />
        </span>
      );
    }
    if (item.icon) {
      return (
        <span className={styles.leading} aria-hidden>
          <LucideByName name={item.icon} size={iconPx} />
        </span>
      );
    }
    return null;
  }

  function renderActions(item: ListViewItem): ReactNode {
    const actions = item.actions ?? [];
    if (actions.length === 0) return null;
    const stop = (event: MouseEvent) => event.stopPropagation();
    if (actions.length > 2) {
      return (
        <span className={styles.actions} onClick={stop}>
          <DropdownMenu
            iconStart="Ellipsis"
            ariaLabel={`Actions for ${item.primary}`}
            variant="tertiary"
            size="sm"
            align="end"
            disabled={item.disabled}
            groups={[
              {
                items: actions.map((action) => ({
                  id: action.id,
                  label: action.label,
                  icon: action.icon,
                  danger: action.danger,
                  disabled: action.disabled,
                })),
              },
            ]}
            onSelect={(actionId) => onAction?.(item.id, actionId)}
          />
        </span>
      );
    }
    return (
      <span className={styles.actions} onClick={stop}>
        {actions.map((action) =>
          action.icon ? (
            <Button
              key={action.id}
              size="sm"
              variant={action.danger ? "danger" : "tertiary"}
              iconStart={action.icon}
              ariaLabel={action.label}
              disabled={item.disabled || action.disabled}
              onClick={() => onAction?.(item.id, action.id)}
            />
          ) : (
            <Button
              key={action.id}
              size="sm"
              variant={action.danger ? "danger" : "tertiary"}
              disabled={item.disabled || action.disabled}
              onClick={() => onAction?.(item.id, action.id)}
            >
              {action.label}
            </Button>
          ),
        )}
      </span>
    );
  }

  function renderCopy(item: ListViewItem): ReactNode {
    return (
      <span className={styles.copy}>
        <span className={styles.primary}>{item.primary}</span>
        {item.secondary ? <span className={styles.secondary}>{item.secondary}</span> : null}
      </span>
    );
  }

  function renderBody(item: ListViewItem): ReactNode {
    const leading = renderLeading(item);
    if (drill) {
      return (
        <button
          type="button"
          className={styles.body}
          tabIndex={-1}
          disabled={item.disabled}
          onClick={(event) => {
            event.stopPropagation();
            if (item.disabled) return;
            if (selection === "single") applySelection(item.id);
            openItem(item);
          }}
        >
          {leading}
          {renderCopy(item)}
        </button>
      );
    }
    return (
      <div className={styles.body}>
        {leading}
        {renderCopy(item)}
      </div>
    );
  }

  const rootClass = `${styles.root} ${styles[size]}`;

  if (items.length === 0) {
    return (
      <div className={rootClass} role={listRole} aria-label={label} tabIndex={0}>
        <Empty
          title={empty?.title ?? "No records"}
          description={empty?.description}
          icon={empty?.icon}
          outlined={empty?.outlined}
        />
      </div>
    );
  }

  return (
    <div
      className={rootClass}
      role={listRole}
      aria-label={label}
      aria-multiselectable={selection === "multiple" || undefined}
    >
      {sections.map((section) => {
        const group = section.group;
        const groupKey = group ? `${GROUP_PREFIX}${group.id}` : null;
        const open = group ? !collapsedSet.has(group.id) : true;
        const groupTab = groupKey && (focusedKey === groupKey || (focusedKey === null && shown[0] === groupKey)) ? 0 : -1;
        return (
          <div
            key={group?.id ?? "ungrouped"}
            className={styles.group}
            role={group ? "group" : undefined}
            aria-labelledby={group ? `${uid}-${group.id}-label` : undefined}
          >
            {group && collapsibleGroups ? (
              <button
                type="button"
                id={`${uid}-${group.id}-label`}
                ref={(el) => {
                  if (!groupKey) return;
                  if (el) itemRefs.current.set(groupKey, el);
                  else itemRefs.current.delete(groupKey);
                }}
                className={`${styles.groupHeader}${open ? ` ${styles.groupHeaderOpen}` : ""}`}
                tabIndex={groupTab}
                aria-expanded={open}
                onFocus={() => groupKey && setFocusedKey(groupKey)}
                onKeyDown={(event) => groupKey && onListKeyDown(event, groupKey)}
                onClick={() => toggleGroup(group.id)}
              >
                <span className={styles.groupTwist} aria-hidden>
                  <LucideByName name="ChevronRight" size={14} className={styles.groupTwistIcon} />
                </span>
                {group.label}
              </button>
            ) : group ? (
              <div id={`${uid}-${group.id}-label`} className={styles.groupHeader}>
                {group.label}
              </div>
            ) : null}
            {open
              ? section.items.map((item) => {
                  const itemId = `${uid}-${item.id}`;
                  const isSelected = selectable && selected.has(item.id);
                  const tabIndex =
                    focusedKey === item.id || (focusedKey === null && shown[0] === item.id) ? 0 : -1;
                  return (
                    <div
                      key={item.id}
                      id={itemId}
                      ref={(el) => {
                        if (el) itemRefs.current.set(item.id, el);
                        else itemRefs.current.delete(item.id);
                      }}
                      role={itemRole}
                      className={styles.item}
                      tabIndex={tabIndex}
                      aria-label={item.secondary ? `${item.primary}, ${item.secondary}` : item.primary}
                      aria-selected={selectable ? isSelected : undefined}
                      aria-disabled={item.disabled || undefined}
                      onFocus={() => setFocusedKey(item.id)}
                      onKeyDown={(event) => onListKeyDown(event, item.id)}
                      onClick={(event) => onRowClick(event, item)}
                    >
                      <div
                        className={styles.row}
                        data-selected={isSelected || undefined}
                        data-disabled={item.disabled || undefined}
                      >
                        {selection === "multiple" ? (
                          <span
                            className={styles.check}
                            ref={bindInertControls}
                            aria-hidden
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Checkbox
                              id={`${itemId}-check`}
                              size={checkSize}
                              ariaLabel={`Select ${item.primary}`}
                              checked={isSelected}
                              disabled={item.disabled}
                              onChange={() => {
                                applySelection(item.id);
                                focusKey(item.id);
                              }}
                            />
                          </span>
                        ) : null}
                        {renderBody(item)}
                        <span className={styles.trail} ref={bindInertControls}>
                          {item.badge ? (
                            <Badge tone={item.badgeTone ?? "neutral"} size="sm">
                              {item.badge}
                            </Badge>
                          ) : null}
                          {renderActions(item)}
                          {drill ? (
                            <span className={styles.chevron} aria-hidden>
                              <LucideByName name="ChevronRight" size={iconPx} />
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        );
      })}
    </div>
  );
}
