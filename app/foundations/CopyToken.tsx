"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./EffectFoundations.module.css";

export function CopyToken({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      /* ignore */
    }
  }, [value]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <button type="button" className={styles.token} onClick={onCopy} title={`Copy ${value}`}>
      {copied ? "Copied ✓" : value}
    </button>
  );
}
