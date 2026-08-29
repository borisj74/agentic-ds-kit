"use client";

import { useCallback, useEffect, useState } from "react";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./SpacingFoundations.module.css";

type SpaceTab = "primitives" | "semantics";

const SCALE = [
  { name: "0", px: "0" },
  { name: "px", px: "2px" },
  { name: "1", px: "4px" },
  { name: "2", px: "8px" },
  { name: "3", px: "12px" },
  { name: "4", px: "16px" },
  { name: "5", px: "20px" },
  { name: "6", px: "24px" },
  { name: "8", px: "32px" },
  { name: "10", px: "40px" },
  { name: "12", px: "48px" },
  { name: "16", px: "64px" },
] as const;

const ROLES = [
  { title: "Inset", code: "space-inset-*", prefix: "inset", tokens: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] },
  { title: "Stack", code: "space-stack-*", prefix: "stack", tokens: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] },
  { title: "Inline", code: "space-inline-*", prefix: "inline", tokens: ["2xs", "xs", "sm", "md", "lg", "xl"] },
  { title: "Gap", code: "space-gap-*", prefix: "gap", tokens: ["xs", "sm", "md", "lg", "xl"] },
  { title: "Section", code: "space-section-*", prefix: "section", tokens: ["sm", "md", "lg"] },
] as const;

function CopyCode({ value }: { value: string }) {
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

export function SpacingFoundations() {
  const [tab, setTab] = useState<SpaceTab>("semantics");

  return (
    <div className={colorStyles.colorSection}>
      <div className={colorStyles.tabList} role="tablist" aria-label="Spacing views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "semantics"}
          className={`${colorStyles.tab} ${tab === "semantics" ? colorStyles.tabActive : ""}`}
          onClick={() => setTab("semantics")}
        >
          Semantics
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "primitives"}
          className={`${colorStyles.tab} ${tab === "primitives" ? colorStyles.tabActive : ""}`}
          onClick={() => setTab("primitives")}
        >
          Primitives
        </button>
      </div>

      <p className={colorStyles.lead}>
        Use semantic spacing roles in components. Primitives are the source scale.
      </p>

      {tab === "semantics" ? (
        <div className={styles.sections}>
          {ROLES.map((family) => (
            <section key={family.prefix} className={styles.scale}>
              <div className={colorStyles.hueHeader}>
                <h3 className={colorStyles.hueTitle}>{family.title}</h3>
                <code className={colorStyles.huePattern}>{family.code}</code>
              </div>
              <div className={styles.list}>
                {family.tokens.map((step) => {
                  const token = `space-${family.prefix}-${step}`;
                  return (
                    <div key={token} className={styles.row}>
                      <CopyCode value={token} />
                      <div className={styles.track}>
                        <div className={styles.bar} style={{ width: `var(--${token})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className={styles.scale}>
          <div className={colorStyles.hueHeader}>
            <h3 className={colorStyles.hueTitle}>Scale</h3>
            <code className={colorStyles.huePattern}>space-0 → space-16</code>
          </div>
          <div className={`${styles.list} ${styles.listPrimitive}`}>
            {SCALE.map((step) => {
              const token = `space-${step.name}`;
              return (
                <div key={token} className={`${styles.row} ${styles.rowPrimitive}`}>
                  <CopyCode value={token} />
                  <span className={styles.px}>{step.px}</span>
                  <div className={styles.track}>
                    <div className={styles.bar} style={{ width: `var(--${token})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
