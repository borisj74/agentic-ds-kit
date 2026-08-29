"use client";

import { useId } from "react";
import { Checkbox } from "@/ui/Checkbox";
import { LucideByName } from "@/ui/Button/lucideName";
import type { HeaderCellProps } from "./HeaderCell.types";
import styles from "./HeaderCell.module.css";

export type {
  HeaderCellProps,
  HeaderCellSize,
  HeaderCellAlign,
  HeaderCellSort,
} from "./HeaderCell.types";

export function HeaderCell({
  label,
  size = "md",
  checkbox = false,
  checked,
  defaultChecked,
  indeterminate,
  onCheckedChange,
  align = "start",
  sortable = false,
  sort,
  onSort,
  id,
}: HeaderCellProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const aria = label ? `Select all ${label}` : "Select all rows";
  const icon = sort === "asc" ? "ChevronUp" : sort === "desc" ? "ChevronDown" : "ChevronsUpDown";
  const sortLabel = sort === "asc" ? `Sort ${label ?? "column"} descending` : sort === "desc" ? `Clear sort on ${label ?? "column"}` : `Sort ${label ?? "column"} ascending`;

  return (
    <span className={`${styles.cell} ${styles[size]} ${styles[align]}`}>
      {checkbox ? (
        <Checkbox
          id={checkboxId}
          size="sm"
          ariaLabel={aria}
          checked={checked}
          defaultChecked={defaultChecked}
          indeterminate={indeterminate}
          onChange={onCheckedChange}
        />
      ) : null}
      {sortable && !checkbox ? (
        <button type="button" className={styles.sort} onClick={onSort} aria-label={sortLabel}>
          {label ? <span className={styles.label}>{label}</span> : null}
          <LucideByName
            name={icon}
            size={14}
            className={sort ? styles.sortIconActive : styles.sortIcon}
          />
        </button>
      ) : label ? (
        <span className={styles.label}>{label}</span>
      ) : null}
    </span>
  );
}
