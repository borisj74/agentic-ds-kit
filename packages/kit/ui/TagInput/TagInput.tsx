"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { CircleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
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
  maxTags,
  name,
  ariaLabel,
  describedBy,
  className,
  ref,
}: TagInputProps) {
  const labels = useKitLabels();
  const listId = useId();
  const noteId = `${listId}-note`;
  const countId = `${listId}-count`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const setInputRef = useMemo(() => mergeRefs(inputRef, ref), [ref]);
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const tags = isControlled ? value : uncontrolled;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  /** First Backspace on an empty query highlights the last tag; the second removes it. */
  const [pendingRemove, setPendingRemove] = useState(false);
  const [notice, setNotice] = useState<{ kind: "warning" | "hint"; text: string } | null>(null);
  const limit = maxTags !== undefined && maxTags > 0 ? Math.floor(maxTags) : undefined;
  const full = limit !== undefined && tags.length >= limit;
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
    let duplicate: string | undefined;
    let overLimit = false;
    for (const item of incoming) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      const existing = next.find((tag) => normalize(tag) === normalize(trimmed));
      if (existing) {
        duplicate ??= existing;
        continue;
      }
      if (limit !== undefined && next.length >= limit) {
        overLimit = true;
        continue;
      }
      next.push(trimmed);
    }
    if (next.length !== tags.length) emit(next);
    if (overLimit && limit !== undefined) setNotice({ kind: "warning", text: labels.tagLimit(limit) });
    else if (duplicate) setNotice({ kind: "warning", text: labels.tagExists(duplicate) });
    else setNotice(null);
    setPendingRemove(false);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const suggestionOpen = open && matches.length > 0;
    if (event.key !== "Backspace" && pendingRemove) {
      setPendingRemove(false);
      setNotice(null);
    }
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
      event.preventDefault();
      if (pendingRemove) {
        emit(tags.slice(0, -1));
        setPendingRemove(false);
        setNotice(null);
      } else {
        setPendingRemove(true);
        setNotice({ kind: "hint", text: labels.removeTagHint(tags[tags.length - 1]) });
      }
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

  const sizeClass =
    size === "sm" ? controlStyles.controlSm : size === "lg" ? controlStyles.controlLg : controlStyles.controlMd;
  const describedByIds = [describedBy, limit !== undefined ? countId : undefined, notice ? noteId : undefined]
    .filter(Boolean)
    .join(" ");
  const showList = open && matches.length > 0;

  return (
    <div {...nisthaAttr("taginput")} ref={rootRef} className={cx(styles.root, className)}>
      {name ? <input type="hidden" name={name} value={tags.join(",")} /> : null}
      <div
        className={cx(controlStyles.control, sizeClass, error && controlStyles.controlError, styles.shell)}
        data-size={size}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
      >
        {tags.map((tag, index) => (
          <Tag
            key={tag}
            size={size === "sm" ? "sm" : "md"}
            className={pendingRemove && index === tags.length - 1 ? styles.pendingTag : undefined}
            removable
            onRemove={(event) => {
              event.preventDefault();
              event.stopPropagation();
              emit(tags.filter((item) => item !== tag));
              setPendingRemove(false);
              setNotice(null);
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
          aria-describedby={describedByIds || undefined}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : ""}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPendingRemove(false);
            setNotice(null);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onBlur={() => {
            if (pendingRemove) {
              setPendingRemove(false);
              setNotice(null);
            }
          }}
        />
        {limit !== undefined ? (
          <span className={styles.count} data-full={full || undefined}>
            <span aria-hidden>
              {tags.length}/{limit}
            </span>
            <span id={countId} className={styles.srOnly}>
              {labels.tagCount(tags.length, limit)}
            </span>
          </span>
        ) : null}
      </div>
      <p id={noteId} className={styles.note} data-kind={notice?.kind} aria-live="polite">
        {notice?.kind === "warning" ? (
          <CircleAlert size={14} strokeWidth={ICON_STROKE} className={styles.noteIcon} aria-hidden />
        ) : null}
        {notice?.text}
      </p>
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
