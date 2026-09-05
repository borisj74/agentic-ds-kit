"use client";

import { useId, useState } from "react";
import type { SwitchProps } from "./Switch.types";
import styles from "./Switch.module.css";

export type { SwitchProps, SwitchSize } from "./Switch.types";

export function Switch({
  id,
  label,
  ariaLabel,
  size = "md",
  disabled = false,
  checked,
  defaultChecked = false,
  onChange,
  describedBy,
}: SwitchProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;
  const isControlled = typeof checked === "boolean";
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const isChecked = isControlled ? checked : uncontrolled;
  const [jelly, setJelly] = useState(false);

  function toggle() {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
    if (jelly) {
      setJelly(false);
      requestAnimationFrame(() => setJelly(true));
      return;
    }
    setJelly(true);
  }

  return (
    <div
      className={`${styles.switch} ${styles[size]}${label ? ` ${styles.labeled}` : ""}`}
      data-disabled={disabled || undefined}
    >
      {label ? (
        <label className={styles.label} htmlFor={switchId}>
          {label}
        </label>
      ) : null}
      <button
        type="button"
        role="switch"
        id={switchId}
        className={styles.control}
        aria-checked={isChecked}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={describedBy}
        disabled={disabled}
        data-jelly={jelly || undefined}
        onClick={toggle}
        onAnimationEnd={() => setJelly(false)}
      >
        <span className={styles.thumb} aria-hidden />
      </button>
    </div>
  );
}
