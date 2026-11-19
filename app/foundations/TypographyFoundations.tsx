"use client";

import { useCallback, useEffect, useState } from "react";
import { FoundationTabList } from "./FoundationTabList";
import { TokenUsage, tokenUsageTitle } from "./TokenUsage";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./TypographyFoundations.module.css";

type TypeTab = "primitives" | "semantics";

const ROLES = [
  { id: "type.heading-1", size: "--type-size-heading-1", weight: "--type-weight-title", line: "--type-line-heading-1", tracking: "--type-tracking-heading-1", family: "--font-heading", sample: "Design with intent" },
  { id: "type.heading-2", size: "--type-size-heading-2", weight: "--type-weight-title", line: "--type-line-heading-2", tracking: "--type-tracking-heading-2", family: "--font-heading", sample: "Design with intent" },
  { id: "type.heading-3", size: "--type-size-heading-3", weight: "--type-weight-heading", line: "--type-line-heading-3", tracking: "--type-tracking-heading-3", family: "--font-heading", sample: "Design with intent" },
  { id: "type.heading-4", size: "--type-size-heading-4", weight: "--type-weight-heading", line: "--type-line-heading-4", tracking: "--type-tracking-heading-4", family: "--font-heading", sample: "Design with intent" },
  { id: "type.heading-5", size: "--type-size-heading-5", weight: "--type-weight-heading", line: "--type-line-heading-5", tracking: "--type-tracking-heading-5", family: "--font-heading", sample: "Design with intent" },
  { id: "type.ui-xl", size: "--type-size-ui-xl", weight: "--type-weight-heading", line: "--type-line-ui-xl", tracking: "--type-tracking-heading-5", family: "--font-body", sample: "Workspace settings" },
  { id: "type.ui-lg", size: "--type-size-ui-lg", weight: "--type-weight-label", line: "--type-line-ui-lg", family: "--font-body", sample: "Workspace settings" },
  { id: "type.ui-md", size: "--type-size-ui-md", weight: "--type-weight-label", line: "--type-line-ui-md", family: "--font-body", sample: "Workspace settings" },
  { id: "type.ui-sm", size: "--type-size-ui-sm", weight: "--type-weight-label", line: "--type-line-ui-sm", family: "--font-body", sample: "Workspace settings" },
  { id: "type.ui-xs", size: "--type-size-ui-xs", weight: "--type-weight-label", line: "--type-line-ui-xs", family: "--font-body", sample: "Workspace settings" },
  { id: "type.body-lg", size: "--type-size-body-lg", weight: "--type-weight-body", line: "--type-line-body-lg", family: "--font-body", sample: "Calm surfaces and precise type let the content lead.", block: true },
  { id: "type.body-md", size: "--type-size-body-md", weight: "--type-weight-body", line: "--type-line-body-md", family: "--font-body", sample: "Calm surfaces and precise type let the content lead.", block: true },
  { id: "type.body-sm", size: "--type-size-body-sm", weight: "--type-weight-body", line: "--type-line-body-sm", family: "--font-body", sample: "Calm surfaces and precise type let the content lead.", block: true },
  { id: "type.body-xs", size: "--type-size-body-xs", weight: "--type-weight-body", line: "--type-line-body-xs", family: "--font-body", sample: "Calm surfaces and precise type let the content lead.", block: true },
  { id: "type.overline-xs", size: "--type-size-overline-xs", weight: "--type-weight-overline", line: "--type-line-overline-xs", tracking: "--type-tracking-overline", family: "--type-family-overline", sample: "EYEBROWS / TABLE HEADS" },
] as const;

/** Marketing and landing pages only. Product screens keep the roles above. */
const MARKETING_ROLES = [
  { id: "type.display-hero", size: "--type-size-display-hero", weight: "--type-weight-display-hero", line: "--type-line-display-hero", tracking: "--type-tracking-display-hero", family: "--font-heading", sample: "Agents you can trust" },
  { id: "type.title-section", size: "--type-size-title-section", weight: "--type-weight-title-section", line: "--type-line-title-section", tracking: "--type-tracking-title-section", family: "--font-heading", sample: "Built for review, not guesswork" },
] as const;

const SEMANTIC_TRACKING = [
  { name: "--type-tracking-tight", sample: "Hero and section titles" },
  { name: "--type-tracking-snug", sample: "Bold page titles" },
  { name: "--type-tracking-wide", sample: "MARKETING OVERLINE" },
] as const;

/** Heading tracking tightens as size grows: -0.02em at 14–20px, -0.04em at 24–32px, -0.06em at 40px and up. */
const HEADING_TRACKING = [
  { name: "--type-tracking-heading", size: "--type-size-ui-md", value: "-0.02em · 14–20px" },
  { name: "--type-tracking-heading-5", size: "--type-size-heading-5", value: "-0.04em · 24px" },
  { name: "--type-tracking-heading-4", size: "--type-size-heading-4", value: "-0.04em · 32px" },
  { name: "--type-tracking-heading-3", size: "--type-size-heading-3", value: "-0.06em · 40px" },
  { name: "--type-tracking-heading-2", size: "--type-size-heading-2", value: "-0.06em · 48px" },
  { name: "--type-tracking-heading-1", size: "--type-size-heading-1", value: "-0.06em · 56px" },
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
  { name: "font-weight-heading", label: "heading · 550", value: 550 },
  { name: "font-weight-semibold", label: "semibold · 600", value: 600 },
  { name: "font-weight-bold", label: "bold · 700", value: 700 },
] as const;

const LINE_STEPS = [
  { name: "line-height-tight", value: "1.25" },
  { name: "line-height-normal", value: "1.5" },
  { name: "line-height-relaxed", value: "1.625" },
] as const;

const TRACKING_STEPS = [
  { name: "letter-spacing-compressed", label: "compressed · -0.06em", value: "-0.06em" },
  { name: "letter-spacing-condensed", label: "condensed · -0.04em", value: "-0.04em" },
  { name: "letter-spacing-tightest", label: "tightest · -0.03em", value: "-0.03em" },
  { name: "letter-spacing-tighter", label: "tighter · -0.02em", value: "-0.02em" },
  { name: "letter-spacing-tight", label: "tight · -0.01em", value: "-0.01em" },
  { name: "letter-spacing-normal", label: "normal · 0", value: "0" },
  { name: "letter-spacing-wide", label: "wide · 0.02em", value: "0.02em" },
  { name: "letter-spacing-caps", label: "caps · 0.06em", value: "0.06em" },
  { name: "letter-spacing-widest", label: "widest · 0.08em", value: "0.08em" },
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
    <button type="button" className={styles.token} onClick={onCopy} title={tokenUsageTitle(value.startsWith("--") ? value : `--${value}`)}>
      {copied ? "Copied ✓" : value}
    </button>
  );
}

export function TypographyFoundations() {
  const [tab, setTab] = useState<TypeTab>("primitives");

  return (
    <div className={colorStyles.colorSection}>
      <FoundationTabList value={tab} onChange={setTab} ariaLabel="Typography views" />

      <p className={colorStyles.lead}>
        Use semantic text styles in components. Primitives are the source type scale.
      </p>

      {tab === "semantics" ? (
        <section className={styles.scale}>
          <div className={colorStyles.hueHeader}>
            <h3 className={colorStyles.hueTitle}>Roles</h3>
            <code className={colorStyles.huePattern}>heading-1 → overline-xs</code>
          </div>
          <div className={styles.list}>
            {ROLES.map((role) => (
              <div key={role.id} className={`${styles.row} ${"block" in role && role.block ? styles.rowBlock : ""}`}>
                <div>
                  <CopyCode value={role.size} />
                  <TokenUsage token={role.size} compact />
                </div>
                <p
                  className={styles.specimen}
                  style={{
                    fontFamily: `var(${role.family})`,
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
          <div className={colorStyles.hueHeader}>
            <h3 className={colorStyles.hueTitle}>Marketing roles</h3>
            <code className={colorStyles.huePattern}>display-hero · title-section</code>
          </div>
          <p className={colorStyles.lead}>
            Marketing and landing pages only. Sizes step down at the md and sm grid breakpoints. Product screens keep the
            display and heading roles above.
          </p>
          <div className={styles.list}>
            {MARKETING_ROLES.map((role) => (
              <div key={role.id} className={styles.row}>
                <div>
                  <CopyCode value={role.size} />
                  <TokenUsage token={role.size} compact />
                </div>
                <p
                  className={styles.specimen}
                  style={{
                    fontFamily: `var(${role.family})`,
                    fontSize: `var(${role.size})`,
                    fontWeight: `var(${role.weight})`,
                    lineHeight: `var(${role.line})`,
                    letterSpacing: `var(${role.tracking})`,
                  }}
                >
                  {role.sample}
                </p>
              </div>
            ))}
          </div>
          <div className={colorStyles.hueHeader}>
            <h3 className={colorStyles.hueTitle}>Heading tracking</h3>
            <code className={colorStyles.huePattern}>type-tracking-heading · heading-5 → heading-1</code>
          </div>
          <p className={colorStyles.lead}>
            Geist headings use --font-weight-heading (550, a true variable-font weight between medium and semibold) and
            tighten as they grow. Body stays 400, labels and buttons 500, strong text in body copy 550 (--type-weight-strong).
          </p>
          <div className={styles.list}>
            {HEADING_TRACKING.map((step) => (
              <div key={step.name} className={styles.row}>
                <div>
                  <CopyCode value={step.name} />
                  <TokenUsage token={step.name} compact />
                </div>
                <p
                  className={styles.specimen}
                  title={step.value}
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: `var(${step.size})`,
                    fontWeight: "var(--type-weight-heading)",
                    letterSpacing: `var(${step.name})`,
                  }}
                >
                  Design with intent
                </p>
              </div>
            ))}
          </div>
          <div className={colorStyles.hueHeader}>
            <h3 className={colorStyles.hueTitle}>Tracking</h3>
            <code className={colorStyles.huePattern}>type-tracking-tight · snug · wide</code>
          </div>
          <div className={styles.list}>
            {SEMANTIC_TRACKING.map((step) => (
              <div key={step.name} className={styles.row}>
                <div>
                  <CopyCode value={step.name} />
                  <TokenUsage token={step.name} compact />
                </div>
                <p className={styles.specimen} style={{ letterSpacing: `var(${step.name})` }}>
                  {step.sample}
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
            <code className={colorStyles.huePattern}>heading · body · mono</code>
          </div>
          <div className={styles.familyPanel}>
            <CopyCode value="--font-heading" />
            <TokenUsage token="--font-heading" />
            <p className={styles.pangram} style={{ fontFamily: "var(--font-heading)", fontWeight: "var(--type-weight-heading)", letterSpacing: "var(--type-tracking-heading)" }}>
              Heading. The quick brown fox jumps over the lazy dog
            </p>
            <CopyCode value="--font-body" />
            <TokenUsage token="--font-body" />
            <p className={styles.pangram} style={{ fontFamily: "var(--font-body)" }}>
              Body. The quick brown fox jumps over the lazy dog
            </p>
            <CopyCode value="--font-mono" />
            <TokenUsage token="--font-mono" />
            <p className={styles.pangramMono} style={{ fontFamily: "var(--font-mono)" }}>
              Mono. The quick brown fox jumps over the lazy dog 0123456789
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
                    Nistha
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
                    Nistha
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
