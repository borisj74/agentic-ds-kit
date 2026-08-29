"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Minus } from "lucide-react";
import type { CheckboxProps } from "./Checkbox.types";
import styles from "./Checkbox.module.css";

export type { CheckboxProps, CheckboxSize } from "./Checkbox.types";

const ICON_SIZE = { sm: 12, md: 14, lg: 16 } as const;

export function Checkbox({
  id,
  label,
  ariaLabel,
  size = "md",
  disabled = false,
  error = false,
  checked,
  defaultChecked = false,
  indeterminate = false,
  onChange,
  name,
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = typeof checked === "boolean";
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : uncontrolledChecked;
  const iconPx = ICON_SIZE[size];

  useEffect(() => {
    const el = inputRef.current;
    if (el) el.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  return (
    <label
      className={`${styles.label} ${styles[size]}`}
      htmlFor={id}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
    >
      <input
        ref={inputRef}
        className={styles.input}
        type="checkbox"
        id={id}
        name={name}
        disabled={disabled}
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        onChange={(event) => {
          if (!isControlled) setUncontrolledChecked(event.target.checked);
          onChange?.(event.target.checked);
        }}
        aria-label={label ? undefined : ariaLabel}
        aria-invalid={error || undefined}
        aria-checked={indeterminate ? "mixed" : undefined}
      />
      <span className={styles.box} aria-hidden>
        {indeterminate ? (
          <Minus size={iconPx} strokeWidth={2.5} color="currentColor" />
        ) : isChecked ? (
          <Check size={iconPx} strokeWidth={2.5} color="currentColor" />
        ) : null}
      </span>
      {label ? <span className={styles.text}>{label}</span> : null}
    </label>
  );
}
