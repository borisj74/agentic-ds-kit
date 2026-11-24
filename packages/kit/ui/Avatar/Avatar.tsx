"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import type { AvatarProps } from "./Avatar.types";
import { cx } from "../shared/cx";
import styles from "./Avatar.module.css";
import { nisthaAttr } from "../shared/inspect";
import { useKitLabels } from "../shared/labels";

export type { AvatarProps, AvatarSize, AvatarShape, AvatarPresence } from "./Avatar.types";

/** Fallback tints, picked from the name so the same person always gets the same one. */
const TINTS = ["tintPrimary", "tintInfo", "tintSuccess", "tintHighlight", "tintNeutral"] as const;

function tintFor(name: string): (typeof TINTS)[number] {
  let hash = 0;
  for (const ch of name.trim().toLowerCase()) hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

function lettersOf(value: string): string {
  return Array.from(value)
    .filter((ch) => /\p{L}/u.test(ch))
    .join("");
}

function deriveInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .map(lettersOf)
    .filter(Boolean);

  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  const first = words[0][0];
  const last = words[words.length - 1][0];
  return `${first}${last}`.toUpperCase();
}

function resolveInitials(name: string, initials?: string): string {
  if (initials !== undefined) {
    const override = lettersOf(initials).slice(0, 2).toUpperCase();
    if (override) return override;
  }
  return deriveInitials(name);
}

export function Avatar({
  name,
  src,
  initials,
  size = "md",
  shape = "circle",
  presence,
  className,
  ref,
  ...rest
}: AvatarProps) {
  const labels = useKitLabels();
  const [failed, setFailed] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setFailed(false);
  }

  const label = resolveInitials(name, initials);
  const showImage = Boolean(src) && !failed;
  const spoken = presence ? `${name}, ${labels[presence]}` : name;
  const rootClass = cx(styles.avatar, styles[size], shape === "square" && styles.square, className);
  const mark = presence ? <span className={cx(styles.presence, styles[presence])} aria-hidden /> : null;

  if (showImage) {
    return (
      <span {...rest} {...nisthaAttr("avatar", rest)} ref={ref} className={rootClass}>
        <img className={styles.image} src={src} alt={spoken} onError={() => setFailed(true)} />
        {mark}
      </span>
    );
  }

  return (
    <span
      {...rest} {...nisthaAttr("avatar", rest)}
      ref={ref}
      className={cx(rootClass, label ? styles[tintFor(name)] : styles.tintNeutral)}
      role="img"
      aria-label={spoken}
    >
      {label ? label : <User className={styles.icon} strokeWidth={ICON_STROKE} aria-hidden />}
      {mark}
    </span>
  );
}
