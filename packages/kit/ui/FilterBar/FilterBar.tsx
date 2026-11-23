"use client";

import { useState } from "react";
import { Button } from "../Button";
import { Drawer } from "../Drawer";
import { DropdownMenu } from "../DropdownMenu";
import { FilterButton } from "../FilterButton";
import { Popover } from "../Popover";
import type { FilterBarFilter, FilterBarProps } from "./FilterBar.types";
import styles from "./FilterBar.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { FilterBarFilter, FilterBarProps, FilterBarSize } from "./FilterBar.types";

// FilterButton reads aria-haspopup from its rest props (Popover sets it the same way); a plain chip
// says menu, the Filters chip opens the sheet, a dialog.
const OPENS_DIALOG = { "aria-haspopup": "dialog" } as object;

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
  leading,
  renderSheet,
  onApply,
  applyLabel = "Apply",
  ariaLabel = "Filters",
  className,
}: FilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const overflow = maxVisible !== undefined && filters.length > maxVisible ? filters.length - maxVisible : 0;
  const visible = overflow > 0 ? filters.slice(0, maxVisible) : filters;
  const hidden = overflow > 0 ? filters.slice(maxVisible) : [];
  const setCount = filters.filter(isSet).length;
  const canClear = setCount > 0;
  const rootClass = [styles.root, renderSheet ? styles.collapsible : null, className].filter(Boolean).join(" ");

  return (
    <div {...nisthaAttr("filterbar")} className={rootClass} role="group" aria-label={ariaLabel}>
      <div className={styles.bar}>
        {leading ? <div className={styles.leading}>{leading}</div> : null}
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
            size={size}
            appearance="outline"
            mode="neutral"
            iconEnd="ChevronDown"
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
      {renderSheet ? (
        <div className={styles.compact}>
          <FilterButton size={size} count={setCount} open={sheetOpen} {...OPENS_DIALOG} onClick={() => setSheetOpen(true)}>
            {ariaLabel}
          </FilterButton>
          <Drawer
            open={sheetOpen}
            side="bottom"
            title={ariaLabel}
            description={setCount > 0 ? `${setCount} applied` : undefined}
            onClose={() => setSheetOpen(false)}
            footer={
              <>
                {onClear ? (
                  <Button appearance="outline" mode="neutral" size="lg" block onClick={onClear}>
                    {clearLabel}
                  </Button>
                ) : null}
                <Button
                  appearance="solid"
                  mode="primary"
                  size="lg"
                  block
                  onClick={() => {
                    onApply?.();
                    setSheetOpen(false);
                  }}
                >
                  {applyLabel}
                </Button>
              </>
            }
          >
            <div className={styles.sheet}>{renderSheet()}</div>
          </Drawer>
        </div>
      ) : null}
    </div>
  );
}
