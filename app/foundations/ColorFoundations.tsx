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
  { hue: "violet", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
  { hue: "teal", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
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
      { name: "text.brand", var: "--text-brand" },
      { name: "text.success", var: "--text-success" },
      { name: "text.warning", var: "--text-warning" },
      { name: "text.danger", var: "--text-danger" },
      { name: "text.info", var: "--text-info" },
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
      { name: "surface.elevated", var: "--surface-elevated" },
      { name: "surface.overlay", var: "--surface-overlay" },
      { name: "surface.inverse", var: "--surface-inverse" },
      { name: "surface.brand", var: "--surface-brand" },
      { name: "surface.brand-subtle", var: "--surface-brand-subtle" },
      { name: "surface.disabled", var: "--surface-disabled" },
    ],
  },
  {
    title: "Fill",
    pattern: "fill-*",
    tokens: [
      { name: "fill.strong", var: "--fill-strong" },
      { name: "fill.subtle", var: "--fill-subtle" },
      { name: "fill.brand", var: "--fill-brand" },
      { name: "fill.brand-subtle", var: "--fill-brand-subtle" },
      { name: "fill.success", var: "--fill-success" },
      { name: "fill.success-subtle", var: "--fill-success-subtle" },
      { name: "fill.warning", var: "--fill-warning" },
      { name: "fill.warning-subtle", var: "--fill-warning-subtle" },
      { name: "fill.danger", var: "--fill-danger" },
      { name: "fill.danger-subtle", var: "--fill-danger-subtle" },
      { name: "fill.info", var: "--fill-info" },
      { name: "fill.info-subtle", var: "--fill-info-subtle" },
    ],
  },
  {
    title: "Border",
    pattern: "border-*",
    tokens: [
      { name: "border.subtle", var: "--border-subtle" },
      { name: "border.faint", var: "--border-faint" },
      { name: "border.strong", var: "--border-strong" },
      { name: "border.brand", var: "--border-brand" },
      { name: "border.focus", var: "--border-focus" },
      { name: "border.disabled", var: "--border-disabled" },
    ],
  },
  {
    title: "Icon",
    pattern: "icon-*",
    tokens: [
      { name: "icon.primary", var: "--icon-primary" },
      { name: "icon.secondary", var: "--icon-secondary" },
      { name: "icon.muted", var: "--icon-muted" },
      { name: "icon.inverse", var: "--icon-inverse" },
      { name: "icon.brand", var: "--icon-brand" },
      { name: "icon.success", var: "--icon-success" },
      { name: "icon.warning", var: "--icon-warning" },
      { name: "icon.danger", var: "--icon-danger" },
      { name: "icon.info", var: "--icon-info" },
      { name: "icon.disabled", var: "--icon-disabled" },
      { name: "icon.default", var: "--icon-default" },
    ],
  },
  {
    title: "Brand",
    pattern: "brand-*",
    tokens: [
      { name: "brand.primary", var: "--brand-primary" },
      { name: "brand.primary-hover", var: "--brand-primary-hover" },
      { name: "brand.primary-active", var: "--brand-primary-active" },
      { name: "brand.subtle", var: "--brand-subtle" },
      { name: "brand.on-brand", var: "--brand-on-brand" },
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
      { name: "action.secondary", var: "--action-secondary" },
      { name: "action.secondary-hover", var: "--action-secondary-hover" },
      { name: "action.secondary-pressed", var: "--action-secondary-pressed" },
      { name: "action.danger", var: "--action-danger" },
      { name: "action.danger-hover", var: "--action-danger-hover" },
      { name: "action.danger-pressed", var: "--action-danger-pressed" },
      { name: "action.selected", var: "--action-selected" },
      { name: "action.selected-border", var: "--action-selected-border" },
    ],
  },
  {
    title: "Link",
    pattern: "link-*",
    tokens: [
      { name: "link.default", var: "--link-default" },
      { name: "link.hover", var: "--link-hover" },
      { name: "link.visited", var: "--link-visited" },
      { name: "link.active", var: "--link-active" },
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
        title: "Text",
        tokens: [
          { name: "status.success-text", var: "--status-success-text" },
          { name: "status.warning-text", var: "--status-warning-text" },
          { name: "status.danger-text", var: "--status-danger-text" },
          { name: "status.info-text", var: "--status-info-text" },
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
    title: "Disabled",
    pattern: "*.disabled",
    tokens: [
      { name: "text.disabled", var: "--text-disabled" },
      { name: "icon.disabled", var: "--icon-disabled" },
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
      { name: "focus.ring-inverse", var: "--focus-ring-inverse" },
      { name: "border.focus", var: "--border-focus" },
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

function shortName(cssVar: string): string {
  const parts = cssVar.replace(/^--/, "").split("-");
  return parts.slice(1).join(" ");
}

function TokenChip({
  cssVar,
  copiedId,
  onCopy,
}: {
  cssVar: string;
  copiedId: string | null;
  onCopy: (value: string, id: string) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hex, setHex] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setHex(rgbStringToHex(getComputedStyle(el).backgroundColor));
  }, []);

  const copied = copiedId === cssVar;

  return (
    <button
      type="button"
      className={styles.tokenChip}
      title={`Copy ${cssVar}`}
      onClick={() => onCopy(cssVar, cssVar)}
    >
      <span
        ref={ref}
        className={styles.tokenChipDot}
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <span className={styles.tokenChipBody}>
        <span className={styles.tokenChipName}>{copied ? "Copied" : shortName(cssVar)}</span>
        <span className={styles.tokenChipMeta}>{hex || "…"}</span>
      </span>
    </button>
  );
}

function SemanticList({
  tokens,
  copiedId,
  onCopy,
}: {
  tokens: SemanticToken[];
  copiedId: string | null;
  onCopy: (value: string, id: string) => void;
}) {
  return (
    <div className={styles.tokenChipGrid}>
      {tokens.map((token) => (
        <TokenChip key={token.var} cssVar={token.var} copiedId={copiedId} onCopy={onCopy} />
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
            Start with the palette ramps, then map meaning through semantic roles.
            Click a chip to copy the CSS variable.
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
                    <SemanticList tokens={subgroup.tokens} copiedId={copiedId} onCopy={copyHex} />
                  </div>
                ))
              ) : (
                <SemanticList tokens={family.tokens ?? []} copiedId={copiedId} onCopy={copyHex} />
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
