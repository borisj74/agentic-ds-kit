"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenUsageTitle } from "./TokenUsage";
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

  const token = value.startsWith("--") ? value : `--${value}`;

  return (
    <button type="button" className={styles.token} onClick={onCopy} title={tokenUsageTitle(token)}>
      {copied ? "Copied ✓" : value}
    </button>
  );
}
