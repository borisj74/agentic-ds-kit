"use client";

import { useId } from "react";
import { X } from "lucide-react";
import { Avatar } from "../Avatar";
import { Checkbox } from "../Checkbox";
import { Count } from "../Count";
import type { TagProps } from "./Tag.types";
import styles from "./Tag.module.css";

export type { TagProps, TagSize, TagDotTone, TagAvatar } from "./Tag.types";

const ICON_SIZE = { sm: 12, md: 14, lg: 16 } as const;
const CHECKBOX_SIZE = { sm: "sm", md: "md", lg: "md" } as const;

/** First letter of the name; two letters do not fit the sm avatar legibly. */
function firstInitial(name: string): string | undefined {
  return Array.from(name).find((ch) => /\p{L}/u.test(ch));
}

export function Tag({
  children,
  size = "md",
  removable = false,
  onRemove,
  selectable = false,
  selected,
  defaultSelected = false,
  onSelectedChange,
  count,
  dot,
  avatar,
  disabled = false,
  id,
}: TagProps) {
  const generatedId = useId();
  const checkboxId = id ?? `tag-${generatedId}`;
  const iconPx = ICON_SIZE[size];

  const className = [
    styles.tag,
    styles[size],
    avatar && !selectable ? styles.avatarLead : "",
    disabled ? styles.disabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className} aria-disabled={disabled || undefined}>
      {selectable ? (
        <span className={styles.checkSlot}>
          <Checkbox
            id={checkboxId}
            ariaLabel={children}
            size={CHECKBOX_SIZE[size]}
            checked={selected}
            defaultChecked={defaultSelected}
            disabled={disabled}
            onChange={(next) => onSelectedChange?.(next)}
          />
        </span>
      ) : null}
      {dot ? <span className={`${styles.dot} ${styles[`dot-${dot}`]}`} aria-hidden /> : null}
      {avatar ? (
        <span className={styles.avatarSlot}>
          <Avatar
            name={avatar.name}
            src={avatar.src}
            initials={size === "sm" ? firstInitial(avatar.name) : undefined}
            size="sm"
          />
        </span>
      ) : null}
      {selectable ? (
        <label className={styles.text} htmlFor={checkboxId}>
          {children}
        </label>
      ) : (
        <span className={styles.text}>{children}</span>
      )}
      {typeof count === "number" ? <Count count={count} size="sm" intent="neutral" subtle disabled={disabled} /> : null}
      {removable ? (
        <button
          type="button"
          className={styles.remove}
          aria-label={`Remove ${children}`}
          disabled={disabled}
          onClick={(event) => {
            if (disabled) return;
            onRemove?.(event);
          }}
        >
          <X size={iconPx} color="currentColor" aria-hidden />
        </button>
      ) : null}
    </span>
  );
}
