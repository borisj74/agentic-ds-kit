"use client";

import { Fragment, useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { Checkbox } from "../Checkbox";
import { DropdownMenu } from "../DropdownMenu";
import { Empty } from "../Empty";
import type { ListViewAction, ListViewGroup, ListViewItem, ListViewProps } from "./ListView.types";
import { cx } from "../shared/cx";
import styles from "./ListView.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  ListViewAction,
  ListViewEmpty,
  ListViewGroup,
  ListViewInteraction,
  ListViewTruncate,
  ListViewItem,
  ListViewPriority,
  ListViewProps,
  ListViewSelection,
  ListViewSize,
  ListViewSort,
  ListViewTone,
} from "./ListView.types";

const GROUP_PREFIX = "group:";

/** metaTone, noteTone and iconTone: neutral adds nothing. */
function toneClass(tone: ListViewItem["metaTone"]): string | undefined {
  return tone === "danger" ? styles.danger : tone === "warning" ? styles.warning : undefined;
}

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

const PRIORITY_RANK: Record<NonNullable<ListViewItem["priority"]>, number> = { high: 0, medium: 1, low: 2 };
const PRIORITY_WORD: Record<NonNullable<ListViewItem["priority"]>, string> = { high: "High", medium: "Medium", low: "Low" };
const PRIORITY_BARS: Record<NonNullable<ListViewItem["priority"]>, number> = { high: 3, medium: 2, low: 1 };

/** Stable sort by priority: high, medium, low, then rows without one. */
function byPriority(items: ListViewItem[]): ListViewItem[] {
  const rank = (item: ListViewItem) => (item.priority ? PRIORITY_RANK[item.priority] : 3);
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => rank(a.item) - rank(b.item) || a.index - b.index)
    .map((entry) => entry.item);
}

/** The visible secondary line: the priority word first, so the bar marker is never the only signal. */
function secondaryOf(item: ListViewItem): string | undefined {
  if (!item.priority) return item.secondary;
  const word = PRIORITY_WORD[item.priority];
  return item.secondary ? `${word} · ${item.secondary}` : word;
}

/** What a dot tone is read as, since the dot itself is aria-hidden. */
const DOT_NAME: Record<NonNullable<ListViewItem["dot"]>, string> = {
  neutral: "Note",
  success: "Good",
  warning: "Warning",
  danger: "Problem",
  info: "Info",
};

/**
 * A row's accessible name: primary, then secondary, then value, then meta, then the badge, so a status
 * shown only as a Badge is read too. A dot adds its tone after the badge (the dot is aria-hidden).
 */
function rowName(item: ListViewItem): string {
  return [item.primary, secondaryOf(item), item.note, item.value, item.meta, item.badge, item.dot ? DOT_NAME[item.dot] : undefined]
    .filter(Boolean)
    .join(", ");
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
  truncate = "none",
  sort = "none",
  flush = false,
  className,
  ref,
  ...rest
}: ListViewProps) {
  const uid = useId();
  const truncatePrimary = truncate === "both";
  const truncateSecondary = truncate === "secondary" || truncate === "both";
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const selectedControlled = selectedProp !== undefined;
  const [selectedUncontrolled, setSelectedUncontrolled] = useState<string[]>(defaultSelected ?? []);
  const selectedIds = selectedControlled ? selectedProp : selectedUncontrolled;
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const ordered = useMemo(() => (sort === "priority" ? byPriority(items) : items), [items, sort]);
  const sections = useMemo(() => sectionsOf(ordered, groups), [ordered, groups]);
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
  const compact = size === "sm" || size === "xs";
  const iconPx = compact ? 16 : 18;
  const avatarSize = compact ? "sm" : "md";
  const checkSize = compact ? "sm" : "md";

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
        <span className={cx(styles.leading, toneClass(item.iconTone))} aria-hidden>
          <LucideByName name={item.icon} size={iconPx} />
        </span>
      );
    }
    if (item.priority) {
      const filled = PRIORITY_BARS[item.priority];
      return (
        <span className={cx(styles.leading, styles.prioritySlot)} aria-hidden>
          <span className={cx(styles.bars, styles[`priority-${item.priority}`])}>
            {[1, 2, 3].map((bar) => (
              <span key={bar} className={styles.bar} data-on={bar <= filled || undefined} />
            ))}
          </span>
        </span>
      );
    }
    if (item.dot) {
      return (
        <span className={cx(styles.leading, styles.dotSlot)} aria-hidden>
          <span className={cx(styles.dot, styles[`dot-${item.dot}`])} />
        </span>
      );
    }
    return null;
  }

  function renderMenu(item: ListViewItem, actions: NonNullable<ListViewItem["actions"]>): ReactNode {
    return (
          <DropdownMenu
            iconStart="Ellipsis"
            ariaLabel={`Actions for ${item.primary}`}
            appearance="ghost" mode="neutral"
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
    );
  }

  // actionLabel names the button through a hidden span (Button keeps its visible text as the name
  // otherwise). The id is unique per list, row and action.
  function actionName(item: ListViewItem, action: ListViewAction) {
    if (!action.actionLabel) return { props: {}, node: null };
    const id = `${uid}-${item.id}-${action.id}-name`;
    return {
      props: { "aria-labelledby": id },
      node: (
        <span key={`${action.id}-name`} id={id} className={styles.srOnly}>
          {action.actionLabel}
        </span>
      ),
    };
  }

  // A text action: actionName() once, its props on the Button and its span after it.
  function renderTextAction(item: ListViewItem, action: ListViewAction): ReactNode {
    const name = actionName(item, action);
    return (
      <Fragment key={action.id}>
        <Button
          size="sm"
          appearance="ghost" mode={action.danger ? "danger" : "neutral"}
          disabled={item.disabled || action.disabled}
          onClick={() => onAction?.(item.id, action.id)}
          {...name.props}
        >
          {action.label}
        </Button>
        {name.node}
      </Fragment>
    );
  }

  function renderActions(item: ListViewItem): ReactNode {
    const node = renderRowActions(item);
    // Once any row has a primaryAction, a row without one keeps the empty slot, so badges and
    // values end in one lane down the list.
    if (item.primaryAction || !hasPrimaryLane) return node;
    return (
      <span className={styles.actions}>
        <span className={styles.primaryActionSlot} aria-hidden />
        {node}
      </span>
    );
  }

  function renderRowActions(item: ListViewItem): ReactNode {
    const actions = item.actions ?? [];
    const stop = (event: MouseEvent) => event.stopPropagation();
    const primary = item.primaryAction;
    if (primary) {
      const primaryName = actionName(item, primary);
      return (
        <span className={styles.actions} onClick={stop}>
          <span className={styles.primaryActionSlot}>
            <Button
              size="sm"
              appearance="outline"
              mode={primary.danger ? "danger" : "neutral"}
              iconStart={primary.icon}
              disabled={item.disabled || primary.disabled}
              onClick={() => onAction?.(item.id, primary.id)}
              {...primaryName.props}
            >
              {primary.label}
            </Button>
            {primaryName.node}
          </span>
          {actions.length > 0 ? renderMenu(item, actions) : null}
        </span>
      );
    }
    if (actions.length === 0) return null;
    if (actions.length > 2) {
      return (
        <span className={styles.actions} onClick={stop}>
          {renderMenu(item, actions)}
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
              appearance="ghost" mode={action.danger ? "danger" : "neutral"}
              iconStart={action.icon}
              ariaLabel={action.actionLabel ?? action.label}
              disabled={item.disabled || action.disabled}
              onClick={() => onAction?.(item.id, action.id)}
            />
          ) : (
            renderTextAction(item, action)
          ),
        )}
      </span>
    );
  }

  function renderBadge(item: ListViewItem): ReactNode {
    if (!item.badge) return null;
    return (
      <Badge tone={item.badgeTone ?? "neutral"} size="sm">
        {item.badge}
      </Badge>
    );
  }

  function renderCopy(item: ListViewItem): ReactNode {
    const secondary = secondaryOf(item);
    const note = item.note ? <span className={cx(styles.note, toneClass(item.noteTone))}>{item.note}</span> : null;
    return (
      <span className={styles.copy}>
        <span
          className={cx(styles.primary, truncatePrimary && styles.truncate)}
          title={truncatePrimary ? item.primary : undefined}
        >
          {item.primary}
        </span>
        {secondary || note ? (
          <span
            className={cx(styles.secondary, truncateSecondary && styles.truncate)}
            title={truncateSecondary ? [secondary, item.note].filter(Boolean).join(" · ") : undefined}
          >
            {secondary}
            {secondary && note ? " · " : null}
            {note}
          </span>
        ) : null}
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

  const hasPrimaryLane = items.some((item) => Boolean(item.primaryAction));
  const rootClass = cx(styles.root, styles[size], flush && styles.flush, className);

  if (items.length === 0) {
    return (
      <div {...rest} {...nisthaAttr("listview", rest)} ref={ref} className={rootClass} role={listRole} aria-label={label} tabIndex={0}>
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
      {...rest} {...nisthaAttr("listview", rest)}
      ref={ref}
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
                <span className={styles.groupLabel}>{group.label}</span>
                {group.total ? <span className={styles.groupTotal}>{group.total}</span> : null}
              </button>
            ) : group ? (
              <div id={`${uid}-${group.id}-label`} className={styles.groupHeader}>
                <span className={styles.groupLabel}>{group.label}</span>
                {group.total ? <span className={styles.groupTotal}>{group.total}</span> : null}
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
                      aria-label={rowName(item)}
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
                          {item.value ? (
                            <span className={styles.valueStack}>
                              <span className={cx(styles.value, item.valueIcon && styles.valueWithIcon)}>
                                {item.valueIcon ? (
                                  <span className={styles.valueIcon} aria-hidden>
                                    <LucideByName name={item.valueIcon} size={16} />
                                  </span>
                                ) : null}
                                {item.value}
                              </span>
                              {item.meta ? <span className={cx(styles.meta, toneClass(item.metaTone))}>{item.meta}</span> : null}
                              {renderBadge(item)}
                            </span>
                          ) : (
                            <>
                              {item.meta ? <span className={cx(styles.meta, toneClass(item.metaTone))}>{item.meta}</span> : null}
                              {renderBadge(item)}
                            </>
                          )}
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
