"use client";

import { Fragment, useRef, useState } from "react";
import { LucideByName } from "../Button/lucideName";
import type { InputOTPPattern, InputOTPProps, InputOTPSize } from "./InputOTP.types";
import styles from "./InputOTP.module.css";

export type { InputOTPProps, InputOTPSize, InputOTPPattern } from "./InputOTP.types";

const ICON_PX: Record<InputOTPSize, number> = { sm: 12, md: 16, lg: 18 };

function sanitize(raw: string, pattern: InputOTPPattern, length: number): string {
  const next =
    pattern === "digits"
      ? raw.replace(/\D/g, "")
      : raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return next.slice(0, length);
}

function resolveGroups(length: number, groups?: number[]): number[] {
  if (groups && groups.length > 0) {
    const sum = groups.reduce((total, count) => total + count, 0);
    if (sum === length) return groups;
  }
  if (length === 6) return [3, 3];
  return [length];
}

export function InputOTP({
  id,
  length = 6,
  groups,
  size = "md",
  disabled = false,
  error = false,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  pattern = "digits",
  name,
  autoComplete = "one-time-code",
  ariaLabel,
}: InputOTPProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = typeof value === "string";
  const [uncontrolled, setUncontrolled] = useState(() =>
    sanitize(defaultValue, pattern, length),
  );
  const current = sanitize(isControlled ? value : uncontrolled, pattern, length);
  const slotGroups = resolveGroups(length, groups);
  const activeIndex = current.length >= length ? length - 1 : current.length;
  const iconPx = ICON_PX[size];

  function commit(raw: string) {
    const next = sanitize(raw, pattern, length);
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
    if (next.length === length) onComplete?.(next);
  }

  function focusInput() {
    if (disabled) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const pos = current.length;
    el.setSelectionRange(pos, pos);
  }

  let offset = 0;

  return (
    <div
      className={`${styles.root} ${styles[size]}`}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
      onClick={focusInput}
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        className={styles.native}
        value={current}
        disabled={disabled}
        maxLength={length}
        autoComplete={autoComplete}
        autoCapitalize="off"
        spellCheck={false}
        inputMode={pattern === "digits" ? "numeric" : "text"}
        aria-invalid={error || undefined}
        aria-label={ariaLabel}
        onChange={(event) => commit(event.target.value)}
        onPaste={(event) => {
          event.preventDefault();
          commit(event.clipboardData.getData("text"));
        }}
      />
      {slotGroups.map((count, groupIndex) => {
        const start = offset;
        offset += count;
        return (
          <Fragment key={`group-${groupIndex}-${start}`}>
            {groupIndex > 0 ? (
              <span className={styles.separator} aria-hidden>
                <LucideByName name="Minus" size={iconPx} />
              </span>
            ) : null}
            <span className={styles.group}>
              {Array.from({ length: count }, (_, slotIndex) => {
                const index = start + slotIndex;
                const char = current[index];
                const isActive = index === activeIndex;
                return (
                  <span
                    key={index}
                    className={`${styles.slot}${isActive ? ` ${styles.slotActive}` : ""}`}
                    data-active={isActive || undefined}
                    aria-hidden
                  >
                    {char ? (
                      <span className={styles.char}>{char}</span>
                    ) : isActive ? (
                      <span className={styles.caret} />
                    ) : null}
                  </span>
                );
              })}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
