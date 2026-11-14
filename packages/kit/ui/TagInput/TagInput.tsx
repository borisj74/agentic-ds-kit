"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Tag } from "../Tag";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
import controlStyles from "../shared/controls.module.css";
import type { TagInputProps } from "./TagInput.types";
import styles from "./TagInput.module.css";
import { useKitLabels } from "../shared/labels";
import { nisthaAttr } from "../shared/inspect";

export type { TagInputProps, TagInputSize } from "./TagInput.types";

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function TagInput({
  id,
  size = "md",
  value,
  defaultValue = [],
  onChange,
  placeholder = "Add a tag",
  disabled = false,
  error = false,
  suggestions = [],
  delimiters = [","],
  name,
  ariaLabel,
  describedBy,
  className,
  ref,
}: TagInputProps) {
  const labels = useKitLabels();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const setInputRef = useMemo(() => mergeRefs(inputRef, ref), [ref]);
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const tags = isControlled ? value : uncontrolled;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const matches = suggestions.filter((item) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return false;
    return item.toLowerCase().includes(needle) && !tags.some((tag) => normalize(tag) === normalize(item));
  });

  const close = useCallback(() => setOpen(false), []);
  useOverlayDismiss(open, rootRef, close);
  const safeActive = matches.length === 0 ? 0 : Math.min(active, matches.length - 1);

  useEffect(() => {
    if (!open || safeActive < 0) return;
    document.getElementById(`${listId}-${safeActive}`)?.scrollIntoView({ block: "nearest" });
  }, [open, safeActive, listId]);

  function emit(next: string[]) {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  function addMany(incoming: string[]) {
    const next = [...tags];
    for (const item of incoming) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      if (next.some((tag) => normalize(tag) === normalize(trimmed))) continue;
      next.push(trimmed);
    }
    if (next.length !== tags.length) emit(next);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const suggestionOpen = open && matches.length > 0;
    if (event.key === "ArrowDown" && suggestionOpen) {
      event.preventDefault();
      setActive((index) => (index + 1) % matches.length);
      return;
    }
    if (event.key === "ArrowUp" && suggestionOpen) {
      event.preventDefault();
      setActive((index) => (index - 1 + matches.length) % matches.length);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "Backspace" && query === "" && tags.length > 0) {
      emit(tags.slice(0, -1));
      return;
    }
    if (event.key === "Enter" || delimiters.includes(event.key)) {
      event.preventDefault();
      if (suggestionOpen && matches[safeActive]) addMany([matches[safeActive]]);
      else addMany([query]);
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    const pattern = new RegExp(`[${delimiters.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("")}\\n]`);
    if (!pattern.test(text)) return;
    event.preventDefault();
    addMany(text.split(pattern));
  }

  const sizeClass = size === "sm" ? controlStyles.controlSm : controlStyles.controlMd;
  const showList = open && matches.length > 0;

  return (
    <div {...nisthaAttr("taginput")} ref={rootRef} className={cx(styles.root, className)}>
      {name ? <input type="hidden" name={name} value={tags.join(",")} /> : null}
      <div
        className={cx(controlStyles.control, sizeClass, error && controlStyles.controlError, styles.shell)}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
      >
        {tags.map((tag) => (
          <Tag
            key={tag}
            size={size === "sm" ? "sm" : "md"}
            removable
            onRemove={(event) => {
              event.preventDefault();
              event.stopPropagation();
              emit(tags.filter((item) => item !== tag));
            }}
          >
            {tag}
          </Tag>
        ))}
        <input
          ref={setInputRef}
          id={id}
          className={styles.native}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listId}-${safeActive}` : undefined}
          aria-invalid={error || undefined}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : ""}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
        />
      </div>
      {showList ? (
        <ul id={listId} role="listbox" aria-label={labels.suggestions} className={styles.list}>
          {matches.map((item, index) => (
            <li
              key={item}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === safeActive}
              data-active={index === safeActive || undefined}
              className={styles.option}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => addMany([item])}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
