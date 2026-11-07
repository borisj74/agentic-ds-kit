"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Tag } from "../Tag";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { filterOptions, firstEnabled, lastEnabled, nextEnabled } from "../shared/options";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
import controlStyles from "../shared/controls.module.css";
import type { MultiSelectProps } from "./MultiSelect.types";
import styles from "./MultiSelect.module.css";

export type { MultiSelectOption, MultiSelectProps, MultiSelectSize } from "./MultiSelect.types";

export function MultiSelect({
  id,
  size = "md",
  options,
  value,
  defaultValue = [],
  onChange,
  placeholder = "Select",
  disabled = false,
  error = false,
  maxVisible,
  name,
  ariaLabel,
  describedBy,
  emptyLabel = "No results",
  className,
  ref,
}: MultiSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const setInputRef = useMemo(() => mergeRefs(inputRef, ref), [ref]);
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const values = isControlled ? value : uncontrolled;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const shown = filterOptions(options, query);
  const selected = options.filter((option) => values.includes(option.value));
  const overflow = maxVisible !== undefined && selected.length > maxVisible ? selected.length - maxVisible : 0;
  const visible = overflow > 0 ? selected.slice(0, maxVisible) : selected;
  const listKey = shown.map((option) => option.value).join("|");
  const [seenKey, setSeenKey] = useState(listKey);
  if (seenKey !== listKey) {
    setSeenKey(listKey);
    setActive(firstEnabled(shown));
  }

  const close = useCallback((reason: "escape" | "outside") => {
    setOpen(false);
    setQuery("");
    if (reason === "escape") inputRef.current?.focus();
  }, []);
  useOverlayDismiss(open, rootRef, close);

  useEffect(() => {
    if (!open || active < 0) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);

  function emit(next: string[]) {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  function toggle(optionValue: string) {
    emit(values.includes(optionValue) ? values.filter((item) => item !== optionValue) : [...values, optionValue]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => nextEnabled(shown, index, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => nextEnabled(shown, index, -1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setOpen(true);
      setActive(firstEnabled(shown));
    } else if (event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setActive(lastEnabled(shown));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = shown[active];
      if (option && !option.disabled) toggle(option.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close("escape");
    } else if (event.key === "Backspace" && query === "" && values.length > 0) {
      emit(values.slice(0, -1));
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  const sizeClass = size === "sm" ? controlStyles.controlSm : controlStyles.controlMd;

  return (
    <div ref={rootRef} className={cx(styles.root, className)}>
      {name ? <input type="hidden" name={name} value={values.join(",")} /> : null}
      <div
        className={cx(controlStyles.control, sizeClass, error && controlStyles.controlError, styles.shell)}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
      >
        {visible.map((option) => (
          <Tag
            key={option.value}
            size={size === "sm" ? "sm" : "md"}
            removable
            onRemove={(event) => {
              event.preventDefault();
              event.stopPropagation();
              emit(values.filter((item) => item !== option.value));
            }}
          >
            {option.label}
          </Tag>
        ))}
        {overflow > 0 ? <Badge size="sm">{`+${overflow}`}</Badge> : null}
        <input
          ref={setInputRef}
          id={id}
          className={styles.native}
          role="combobox"
          type="text"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          aria-invalid={error || undefined}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          disabled={disabled}
          placeholder={values.length === 0 ? placeholder : ""}
          value={query}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      {open ? (
        <div className={styles.popup}>
          {shown.length === 0 ? (
            <p className={styles.status} role="status">
              {emptyLabel}
            </p>
          ) : null}
          <ul id={listId} role="listbox" aria-multiselectable="true" aria-label={ariaLabel ?? "Options"} className={styles.list}>
            {shown.map((option, index) => {
              const isSelected = values.includes(option.value);
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  data-active={index === active || undefined}
                  className={styles.option}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => {
                    if (!option.disabled) setActive(index);
                  }}
                  onClick={() => {
                    if (!option.disabled) toggle(option.value);
                  }}
                >
                  <span className={styles.check} aria-hidden>
                    {isSelected ? <Check size={14} strokeWidth={ICON_STROKE} /> : null}
                  </span>
                  {option.label}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
