"use client";

import { LucideByName } from "../Button/lucideName";
import { Count } from "../Count";
import type { FilterButtonProps } from "./FilterButton.types";
import styles from "./FilterButton.module.css";

export type { FilterButtonProps, FilterButtonSize, FilterButtonToggle } from "./FilterButton.types";

const ICON_SIZE = { sm: 14, md: 16, lg: 18 } as const;

export function FilterButton({
  size = "md",
  open = false,
  disabled = false,
  count = 0,
  value,
  toggle,
  onToggle,
  hasDropdown = true,
  children,
  onClick,
}: FilterButtonProps) {
  const state = toggle ?? (count > 0 || value ? "on" : "none");
  const split = hasDropdown && state !== "none" && Boolean(onToggle);
  const className = [
    styles.filter,
    styles[size],
    state === "on" ? styles.applied : "",
    state === "off" ? styles.off : "",
    split ? styles.split : "",
  ]
    .filter(Boolean)
    .join(" ");

  const label = (
    <span className={styles.main}>
      {value ? (
        <span>
          <span className={styles.name}>{children}: </span>
          {value}
        </span>
      ) : (
        children
      )}
      {count > 0 ? (
        <Count
          count={count}
          size={size === "lg" ? "md" : "sm"}
          intent="neutral"
          label="filters applied"
          disabled={disabled}
        />
      ) : null}
    </span>
  );

  const chevron = (
    <span className={`${styles.icon}${open ? ` ${styles.iconOpen}` : ""}`}>
      <LucideByName name="ChevronDown" size={ICON_SIZE[size]} />
    </span>
  );

  if (!hasDropdown) {
    return (
      <button
        type="button"
        className={className}
        disabled={disabled}
        aria-pressed={state === "on"}
        onClick={onToggle ?? onClick}
      >
        {label}
      </button>
    );
  }

  if (split) {
    return (
      <span className={className}>
        <button type="button" className={styles.part} disabled={disabled} aria-pressed={state === "on"} onClick={onToggle}>
          {label}
        </button>
        <button
          type="button"
          className={`${styles.part} ${styles.chevron}`}
          disabled={disabled}
          aria-label={`${children} options`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={onClick}
        >
          {chevron}
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={onClick}
    >
      {label}
      <span className={styles.chevron} aria-hidden="true">
        {chevron}
      </span>
    </button>
  );
}
