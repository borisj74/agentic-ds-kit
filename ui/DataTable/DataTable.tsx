"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Cell } from "@/ui/Cell";
import { HeaderCell } from "@/ui/HeaderCell";
import { DropdownMenu } from "@/ui/DropdownMenu";
import type { CellSize, CellValue } from "@/ui/Cell";
import { LucideByName } from "@/ui/Button/lucideName";
import type {
  DataTableCell,
  DataTableColumn,
  DataTableFilter,
  DataTableProps,
  DataTableRow,
} from "./DataTable.types";
import styles from "./DataTable.module.css";

export type {
  DataTableProps,
  DataTableColumn,
  DataTableFilter,
  DataTableCell,
  DataTableRow,
} from "./DataTable.types";

const DEFAULT_SEARCH = "Search...";
const DEFAULT_EMPTY = "No results.";
const EMPTY_FILTERS: DataTableFilter[] = [];

function isPrimitive(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

function stringifyCell(value: DataTableCell | undefined): string {
  if (value === undefined) return "";
  if (isPrimitive(value)) return String(value);
  const cell = value as CellValue;
  if (cell.label) return String(cell.label);
  if (cell.name) return String(cell.name);
  if (cell.value !== undefined && cell.value !== "") return String(cell.value);
  if (cell.badges && cell.badges.length) return cell.badges.map((item) => item.label).join(" ");
  if (cell.people && cell.people.length) return cell.people.map((item) => item.name).join(" ");
  if (cell.options && cell.options.length) {
    const selected = cell.value !== undefined ? String(cell.value) : "";
    const match = cell.options.find((item) => item.value === selected);
    if (match) return match.label;
    return cell.options.map((item) => item.label).join(" ");
  }
  if (cell.actions && cell.actions.length) {
    return cell.actions.map((item) => item.label || item.ariaLabel || "").join(" ");
  }
  return "";
}

function rowId(row: DataTableRow, index: number): string {
  const id = row.id;
  if (isPrimitive(id) && id !== "") return String(id);
  return String(index);
}

function uniqueValues(rows: DataTableRow[], key: string): string[] {
  const seen = new Set<string>();
  const values: string[] = [];
  for (const row of rows) {
    if (row[key] === undefined) continue;
    const value = stringifyCell(row[key]);
    if (!seen.has(value)) {
      seen.add(value);
      values.push(value);
    }
  }
  return values;
}

function lockedColumnKey(columns: DataTableColumn[]): string | undefined {
  if (columns.some((column) => column.key === "name")) return "name";
  return columns[0]?.key;
}

function rowLabel(row: DataTableRow, lockedKey: string | undefined, fallback: string): string {
  if (lockedKey && row[lockedKey] !== undefined) {
    const text = stringifyCell(row[lockedKey]);
    if (text) return text;
  }
  return fallback;
}

function renderCell(value: DataTableCell | undefined, cellSize: CellSize) {
  if (value === undefined) {
    return <Cell type="text" size={cellSize} text={false} />;
  }
  if (isPrimitive(value)) {
    return <Cell type="text" label={String(value)} size={cellSize} />;
  }
  return <Cell {...value} size={cellSize} />;
}

function isActionMenuValue(value: DataTableCell | undefined): boolean {
  return Boolean(value) && typeof value === "object" && value.type === "actionMenu";
}

function isActionColumn(column: DataTableColumn, rows: DataTableRow[]): boolean {
  return rows.some((row) => isActionMenuValue(row[column.key]));
}

export function DataTable({
  caption,
  selectable = false,
  toolbar = false,
  searchPlaceholder = DEFAULT_SEARCH,
  filters,
  columnSettings = false,
  cellSize = "md",
  columns,
  rows,
  emptyMessage = DEFAULT_EMPTY,
  onSelectionChange,
}: DataTableProps) {
  const uid = useId();
  const columnsWrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filterDefs = filters ?? EMPTY_FILTERS;
  const lockedKey = lockedColumnKey(columns);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.key === lockedKey || hidden[column.key] !== true),
    [columns, hidden, lockedKey],
  );

  const indexedRows = useMemo(
    () => rows.map((row, index) => ({ row, id: rowId(row, index) })),
    [rows],
  );

  const facetValues = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const filter of filterDefs) {
      map[filter.key] = uniqueValues(rows, filter.key);
    }
    return map;
  }, [filterDefs, rows]);

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = indexedRows.filter(({ row }) => {
      for (const filter of filterDefs) {
        const selectedValue = filterValues[filter.key];
        if (selectedValue && stringifyCell(row[filter.key]) !== selectedValue) return false;
      }
      if (!q) return true;
      return visibleColumns.some((column) => stringifyCell(row[column.key]).toLowerCase().includes(q));
    });
    if (!sortKey) return filtered;
    const column = columns.find((item) => item.key === sortKey);
    const numeric = column?.type === "number";
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = stringifyCell(a.row[sortKey]);
      const bv = stringifyCell(b.row[sortKey]);
      if (numeric) {
        const an = Number(av);
        const bn = Number(bv);
        const aOk = Number.isFinite(an);
        const bOk = Number.isFinite(bn);
        if (aOk && bOk && an !== bn) return (an - bn) * dir;
        if (aOk !== bOk) return (aOk ? -1 : 1) * dir;
      }
      return av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" }) * dir;
    });
  }, [indexedRows, filterDefs, filterValues, query, visibleColumns, sortKey, sortDir, columns]);

  const visibleIds = visibleRows.map((entry) => entry.id);
  const selectedVisible = selected.filter((id) => visibleIds.includes(id));
  const allVisibleSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
  const someVisibleSelected = selectedVisible.length > 0 && !allVisibleSelected;
  const colSpan = visibleColumns.length + (selectable ? 1 : 0);
  const empty = visibleRows.length === 0;

  useLayoutEffect(() => {
    if (!columnSettings || !toolbar) return;
    const button = columnsWrapRef.current?.querySelector("button");
    if (!button) return;
    button.setAttribute("aria-expanded", menuOpen ? "true" : "false");
    button.setAttribute("aria-haspopup", "true");
  }, [columnSettings, toolbar, menuOpen]);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (columnsWrapRef.current && !columnsWrapRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function emitSelection(next: string[]) {
    setSelected(next);
    onSelectionChange?.(next);
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      emitSelection(Array.from(new Set([...selected, ...visibleIds])));
    } else {
      const drop = new Set(visibleIds);
      emitSelection(selected.filter((id) => !drop.has(id)));
    }
  }

  function toggleRow(id: string, checked: boolean) {
    emitSelection(checked ? [...selected, id] : selected.filter((entry) => entry !== id));
  }

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    if (sortDir === "asc") {
      setSortDir("desc");
      return;
    }
    setSortKey(null);
    setSortDir("asc");
  }

  function toggleColumn(key: string, checked: boolean) {
    if (key === lockedKey) return;
    setHidden((prev) => ({ ...prev, [key]: !checked }));
  }

  function columnClass(column: DataTableColumn): string {
    if (column.type === "number") return ` ${styles.numeric}`;
    if (isActionColumn(column, rows)) return ` ${styles.actionCell}`;
    return "";
  }

  return (
    <div className={styles.root} data-size={cellSize}>
      {toolbar ? (
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <LucideByName name="Search" size={16} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={query}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
              aria-label={searchPlaceholder}
            />
          </div>
          {filterDefs.map((filter) => {
            const allId = `__all-${filter.key}`;
            const allLabel = `All ${filter.label.toLowerCase()}`;
            const selected = filterValues[filter.key] ?? "";
            const items = [
              { id: allId, label: allLabel },
              ...(facetValues[filter.key] ?? [])
                .filter((value) => value !== "")
                .map((value) => ({ id: value, label: value })),
            ];
            return (
              <div key={filter.key} className={styles.filter}>
                <DropdownMenu
                  trigger={selected || allLabel}
                  variant="secondary"
                  size="md"
                  iconEnd="ChevronDown"
                  ariaLabel={filter.label}
                  groups={[{ items }]}
                  onSelect={(id) =>
                    setFilterValues((prev) => ({
                      ...prev,
                      [filter.key]: id === allId ? "" : id,
                    }))
                  }
                />
              </div>
            );
          })}
          {columnSettings ? (
            <div ref={columnsWrapRef} className={styles.columns}>
              <Button
                variant="secondary"
                size="md"
                iconStart="Settings"
                onClick={() => setMenuOpen((open) => !open)}
              >
                Columns
              </Button>
              {menuOpen ? (
                <div className={styles.columnMenu} role="group" aria-label="Columns">
                  {columns.map((column) => {
                    const locked = column.key === lockedKey;
                    return (
                      <Checkbox
                        key={column.key}
                        id={`${uid}-col-${column.key}`}
                        size="sm"
                        label={column.header}
                        checked={locked || hidden[column.key] !== true}
                        disabled={locked}
                        onChange={(checked) => toggleColumn(column.key, checked)}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {toolbar ? (
        <p className={styles.count}>
          Showing {visibleRows.length} of {rows.length}
        </p>
      ) : null}

      <div className={styles.scroller}>
        <table className={styles.table}>
          {caption ? <caption className={styles.caption}>{caption}</caption> : null}
          <thead>
            <tr>
              {selectable ? (
                <th scope="col" className={`${styles.th} ${styles.checkCell}`}>
                  <HeaderCell
                    size={cellSize}
                    checkbox
                    id={`${uid}-all`}
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected}
                    onCheckedChange={toggleAll}
                  />
                </th>
              ) : null}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`${styles.th}${columnClass(column)}`}
                  aria-sort={
                    column.sortable
                      ? sortKey === column.key
                        ? sortDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                      : undefined
                  }
                >
                  <HeaderCell
                    label={column.header}
                    size={cellSize}
                    align={
                      column.type === "number"
                        ? "end"
                        : isActionColumn(column, rows)
                          ? "center"
                          : "start"
                    }
                    sortable={column.sortable}
                    sort={sortKey === column.key ? sortDir : undefined}
                    onSort={() => toggleSort(column.key)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {empty ? (
              <tr className={styles.tr}>
                <td className={`${styles.td} ${styles.emptyCell}`} colSpan={Math.max(colSpan, 1)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleRows.map(({ row, id }) => {
                const checked = selected.includes(id);
                const name = rowLabel(row, lockedKey, id);
                return (
                  <tr key={id} className={styles.tr} data-selected={checked || undefined}>
                    {selectable ? (
                      <td className={`${styles.td} ${styles.checkCell}`}>
                        <Checkbox
                          id={`${uid}-row-${id}`}
                          size="sm"
                          ariaLabel={`Select ${name}`}
                          checked={checked}
                          onChange={(next) => toggleRow(id, next)}
                        />
                      </td>
                    ) : null}
                    {visibleColumns.map((column) => (
                      <td key={column.key} className={`${styles.td}${columnClass(column)}`}>
                        {renderCell(row[column.key], cellSize)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
