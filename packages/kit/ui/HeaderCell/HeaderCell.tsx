"use client";

import { useId } from "react";
import { Checkbox } from "../Checkbox";
import { LucideByName } from "../Button/lucideName";
import type { HeaderCellProps } from "./HeaderCell.types";
import { cx } from "../shared/cx";
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
  wrap = false,
  id,
  className,
  ref,
  ...rest
}: HeaderCellProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const aria = label ? `Select all ${label}` : "Select all rows";
  const icon = sort === "asc" ? "ChevronUp" : sort === "desc" ? "ChevronDown" : "ChevronsUpDown";
  const sortLabel =
    sort === "asc"
      ? `Sort ${label ?? "column"} descending`
      : sort === "desc"
        ? `Clear sort on ${label ?? "column"}`
        : `Sort ${label ?? "column"} ascending`;
  const checkboxOnly = checkbox && !label;
  const sortIcon = (
    <LucideByName
      name={icon}
      size={14}
      className={sort ? styles.sortIconActive : styles.sortIcon}
    />
  );
  // When wrapping, the last word and the sort icon share a line so the icon never sits alone.
  const lastBreak = wrap && label ? label.trimEnd().lastIndexOf(" ") + 1 : 0;

  return (
    <span
      {...rest}
      ref={ref}
      className={cx(
        styles.cell,
        styles[size],
        styles[align],
        checkboxOnly && styles.checkboxOnly,
        wrap && styles.wrap,
        className,
      )}
    >
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
          {wrap ? (
            <span className={styles.label}>
              {label ? label.slice(0, lastBreak) : null}
              <span className={styles.tail}>
                {label ? label.slice(lastBreak) : null}
                {sortIcon}
              </span>
            </span>
          ) : (
            <>
              {label ? <span className={styles.label}>{label}</span> : null}
              {sortIcon}
            </>
          )}
        </button>
      ) : label ? (
        <span className={styles.label}>{label}</span>
      ) : null}
    </span>
  );
}
