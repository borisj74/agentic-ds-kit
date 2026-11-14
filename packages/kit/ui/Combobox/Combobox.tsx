"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { filterOptions, firstEnabled, lastEnabled, nextEnabled } from "../shared/options";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
import controlStyles from "../shared/controls.module.css";
import type { ComboboxOption, ComboboxProps } from "./Combobox.types";
import styles from "./Combobox.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { ComboboxOption, ComboboxProps, ComboboxSize } from "./Combobox.types";

export function Combobox({
  id,
  size = "md",
  options,
  placeholder = "Search",
  disabled = false,
  error = false,
  value,
  defaultValue = "",
  onChange,
  onQueryChange,
  loading = false,
  emptyLabel = "No results",
  allowCustomValue = false,
  name,
  ariaLabel,
  describedBy,
  className,
  ref,
}: ComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const setInputRef = useMemo(() => mergeRefs(inputRef, ref), [ref]);
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = isControlled ? value : uncontrolled;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const remote = onQueryChange !== undefined;
  const shown = remote ? options : filterOptions(options, query);
  const selected = options.find((option) => option.value === current);
  const selectedLabel = selected?.label ?? (allowCustomValue ? current : "");
  const listKey = shown.map((option) => `${option.value}:${option.disabled ? "1" : "0"}`).join("|");
  const [seenKey, setSeenKey] = useState(listKey);

  if (seenKey !== listKey) {
    setSeenKey(listKey);
    const selectedIndex = shown.findIndex((option) => option.value === current && !option.disabled);
    setActive(selectedIndex >= 0 ? selectedIndex : firstEnabled(shown));
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

  function emit(next: string) {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  function commit(option: ComboboxOption) {
    emit(option.value);
    setOpen(false);
    setQuery("");
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => nextEnabled(shown, index, 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => nextEnabled(shown, index, -1));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setOpen(true);
      setActive(firstEnabled(shown));
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setActive(lastEnabled(shown));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = shown[active];
      if (option && !option.disabled) commit(option);
      else if (allowCustomValue && query.trim()) commit({ value: query.trim(), label: query.trim() });
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close("escape");
      return;
    }
    if (event.key === "Tab") setOpen(false);
  }

  const sizeClass = size === "sm" ? controlStyles.controlSm : controlStyles.controlMd;
  const activeId = open && active >= 0 ? `${listId}-${active}` : undefined;

  return (
    <div {...nisthaAttr("combobox")} ref={rootRef} className={cx(styles.root, className)}>
      {name ? <input type="hidden" name={name} value={current} /> : null}
      <div
        className={cx(controlStyles.control, sizeClass, error && controlStyles.controlError, styles.shell)}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
      >
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
          aria-activedescendant={activeId}
          aria-invalid={error || undefined}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-busy={loading || undefined}
          disabled={disabled}
          placeholder={open && selectedLabel ? selectedLabel : placeholder}
          value={open ? query : selectedLabel}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setOpen(true);
            onQueryChange?.(next);
          }}
          onKeyDown={onKeyDown}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-label={open ? "Hide suggestions" : "Show suggestions"}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((was) => !was)}
        >
          <ChevronsUpDown size={size === "sm" ? 14 : 16} strokeWidth={ICON_STROKE} aria-hidden />
        </button>
      </div>
      {open ? (
        <div className={styles.popup}>
          {loading || shown.length === 0 ? (
            <p className={styles.status} role="status">
              {loading ? "Loading" : emptyLabel}
            </p>
          ) : null}
          <ul id={listId} role="listbox" aria-label={ariaLabel ?? "Suggestions"} className={styles.list}>
            {shown.map((option, index) => {
              const isSelected = option.value === current;
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
                    if (!option.disabled) commit(option);
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
