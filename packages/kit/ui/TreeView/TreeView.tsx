"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Checkbox } from "../Checkbox";
import { LucideByName } from "../Button/lucideName";
import { DropdownMenu } from "../DropdownMenu";
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

type MoveAction = "up" | "down" | "into" | "out";
type DropPlacement = "before" | "after" | "into";

interface ItemLocation {
  siblings: TreeViewItem[];
  index: number;
  parent: TreeViewItem | null;
  parentSiblings: TreeViewItem[] | null;
  parentIndex: number;
}

function cloneItems(items: TreeViewItem[]): TreeViewItem[] {
  return items.map((item) => ({
    ...item,
    children: item.children ? cloneItems(item.children) : item.children,
  }));
}

function locate(
  id: string,
  siblings: TreeViewItem[],
  parent: TreeViewItem | null = null,
  parentSiblings: TreeViewItem[] | null = null,
  parentIndex = -1,
): ItemLocation | null {
  const index = siblings.findIndex((item) => item.id === id);
  if (index >= 0) return { siblings, index, parent, parentSiblings, parentIndex };
  for (let i = 0; i < siblings.length; i += 1) {
    const item = siblings[i];
    if (!item.children) continue;
    const found = locate(id, item.children, item, siblings, i);
    if (found) return found;
  }
  return null;
}

function moveItem(items: TreeViewItem[], id: string, action: MoveAction): TreeViewItem[] | null {
  const next = cloneItems(items);
  const loc = locate(id, next);
  if (!loc) return null;
  const current = loc.siblings[loc.index];
  if (!current || current.disabled) return null;

  if (action === "up") {
    if (loc.index === 0) return null;
    [loc.siblings[loc.index - 1], loc.siblings[loc.index]] = [
      loc.siblings[loc.index],
      loc.siblings[loc.index - 1],
    ];
    return next;
  }

  if (action === "down") {
    if (loc.index >= loc.siblings.length - 1) return null;
    [loc.siblings[loc.index], loc.siblings[loc.index + 1]] = [
      loc.siblings[loc.index + 1],
      loc.siblings[loc.index],
    ];
    return next;
  }

  if (action === "out") {
    if (!loc.parent || !loc.parentSiblings || loc.parentIndex < 0) return null;
    const [removed] = loc.siblings.splice(loc.index, 1);
    loc.parentSiblings.splice(loc.parentIndex + 1, 0, removed);
    return next;
  }

  if (loc.index === 0) return null;
  const previous = loc.siblings[loc.index - 1];
  if (!previous || !isFolder(previous) || previous.disabled) return null;
  const [removed] = loc.siblings.splice(loc.index, 1);
  previous.children = [...(previous.children ?? []), removed];
  return next;
}

function isDescendantOf(items: TreeViewItem[], ancestorId: string, targetId: string): boolean {
  if (ancestorId === targetId) return true;
  const ancestor = findItem(items, ancestorId);
  if (!ancestor) return false;
  return descendantsOf(ancestor).some((node) => node.id === targetId);
}

function repositionItem(
  items: TreeViewItem[],
  sourceId: string,
  targetId: string,
  placement: DropPlacement,
): TreeViewItem[] | null {
  if (sourceId === targetId) return null;
  const next = cloneItems(items);
  if (isDescendantOf(next, sourceId, targetId)) return null;

  const sourceLoc = locate(sourceId, next);
  if (!sourceLoc) return null;
  const sourceItem = sourceLoc.siblings[sourceLoc.index];
  if (!sourceItem || sourceItem.disabled) return null;

  const [removed] = sourceLoc.siblings.splice(sourceLoc.index, 1);

  const targetLoc = locate(targetId, next);
  if (!targetLoc) return null;
  const targetItem = targetLoc.siblings[targetLoc.index];
  if (!targetItem || targetItem.disabled) return null;

  if (placement === "into") {
    if (!isFolder(targetItem)) return null;
    targetItem.children = [...(targetItem.children ?? []), removed];
    return next;
  }

  const insertAt = placement === "before" ? targetLoc.index : targetLoc.index + 1;
  targetLoc.siblings.splice(insertAt, 0, removed);
  return next;
}

function dropPlacement(event: DragEvent<HTMLElement>, folder: boolean): DropPlacement {
  const rect = event.currentTarget.getBoundingClientRect();
  const ratio = (event.clientY - rect.top) / rect.height;
  if (folder) {
    if (ratio < 0.25) return "before";
    if (ratio > 0.75) return "after";
    return "into";
  }
  return ratio < 0.5 ? "before" : "after";
}

function moveOptions(items: TreeViewItem[], id: string) {
  const loc = locate(id, items);
  if (!loc) {
    return { up: false, down: false, into: false, out: false };
  }
  const current = loc.siblings[loc.index];
  const previous = loc.index > 0 ? loc.siblings[loc.index - 1] : undefined;
  return {
    up: loc.index > 0 && !current?.disabled,
    down: loc.index < loc.siblings.length - 1 && !current?.disabled,
    into: Boolean(previous && isFolder(previous) && !current?.disabled && !previous.disabled),
    out: loc.parent !== null && !current?.disabled,
  };
}

export function TreeView({
  items: itemsProp,
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
  reorderable = false,
  onItemsChange,
}: TreeViewProps) {
  const uid = useId();
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const [innerItems, setInnerItems] = useState(itemsProp);
  const items = onItemsChange ? itemsProp : innerItems;

  useEffect(() => {
    if (!onItemsChange) setInnerItems(itemsProp);
  }, [itemsProp, onItemsChange]);
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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; placement: DropPlacement } | null>(
    null,
  );
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

  function commitItems(next: TreeViewItem[]) {
    if (!onItemsChange) setInnerItems(next);
    onItemsChange?.(next);
  }

  function applyMove(id: string, action: MoveAction) {
    const before = locate(id, items);
    const next = moveItem(items, id, action);
    if (!next) return;
    commitItems(next);
    if (action === "into" && before && before.index > 0) {
      const targetId = before.siblings[before.index - 1]?.id;
      if (targetId) {
        const expandedNext = new Set(expanded);
        expandedNext.add(targetId);
        setExpanded([...expandedNext]);
      }
    }
    focusNode(id);
  }

  function applyDrop(sourceId: string, targetId: string, placement: DropPlacement) {
    const next = repositionItem(items, sourceId, targetId, placement);
    if (!next) return;
    commitItems(next);
    if (placement === "into") {
      const expandedNext = new Set(expanded);
      expandedNext.add(targetId);
      setExpanded([...expandedNext]);
    }
    focusNode(sourceId);
  }

  function canDropOn(sourceId: string, targetId: string, placement: DropPlacement, folder: boolean) {
    if (!reorderable || sourceId === targetId) return false;
    if (isDescendantOf(items, sourceId, targetId)) return false;
    const target = findItem(items, targetId);
    if (!target || target.disabled) return false;
    if (placement === "into" && !folder) return false;
    return true;
  }

  function onTreeKeyDown(event: KeyboardEvent<HTMLDivElement>, id: string) {
    if (event.currentTarget !== event.target) return;
    const item = findItem(items, id);
    if (!item) return;
    const index = shown.indexOf(id);
    const key = event.key;

    if (reorderable && event.altKey) {
      if (key === "ArrowUp") {
        event.preventDefault();
        applyMove(id, "up");
        return;
      }
      if (key === "ArrowDown") {
        event.preventDefault();
        applyMove(id, "down");
        return;
      }
      if (key === "ArrowRight") {
        event.preventDefault();
        applyMove(id, "into");
        return;
      }
      if (key === "ArrowLeft") {
        event.preventDefault();
        applyMove(id, "out");
        return;
      }
    }

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
      const iconName = item.icon ?? (folder ? (open ? "FolderOpen" : "Folder") : "File");
      const moves = reorderable ? moveOptions(items, item.id) : null;
      const stopHandle = (event: MouseEvent) => event.stopPropagation();

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
          data-dragging={draggingId === item.id || undefined}
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
            data-drop={
              reorderable && dropTarget?.id === item.id ? dropTarget.placement : undefined
            }
            onDragOver={
              reorderable
                ? (event) => {
                    if (!draggingId) return;
                    const placement = dropPlacement(event, folder);
                    if (!canDropOn(draggingId, item.id, placement, folder)) {
                      setDropTarget((current) => (current?.id === item.id ? null : current));
                      return;
                    }
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDropTarget({ id: item.id, placement });
                  }
                : undefined
            }
            onDragLeave={
              reorderable
                ? (event) => {
                    const related = event.relatedTarget as Node | null;
                    if (!event.currentTarget.contains(related)) {
                      setDropTarget((current) => (current?.id === item.id ? null : current));
                    }
                  }
                : undefined
            }
            onDrop={
              reorderable
                ? (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const sourceId = draggingId ?? event.dataTransfer.getData("text/plain");
                    if (!sourceId) return;
                    const placement =
                      dropTarget?.id === item.id
                        ? dropTarget.placement
                        : dropPlacement(event, folder);
                    if (!canDropOn(sourceId, item.id, placement, folder)) return;
                    applyDrop(sourceId, item.id, placement);
                    setDraggingId(null);
                    setDropTarget(null);
                  }
                : undefined
            }
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
            {reorderable && moves ? (
              <span className={styles.handle} onClick={stopHandle}>
                <DropdownMenu
                  iconStart="GripVertical"
                  ariaLabel={`Move ${item.label}`}
                  variant="tertiary"
                  size={size}
                  align="end"
                  disabled={item.disabled}
                  triggerDraggable={!item.disabled}
                  onTriggerDragStart={(event) => {
                    event.stopPropagation();
                    setDraggingId(item.id);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", item.id);
                  }}
                  onTriggerDragEnd={() => {
                    setDraggingId(null);
                    setDropTarget(null);
                  }}
                  groups={[
                    {
                      items: [
                        {
                          id: "up",
                          label: "Move up",
                          icon: "ChevronUp",
                          disabled: !moves.up,
                        },
                        {
                          id: "down",
                          label: "Move down",
                          icon: "ChevronDown",
                          disabled: !moves.down,
                        },
                        {
                          id: "into",
                          label: "Move into folder above",
                          icon: "ChevronRight",
                          disabled: !moves.into,
                        },
                        {
                          id: "out",
                          label: "Move out of folder",
                          icon: "ChevronLeft",
                          disabled: !moves.out,
                        },
                      ],
                    },
                  ]}
                  onSelect={(actionId) => {
                    if (actionId === "up" || actionId === "down" || actionId === "into" || actionId === "out") {
                      applyMove(item.id, actionId);
                    }
                  }}
                />
              </span>
            ) : null}
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
