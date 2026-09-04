"use client";

import { useCallback, useEffect, useState } from "react";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./TypographyFoundations.module.css";

type TypeTab = "primitives" | "semantics";

const ROLES = [
  {
    id: "type.display",
    size: "--type-size-display",
    weight: "--type-weight-title",
    line: "--type-line-heading",
    sample: "Agentic DS Kit",
  },
  {
    id: "type.title",
    size: "--type-size-title",
    weight: "--type-weight-title",
    line: "--type-line-heading",
    sample: "Design system foundations",
  },
  {
    id: "type.heading",
    size: "--type-size-heading",
    weight: "--type-weight-heading",
    line: "--type-line-heading",
    sample: "Typography semantics",
  },
  {
    id: "type.body",
    size: "--type-size-body",
    weight: "--type-weight-body",
    line: "--type-line-body",
    sample: "Body text carries the bulk of product copy. Keep size and leading on the semantic tokens.",
    block: true,
  },
  {
    id: "type.bodySm",
    size: "--type-size-body-sm",
    weight: "--type-weight-body",
    line: "--type-line-body",
    sample: "Supporting copy for denser UI, tables, and helper text.",
    block: true,
  },
  {
    id: "type.label",
    size: "--type-size-label",
    weight: "--type-weight-label",
    line: "--type-line-body",
    sample: "Form label",
  },
  {
    id: "type.metric",
    size: "--type-size-metric",
    weight: "--type-weight-metric",
    line: "--type-line-heading",
    sample: "$5,144,707.08",
    tabular: true,
  },
  {
    id: "type.caption",
    size: "--type-size-caption",
    weight: "--type-weight-caption",
    line: "--type-line-body",
    sample: "Caption or metadata under a control",
  },
  {
    id: "type.overline",
    size: "--type-size-overline",
    weight: "--type-weight-overline",
    line: "--type-line-heading",
    tracking: "--type-tracking-overline",
    sample: "Section meta",
  },
  {
    id: "type.code",
    size: "--type-size-code",
    weight: "--type-weight-code",
    line: "--type-line-body",
    family: "--font-mono",
    sample: "kit list typography",
  },
] as const;

const SIZE_STEPS = [
  { name: "font-size-xs", size: "0.75rem" },
  { name: "font-size-sm", size: "0.875rem" },
  { name: "font-size-base", size: "1rem" },
  { name: "font-size-lg", size: "1.125rem" },
  { name: "font-size-xl", size: "1.25rem" },
  { name: "font-size-2xl", size: "1.5rem" },
  { name: "font-size-3xl", size: "1.875rem" },
] as const;

const WEIGHT_STEPS = [
  { name: "font-weight-normal", label: "normal · 400", value: 400 },
  { name: "font-weight-medium", label: "medium · 500", value: 500 },
  { name: "font-weight-semibold", label: "semibold · 600", value: 600 },
  { name: "font-weight-bold", label: "bold · 700", value: 700 },
] as const;

const LINE_STEPS = [
  { name: "line-height-tight", value: "1.25" },
  { name: "line-height-normal", value: "1.5" },
  { name: "line-height-relaxed", value: "1.625" },
] as const;

const TRACKING_STEPS = [
  { name: "letter-spacing-normal", label: "normal · 0", value: "0" },
  { name: "letter-spacing-wide", label: "wide · 0.02em", value: "0.02em" },
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

export function TypographyFoundations() {
  const [tab, setTab] = useState<TypeTab>("semantics");

  return (
    <div className={colorStyles.colorSection}>
      <div className={colorStyles.tabList} role="tablist" aria-label="Typography views">
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
        Use semantic text styles in components. Primitives are the source type scale.
      </p>

      {tab === "semantics" ? (
        <section className={styles.scale}>
          <div className={colorStyles.hueHeader}>
            <h3 className={colorStyles.hueTitle}>Roles</h3>
            <code className={colorStyles.huePattern}>type.display → type.code</code>
          </div>
          <div className={styles.list}>
            {ROLES.map((role) => (
              <div key={role.id} className={`${styles.row} ${"block" in role && role.block ? styles.rowBlock : ""}`}>
                <CopyCode value={role.id} />
                <p
                  className={styles.specimen}
                  style={{
                    fontFamily: "family" in role && role.family ? `var(${role.family})` : "var(--font-sans)",
                    fontSize: `var(${role.size})`,
                    fontWeight: `var(${role.weight})`,
                    lineHeight: `var(${role.line})`,
                    letterSpacing: "tracking" in role && role.tracking ? `var(${role.tracking})` : undefined,
                    fontVariantNumeric: "tabular" in role && role.tabular ? "tabular-nums" : undefined,
                  }}
                >
                  {role.sample}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className={styles.sections}>
          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={colorStyles.hueTitle}>Family</h3>
              <code className={colorStyles.huePattern}>font-sans · font-mono</code>
            </div>
            <div className={styles.familyPanel}>
              <p className={styles.pangram} style={{ fontFamily: "var(--font-sans)" }}>
                IBM Plex Sans. The quick brown fox jumps over the lazy dog
              </p>
              <p className={styles.pangramMono} style={{ fontFamily: "var(--font-mono)" }}>
                IBM Plex Mono. The quick brown fox jumps over the lazy dog 0123456789
              </p>
            </div>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={colorStyles.hueTitle}>Size</h3>
              <code className={colorStyles.huePattern}>font-size-xs → 3xl</code>
            </div>
            <div className={styles.list}>
              {SIZE_STEPS.map((step) => (
                <div key={step.name} className={styles.row}>
                  <CopyCode value={step.name} />
                  <p className={styles.specimen} style={{ fontSize: step.size }}>
                    Agentic DS Kit
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={colorStyles.hueTitle}>Weight</h3>
              <code className={colorStyles.huePattern}>font-weight-*</code>
            </div>
            <div className={styles.list}>
              {WEIGHT_STEPS.map((step) => (
                <div key={step.name} className={styles.row}>
                  <CopyCode value={step.label} />
                  <p className={styles.specimen} style={{ fontWeight: step.value }}>
                    Agentic DS Kit
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={colorStyles.hueTitle}>Line height</h3>
              <code className={colorStyles.huePattern}>line-height-*</code>
            </div>
            <div className={styles.list}>
              {LINE_STEPS.map((step) => (
                <div key={step.name} className={`${styles.row} ${styles.rowBlock}`}>
                  <CopyCode value={step.name} />
                  <p className={styles.specimen} style={{ lineHeight: step.value }}>
                    Typography sets voice and hierarchy. Line height controls how dense or open
                    body text feels across layouts and components.
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={colorStyles.hueTitle}>Letter spacing</h3>
              <code className={colorStyles.huePattern}>letter-spacing-*</code>
            </div>
            <div className={styles.list}>
              {TRACKING_STEPS.map((step) => (
                <div key={step.name} className={styles.row}>
                  <CopyCode value={step.label} />
                  <p className={styles.specimen} style={{ letterSpacing: step.value }}>
                    Section meta
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
