"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Checkbox } from "../Checkbox";
import { LucideByName } from "../Button/lucideName";
import type { TreeViewItem, TreeViewProps } from "./TreeView.types";
import styles from "./TreeView.module.css";

export type {
  TreeViewItem,
  TreeViewProps,
  TreeViewSelection,
  TreeViewSize,
} from "./TreeView.types";

function isFolder(item: TreeViewItem): boolean {
  return Array.isArray(item.children);
}

function walkItems(
  items: TreeViewItem[],
  visit: (item: TreeViewItem, parentId: string | null, level: number) => void,
  parentId: string | null = null,
  level = 1,
) {
  for (const item of items) {
    visit(item, parentId, level);
    if (item.children) walkItems(item.children, visit, item.id, level + 1);
  }
}

function descendantsOf(item: TreeViewItem): TreeViewItem[] {
  const out: TreeViewItem[] = [];
  if (!item.children) return out;
  walkItems(item.children, (node) => {
    out.push(node);
  });
  return out;
}

function visibleIds(items: TreeViewItem[], expanded: ReadonlySet<string>): string[] {
  const ids: string[] = [];
  const visit = (nodes: TreeViewItem[]) => {
    for (const node of nodes) {
      ids.push(node.id);
      if (isFolder(node) && expanded.has(node.id) && node.children) visit(node.children);
    }
  };
  visit(items);
  return ids;
}

function findItem(items: TreeViewItem[], id: string): TreeViewItem | undefined {
  let found: TreeViewItem | undefined;
  walkItems(items, (item) => {
    if (item.id === id) found = item;
  });
  return found;
}

function selectableIds(item: TreeViewItem): string[] {
  return [item, ...descendantsOf(item)].filter((node) => !node.disabled).map((node) => node.id);
}

function syncFolderSelection(items: TreeViewItem[], selected: Set<string>) {
  const visit = (nodes: TreeViewItem[]) => {
    for (const node of nodes) {
      if (!isFolder(node)) continue;
      if (node.children) visit(node.children);
      const enabled = descendantsOf(node).filter((child) => !child.disabled);
      if (enabled.length === 0) continue;
      if (enabled.every((child) => selected.has(child.id))) selected.add(node.id);
      else selected.delete(node.id);
    }
  };
  visit(items);
}

function branchState(
  item: TreeViewItem,
  selected: ReadonlySet<string>,
): "checked" | "unchecked" | "mixed" {
  const enabled = descendantsOf(item).filter((child) => !child.disabled);
  if (enabled.length === 0) return selected.has(item.id) ? "checked" : "unchecked";
  const count = enabled.filter((child) => selected.has(child.id)).length;
  if (count === enabled.length) return "checked";
  if (count === 0 && !selected.has(item.id)) return "unchecked";
  return "mixed";
}

function nextSingle(id: string, item: TreeViewItem): string[] {
  if (item.disabled) return [];
  return [id];
}

function nextMultiple(items: TreeViewItem[], id: string, selected: ReadonlySet<string>): string[] {
  const item = findItem(items, id);
  if (!item || item.disabled) return [...selected];
  const ids = selectableIds(item);
  const state = isFolder(item) ? branchState(item, selected) : selected.has(id) ? "checked" : "unchecked";
  const next = new Set(selected);
  if (state === "checked") ids.forEach((nodeId) => next.delete(nodeId));
  else ids.forEach((nodeId) => next.add(nodeId));
  syncFolderSelection(items, next);
  return [...next];
}

function bindCheckbox(el: HTMLSpanElement | null) {
  const input = el?.querySelector("input");
  if (input) input.tabIndex = -1;
}

export function TreeView({
  items,
  label,
  size = "md",
  selection = "none",
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  showLines = false,
  showIcons = false,
}: TreeViewProps) {
  const uid = useId();
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const expandedControlled = expandedProp !== undefined;
  const selectedControlled = selectedProp !== undefined;
  const [expandedUncontrolled, setExpandedUncontrolled] = useState<string[]>(defaultExpanded ?? []);
  const [selectedUncontrolled, setSelectedUncontrolled] = useState<string[]>(defaultSelected ?? []);
  const expandedIds = expandedControlled ? expandedProp : expandedUncontrolled;
  const selectedIds = selectedControlled ? selectedProp : selectedUncontrolled;
  const expanded = useMemo(() => new Set(expandedIds), [expandedIds]);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const parents = useMemo(() => {
    const map = new Map<string, string | null>();
    walkItems(items, (item, parentId) => {
      map.set(item.id, parentId);
    });
    return map;
  }, [items]);
  const shown = useMemo(() => visibleIds(items, expanded), [items, expanded]);
  const [focusedId, setFocusedId] = useState<string | null>(shown[0] ?? null);
  const iconPx = size === "sm" ? 14 : 16;

  function setExpanded(next: string[]) {
    if (!expandedControlled) setExpandedUncontrolled(next);
    onExpandedChange?.(next);
  }

  function setSelected(next: string[]) {
    if (selection === "none") return;
    if (!selectedControlled) setSelectedUncontrolled(next);
    onSelectedChange?.(next);
  }

  function focusNode(id: string) {
    setFocusedId(id);
    requestAnimationFrame(() => itemRefs.current.get(id)?.focus());
  }

  function toggleExpanded(id: string) {
    const item = findItem(items, id);
    if (!item || !isFolder(item)) return;
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded([...next]);
  }

  function applySelection(id: string) {
    const item = findItem(items, id);
    if (!item || item.disabled || selection === "none") return;
    if (selection === "single") setSelected(nextSingle(id, item));
    else setSelected(nextMultiple(items, id, selected));
  }

  function onTreeKeyDown(event: KeyboardEvent<HTMLDivElement>, id: string) {
    if (event.currentTarget !== event.target) return;
    const item = findItem(items, id);
    if (!item) return;
    const index = shown.indexOf(id);
    const key = event.key;

    if (key === "ArrowDown") {
      event.preventDefault();
      const next = shown[index + 1];
      if (next) focusNode(next);
      return;
    }
    if (key === "ArrowUp") {
      event.preventDefault();
      const prev = shown[index - 1];
      if (prev) focusNode(prev);
      return;
    }
    if (key === "Home") {
      event.preventDefault();
      if (shown[0]) focusNode(shown[0]);
      return;
    }
    if (key === "End") {
      event.preventDefault();
      const last = shown[shown.length - 1];
      if (last) focusNode(last);
      return;
    }
    if (key === "ArrowRight") {
      event.preventDefault();
      if (!isFolder(item)) return;
      if (!expanded.has(id)) {
        toggleExpanded(id);
        return;
      }
      const firstChild = item.children?.[0];
      if (firstChild) focusNode(firstChild.id);
      return;
    }
    if (key === "ArrowLeft") {
      event.preventDefault();
      if (isFolder(item) && expanded.has(id)) {
        toggleExpanded(id);
        return;
      }
      const parentId = parents.get(id);
      if (parentId) focusNode(parentId);
      return;
    }
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (selection === "none") {
        if (isFolder(item)) toggleExpanded(id);
        return;
      }
      applySelection(id);
    }
  }

  function renderNodes(nodes: TreeViewItem[], level: number): ReactNode {
    return nodes.map((item) => {
      const folder = isFolder(item);
      const open = folder && expanded.has(item.id);
      const itemId = `${uid}-${item.id}`;
      const tabIndex = focusedId === item.id || (focusedId === null && shown[0] === item.id) ? 0 : -1;
      const check = folder ? branchState(item, selected) : selected.has(item.id) ? "checked" : "unchecked";
      const isSelected = selection !== "none" && check === "checked";
      const iconName = folder ? (open ? "FolderOpen" : "Folder") : "File";

      return (
        <div
          key={item.id}
          id={itemId}
          ref={(el) => {
            if (el) itemRefs.current.set(item.id, el);
            else itemRefs.current.delete(item.id);
          }}
          role="treeitem"
          className={styles.item}
          tabIndex={tabIndex}
          aria-label={item.label}
          aria-level={level}
          aria-expanded={folder ? open : undefined}
          aria-selected={selection === "single" ? isSelected : undefined}
          aria-checked={
            selection === "multiple" ? (check === "mixed" ? "mixed" : isSelected) : undefined
          }
          aria-disabled={item.disabled || undefined}
          onFocus={() => setFocusedId(item.id)}
          onKeyDown={(event) => onTreeKeyDown(event, item.id)}
          onClick={(event) => {
            event.stopPropagation();
            if ((event.target as HTMLElement).closest("button")) return;
            if (selection === "none") {
              if (folder) toggleExpanded(item.id);
              return;
            }
            applySelection(item.id);
          }}
        >
          <div
            className={styles.row}
            data-selected={isSelected || undefined}
            data-disabled={item.disabled || undefined}
          >
            {folder ? (
              <button
                type="button"
                className={`${styles.twist}${open ? ` ${styles.twistOpen}` : ""}`}
                tabIndex={-1}
                aria-label={`${open ? "Collapse" : "Expand"} ${item.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleExpanded(item.id);
                  focusNode(item.id);
                }}
              >
                <LucideByName name="ChevronRight" size={iconPx} className={styles.twistIcon} />
              </button>
            ) : (
              <span className={styles.twistSlot} aria-hidden />
            )}
            {selection === "multiple" ? (
              <span
                className={styles.check}
                ref={bindCheckbox}
                aria-hidden
                onClick={(event) => event.stopPropagation()}
              >
                <Checkbox
                  id={`${itemId}-check`}
                  size={size}
                  ariaLabel={`Select ${item.label}`}
                  checked={check === "checked"}
                  indeterminate={check === "mixed"}
                  disabled={item.disabled}
                  onChange={() => {
                    applySelection(item.id);
                    focusNode(item.id);
                  }}
                />
              </span>
            ) : null}
            {showIcons ? (
              <span className={styles.icon} aria-hidden>
                <LucideByName name={iconName} size={iconPx} />
              </span>
            ) : null}
            <span className={styles.labelText}>{item.label}</span>
          </div>
          {folder && open ? (
            <div role="group" className={styles.group}>
              {renderNodes(item.children ?? [], level + 1)}
            </div>
          ) : null}
        </div>
      );
    });
  }

  const rootClass = `${styles.root} ${styles[size]}${showLines ? ` ${styles.lines}` : ""}`;

  return (
    <div
      className={rootClass}
      role="tree"
      aria-label={label}
      aria-multiselectable={selection === "multiple" || undefined}
      tabIndex={shown.length === 0 ? 0 : undefined}
    >
      {renderNodes(items, 1)}
    </div>
  );
}
