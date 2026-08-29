"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/ui/Button";
import styles from "./ComponentDoc.module.css";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      /* ignore */
    }
  }, [code]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <div className={styles.codeWrap}>
      <pre className={styles.code}>
        <code>{code}</code>
      </pre>
      <div className={styles.copy}>
        <Button variant="secondary" size="sm" onClick={onCopy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
