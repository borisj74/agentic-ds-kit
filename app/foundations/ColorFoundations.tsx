"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPrimitiveHex,
  labelToneOnHex,
  primitiveCssVar,
  primitiveTokenPattern,
  rgbStringToHex,
} from "./color-utils";
import styles from "./ColorFoundations.module.css";

type ColorTab = "primitives" | "semantics";

interface SemanticToken {
  name: string;
  var: string;
}

interface SemanticFamily {
  title: string;
  pattern: string;
  tokens?: SemanticToken[];
  subgroups?: { title: string; tokens: SemanticToken[] }[];
}

const PRIMITIVE_RAMPS: {
  hue: string;
  steps: readonly string[];
  single?: boolean;
}[] = [
  { hue: "neutral", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
  { hue: "blue", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
  { hue: "red", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
  { hue: "green", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
  { hue: "amber", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
  { hue: "white", steps: ["white"], single: true },
  { hue: "black", steps: ["black"], single: true },
];

const SEMANTIC_FAMILIES: SemanticFamily[] = [
  {
    title: "Text",
    pattern: "text-*",
    tokens: [
      { name: "text.primary", var: "--text-primary" },
      { name: "text.secondary", var: "--text-secondary" },
      { name: "text.muted", var: "--text-muted" },
      { name: "text.inverse", var: "--text-inverse" },
      { name: "text.danger", var: "--text-danger" },
      { name: "text.disabled", var: "--text-disabled" },
    ],
  },
  {
    title: "Surface",
    pattern: "surface-*",
    tokens: [
      { name: "surface.page", var: "--surface-page" },
      { name: "surface.card", var: "--surface-card" },
      { name: "surface.muted", var: "--surface-muted" },
      { name: "surface.overlay", var: "--surface-overlay" },
      { name: "surface.elevated", var: "--surface-elevated" },
      { name: "surface.disabled", var: "--surface-disabled" },
    ],
  },
  {
    title: "Border",
    pattern: "border-*",
    tokens: [
      { name: "border.faint", var: "--border-faint" },
      { name: "border.strong", var: "--border-strong" },
      { name: "border.focus", var: "--border-focus" },
      { name: "border.disabled", var: "--border-disabled" },
    ],
  },
  {
    title: "Status",
    pattern: "status-*",
    subgroups: [
      {
        title: "Ink",
        tokens: [
          { name: "status.success", var: "--status-success" },
          { name: "status.warning", var: "--status-warning" },
          { name: "status.danger", var: "--status-danger" },
          { name: "status.info", var: "--status-info" },
        ],
      },
      {
        title: "Subtle",
        tokens: [
          { name: "status.success-subtle", var: "--status-success-subtle" },
          { name: "status.warning-subtle", var: "--status-warning-subtle" },
          { name: "status.danger-subtle", var: "--status-danger-subtle" },
          { name: "status.info-subtle", var: "--status-info-subtle" },
        ],
      },
      {
        title: "Border",
        tokens: [
          { name: "status.success-border", var: "--status-success-border" },
          { name: "status.warning-border", var: "--status-warning-border" },
          { name: "status.danger-border", var: "--status-danger-border" },
          { name: "status.info-border", var: "--status-info-border" },
        ],
      },
    ],
  },
  {
    title: "Action",
    pattern: "action-*",
    tokens: [
      { name: "action.primary", var: "--action-primary" },
      { name: "action.primary-hover", var: "--action-primary-hover" },
      { name: "action.primary-pressed", var: "--action-primary-pressed" },
      { name: "action.on-primary", var: "--action-on-primary" },
      { name: "action.danger", var: "--action-danger" },
      { name: "action.danger-hover", var: "--action-danger-hover" },
      { name: "action.danger-pressed", var: "--action-danger-pressed" },
    ],
  },
  {
    title: "Disabled",
    pattern: "*.disabled",
    tokens: [
      { name: "text.disabled", var: "--text-disabled" },
      { name: "surface.disabled", var: "--surface-disabled" },
      { name: "border.disabled", var: "--border-disabled" },
    ],
  },
  {
    title: "Focus",
    pattern: "focus-*",
    tokens: [
      { name: "focus.ring", var: "--focus-ring" },
      { name: "focus.ring-offset", var: "--focus-ring-offset" },
      { name: "border.focus", var: "--border-focus" },
    ],
  },
  {
    title: "Icon",
    pattern: "icon-*",
    tokens: [
      { name: "icon.default", var: "--icon-default" },
      { name: "icon.muted", var: "--icon-muted" },
    ],
  },
];

function useCopyHex() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyHex = useCallback(async (hex: string, id: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  return { copiedId, copyHex };
}

interface PrimitiveChipProps {
  id: string;
  hue: string;
  step: string;
  single?: boolean;
  copiedId: string | null;
  onCopy: (hex: string, id: string) => void;
}

function PrimitiveChip({ id, hue, step, single, copiedId, onCopy }: PrimitiveChipProps) {
  const hex = getPrimitiveHex(hue, single ? undefined : step);
  const cssVar = primitiveCssVar(hue, single ? undefined : step);
  const label = single ? hue : step;
  const tone = labelToneOnHex(hex);
  const copied = copiedId === id;

  return (
    <button
      type="button"
      className={`${styles.chip} ${styles[`chipText${tone === "light" ? "Light" : "Dark"}`]} ${single ? styles.chipSingle : ""}`}
      style={{ backgroundColor: `var(${cssVar})` }}
      onClick={() => onCopy(hex, id)}
      aria-label={`Copy ${hex}`}
    >
      <span className={styles.chipStep}>{label}</span>
      <span className={styles.chipVar}>{cssVar}</span>
      <span className={styles.chipHex}>{copied ? "Copied ✓" : hex}</span>
    </button>
  );
}

interface SemanticChipProps {
  id: string;
  name: string;
  cssVar: string;
  copiedId: string | null;
  onCopy: (hex: string, id: string) => void;
}

function SemanticChip({ id, name, cssVar, copiedId, onCopy }: SemanticChipProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hex, setHex] = useState("");
  const [tone, setTone] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const bg = getComputedStyle(el).backgroundColor;
    const resolved = rgbStringToHex(bg);
    setHex(resolved);
    if (resolved.startsWith("#")) setTone(labelToneOnHex(resolved));
  }, []);

  const copied = copiedId === id;

  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.chip} ${styles.semanticChip} ${styles[`chipText${tone === "light" ? "Light" : "Dark"}`]}`}
      style={{ backgroundColor: `var(${cssVar})` }}
      onClick={() => hex && onCopy(hex, id)}
      aria-label={`Copy ${name}`}
    >
      <span className={styles.chipStep}>{name}</span>
      <span className={styles.chipVar}>{cssVar}</span>
      <span className={styles.chipHex}>{copied ? "Copied ✓" : hex || "…"}</span>
    </button>
  );
}

function SemanticChipRow({
  tokens,
  copiedId,
  onCopy,
}: {
  tokens: SemanticToken[];
  copiedId: string | null;
  onCopy: (hex: string, id: string) => void;
}) {
  return (
    <div className={styles.chipRow}>
      {tokens.map((token) => (
        <SemanticChip
          key={token.var}
          id={token.var}
          name={token.name}
          cssVar={token.var}
          copiedId={copiedId}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}

export function ColorFoundations() {
  const [tab, setTab] = useState<ColorTab>("semantics");
  const { copiedId, copyHex } = useCopyHex();

  return (
    <section className={styles.colorSection}>
      <div className={styles.tabList} role="tablist" aria-label="Color foundation views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "semantics"}
          className={`${styles.tab} ${tab === "semantics" ? styles.tabActive : ""}`}
          onClick={() => setTab("semantics")}
        >
          Semantics
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "primitives"}
          className={`${styles.tab} ${tab === "primitives" ? styles.tabActive : ""}`}
          onClick={() => setTab("primitives")}
        >
          Primitives
        </button>
      </div>

      {tab === "semantics" ? (
        <div className={styles.semantics} role="tabpanel">
          <p className={styles.lead}>
            Semantic roles from <code>lib/tokens.css</code>. Click a chip to copy its resolved hex.
            Components bind to these names only — never primitives.
          </p>
          {SEMANTIC_FAMILIES.map((family) => (
            <div key={family.title} className={styles.hueSection}>
              <div className={styles.hueHeader}>
                <h3 className={styles.hueTitle}>{family.title}</h3>
                <code className={styles.huePattern}>{family.pattern}</code>
              </div>
              {family.subgroups ? (
                family.subgroups.map((subgroup) => (
                  <div key={subgroup.title} className={styles.subgroup}>
                    <h4 className={styles.subgroupTitle}>{subgroup.title}</h4>
                    <SemanticChipRow tokens={subgroup.tokens} copiedId={copiedId} onCopy={copyHex} />
                  </div>
                ))
              ) : (
                <SemanticChipRow tokens={family.tokens ?? []} copiedId={copiedId} onCopy={copyHex} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.primitives} role="tabpanel">
          <p className={styles.lead}>
            Fixed palette ramps from <code>tokens/tokens.json</code>. Click a chip to copy its hex.
            Components map these through semantic roles — never use primitives directly.
          </p>
          {PRIMITIVE_RAMPS.map((ramp) => (
            <div key={ramp.hue} className={styles.hueSection}>
              <div className={styles.hueHeader}>
                <h3 className={styles.hueTitle}>{ramp.hue}</h3>
                <code className={styles.huePattern}>{primitiveTokenPattern(ramp.hue, ramp.single)}</code>
              </div>
              <div className={`${styles.chipRow} ${ramp.single ? styles.chipRowSingle : ""}`}>
                {ramp.steps.map((step) => {
                  const chipId = `${ramp.hue}-${step}`;
                  return (
                    <PrimitiveChip
                      key={chipId}
                      id={chipId}
                      hue={ramp.hue}
                      step={step}
                      single={ramp.single}
                      copiedId={copiedId}
                      onCopy={copyHex}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
