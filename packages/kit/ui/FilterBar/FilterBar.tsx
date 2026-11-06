"use client";

import { Button } from "../Button";
import { DropdownMenu } from "../DropdownMenu";
import { FilterButton } from "../FilterButton";
import type { FilterBarFilter, FilterBarProps } from "./FilterBar.types";
import styles from "./FilterBar.module.css";

export type { FilterBarFilter, FilterBarProps, FilterBarSize } from "./FilterBar.types";

function isSet(filter: FilterBarFilter): boolean {
  return Boolean(filter.value) || (filter.count ?? 0) > 0;
}

export function FilterBar({
  filters,
  openId,
  onFilterClick,
  onClear,
  onAdd,
  addLabel = "Add filter",
  clearLabel = "Clear all",
  maxVisible,
  size = "md",
  ariaLabel = "Filters",
  className,
}: FilterBarProps) {
  const overflow = maxVisible !== undefined && filters.length > maxVisible ? filters.length - maxVisible : 0;
  const visible = overflow > 0 ? filters.slice(0, maxVisible) : filters;
  const hidden = overflow > 0 ? filters.slice(maxVisible) : [];
  const canClear = filters.some(isSet);

  return (
    <div className={className ? `${styles.root} ${className}` : styles.root} role="group" aria-label={ariaLabel}>
      {visible.map((filter) => (
        <FilterButton
          key={filter.id}
          size={size}
          value={filter.value}
          count={filter.count}
          open={openId === filter.id}
          onClick={() => onFilterClick?.(filter.id)}
        >
          {filter.label}
        </FilterButton>
      ))}
      {hidden.length > 0 ? (
        <DropdownMenu
          trigger={`+${hidden.length}`}
          ariaLabel={`${hidden.length} more filters`}
          size={size === "sm" ? "sm" : "md"}
          appearance="outline"
          mode="neutral"
          groups={[
            {
              items: hidden.map((filter) => ({
                id: filter.id,
                label: filter.value ? `${filter.label}: ${filter.value}` : filter.label,
              })),
            },
          ]}
          onSelect={(id) => onFilterClick?.(id)}
        />
      ) : null}
      {onAdd ? (
        <Button appearance="outline" mode="neutral" size={size} iconStart="Plus" onClick={onAdd}>
          {addLabel}
        </Button>
      ) : null}
      {canClear && onClear ? (
        <Button appearance="ghost" mode="neutral" size={size} onClick={onClear}>
          {clearLabel}
        </Button>
      ) : null}
    </div>
  );
}
