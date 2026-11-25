"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Spinner } from "../Spinner";
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
  loadingLabel = "Loading",
  startLabel,
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
  // One popup state at a time: loading, then the start hint before any query, then no results.
  const popupState = loading ? "loading" : startLabel && query === "" ? "start" : shown.length === 0 ? "empty" : "list";
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
      const option = popupState === "list" ? shown[active] : undefined;
      if (option && !option.disabled) commit(option);
      else if (allowCustomValue && query.trim()) commit({ value: query.trim(), label: query.trim() });
      return;
    }
    // Closed, Escape is not this field's: let a parent Modal or Drawer close.
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close("escape");
      return;
    }
    if (event.key === "Tab") setOpen(false);
  }

  const sizeClass = size === "sm" ? controlStyles.controlSm : size === "lg" ? controlStyles.controlLg : controlStyles.controlMd;
  const shellSize = size === "sm" ? styles.shellSm : size === "lg" ? styles.shellLg : styles.shellMd;
  const activeId = open && popupState === "list" && active >= 0 ? `${listId}-${active}` : undefined;

  return (
    <div {...nisthaAttr("combobox")} ref={rootRef} className={cx(styles.root, className)}>
      {name ? <input type="hidden" name={name} value={current} /> : null}
      <div
        className={cx(controlStyles.control, sizeClass, error && controlStyles.controlError, styles.shell, shellSize)}
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
          <ChevronDown size={size === "lg" ? 18 : 16} strokeWidth={ICON_STROKE} aria-hidden />
        </button>
      </div>
      {open ? (
        <div className={styles.popup}>
          {popupState === "loading" ? (
            <div className={styles.status}>
              <Spinner size="sm" label={loadingLabel} />
            </div>
          ) : popupState !== "list" ? (
            <p className={styles.status} role="status">
              {popupState === "start" ? startLabel : emptyLabel}
            </p>
          ) : null}
          <ul
            id={listId}
            role="listbox"
            aria-label={ariaLabel ?? "Suggestions"}
            className={styles.list}
            hidden={popupState !== "list"}
          >
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
