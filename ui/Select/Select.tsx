"use client";

import { useState } from "react";
import { DropdownMenu } from "@/ui/DropdownMenu";
import type { SelectProps } from "./Select.types";

export type { SelectProps, SelectOption, SelectSize, SelectItemCheck } from "./Select.types";

function optionId(value: string): string {
  return value === "" ? "__empty" : value;
}

function asList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function initialValue(
  multiple: boolean,
  placeholder: string | undefined,
  defaultValue: string | string[] | undefined,
  first: string | undefined,
): string | string[] {
  if (defaultValue !== undefined) return defaultValue;
  if (multiple) return [];
  if (placeholder) return "";
  return first ?? "";
}

export function Select({
  id,
  size = "md",
  options,
  disabled = false,
  error = false,
  multiple = false,
  itemCheck = "check",
  maxVisible,
  searchable = false,
  placeholder,
  defaultValue,
  value: valueProp,
  onChange,
  name,
  ariaLabel,
  describedBy,
}: SelectProps) {
  const [uncontrolled, setUncontrolled] = useState<string | string[]>(() =>
    initialValue(multiple, placeholder, defaultValue, options[0]?.value),
  );
  const isControlled = valueProp !== undefined;
  const raw = isControlled ? valueProp : uncontrolled;
  const values = asList(raw);
  const selectedOptions = options.filter((option) => values.includes(option.value));
  const overflow =
    multiple && maxVisible !== undefined && selectedOptions.length > maxVisible
      ? selectedOptions.length - maxVisible
      : 0;
  const shown = overflow > 0 ? selectedOptions.slice(0, maxVisible) : selectedOptions;
  const trigger =
    shown.length > 0 ? shown.map((option) => option.label).join(", ") : placeholder || "Select";
  const muted = selectedOptions.length === 0;
  const useCheckbox = multiple && itemCheck === "checkbox";

  function emit(next: string | string[]) {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  return (
    <>
      {name ? (
        <input type="hidden" name={name} value={multiple ? values.join(",") : (values[0] ?? "")} />
      ) : null}
      <DropdownMenu
        id={id}
        triggerStyle="field"
        trigger={trigger}
        triggerMuted={muted}
        triggerBadge={overflow > 0 ? `+${overflow}` : undefined}
        iconEnd="ChevronsUpDown"
        size={size === "sm" ? "sm" : "md"}
        disabled={disabled}
        error={error}
        describedBy={describedBy}
        ariaLabel={ariaLabel}
        closeOnSelect={!multiple}
        searchable={searchable}
        groups={[
          {
            items: options.map((option) => ({
              id: optionId(option.value),
              label: option.label,
              selected: values.includes(option.value),
              checkbox: useCheckbox || undefined,
            })),
          },
        ]}
        onSelect={(next) => {
          const match = options.find((option) => optionId(option.value) === next);
          if (!match) return;
          if (multiple) {
            const has = values.includes(match.value);
            emit(has ? values.filter((value) => value !== match.value) : [...values, match.value]);
            return;
          }
          emit(match.value);
        }}
      />
    </>
  );
}
