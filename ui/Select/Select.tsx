"use client";

import { useState } from "react";
import { DropdownMenu } from "@/ui/DropdownMenu";
import type { SelectProps } from "./Select.types";

export type { SelectProps, SelectOption, SelectSize } from "./Select.types";

function optionId(value: string): string {
  return value === "" ? "__empty" : value;
}

export function Select({
  id,
  size = "md",
  options,
  disabled = false,
  error = false,
  defaultValue,
  name,
  ariaLabel,
  describedBy,
}: SelectProps) {
  const initial = defaultValue ?? options[0]?.value ?? "";
  const [value, setValue] = useState(initial);
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <DropdownMenu
        id={id}
        triggerStyle="field"
        trigger={selected?.label ?? "Select"}
        iconEnd="ChevronsUpDown"
        size={size === "sm" ? "sm" : "md"}
        disabled={disabled}
        error={error}
        describedBy={describedBy}
        ariaLabel={ariaLabel}
        groups={[
          {
            items: options.map((option) => ({
              id: optionId(option.value),
              label: option.label,
            })),
          },
        ]}
        onSelect={(next) => {
          const match = options.find((option) => optionId(option.value) === next);
          if (match) setValue(match.value);
        }}
      />
    </>
  );
}
