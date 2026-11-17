"use client";

import { Button } from "../Button";
import { DropdownMenu } from "../DropdownMenu";
import { FilterButton } from "../FilterButton";
import { Popover } from "../Popover";
import type { FilterBarFilter, FilterBarProps } from "./FilterBar.types";
import styles from "./FilterBar.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { FilterBarFilter, FilterBarProps, FilterBarSize } from "./FilterBar.types";

function isSet(filter: FilterBarFilter): boolean {
  return Boolean(filter.value) || (filter.count ?? 0) > 0;
}

export function FilterBar({
  filters,
  openId,
  onFilterClick,
  renderOptions,
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
    <div {...nisthaAttr("filterbar")} className={className ? `${styles.root} ${className}` : styles.root} role="group" aria-label={ariaLabel}>
      {visible.map((filter) => {
        const open = openId === filter.id;
        if (!renderOptions) {
          return (
            <FilterButton
              key={filter.id}
              size={size}
              value={filter.value}
              count={filter.count}
              open={open}
              onClick={() => onFilterClick?.(filter.id)}
            >
              {filter.label}
            </FilterButton>
          );
        }
        // The Popover toggles on click and closes on Escape or a click outside; each change is
        // reported as a click on the chip, so openId stays the one source of truth.
        return (
          <Popover
            key={filter.id}
            label={`${filter.label} filter`}
            open={open}
            onOpenChange={(next) => {
              if (next !== open) onFilterClick?.(filter.id);
            }}
            trigger={
              <FilterButton size={size} value={filter.value} count={filter.count} open={open}>
                {filter.label}
              </FilterButton>
            }
          >
            {renderOptions(filter.id)}
          </Popover>
        );
      })}
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
