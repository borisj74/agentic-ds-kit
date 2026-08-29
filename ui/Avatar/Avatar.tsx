"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import type { AvatarProps } from "./Avatar.types";
import styles from "./Avatar.module.css";

export type { AvatarProps, AvatarSize } from "./Avatar.types";

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

export function Avatar({ name, src, initials, size = "md" }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const label = resolveInitials(name, initials);
  const showImage = Boolean(src) && !failed;

  if (showImage) {
    return (
      <span className={`${styles.avatar} ${styles[size]}`}>
        <img className={styles.image} src={src} alt={name} onError={() => setFailed(true)} />
      </span>
    );
  }

  return (
    <span className={`${styles.avatar} ${styles[size]} ${styles.fallback}`} role="img" aria-label={name}>
      {label ? label : <User className={styles.icon} aria-hidden />}
    </span>
  );
}
