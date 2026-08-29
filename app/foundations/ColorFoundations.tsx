"use client";

import { useEffect, useState } from "react";
import styles from "./ColorFoundations.module.css";

type Theme = "light" | "dark";
type ColorTab = "primitives" | "semantics";

const PRIMITIVE_RAMPS = [
  { hue: "white", steps: ["white"] as const, single: true },
  { hue: "black", steps: ["black"] as const, single: true },
  { hue: "neutral", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
  { hue: "blue", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
  { hue: "red", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
  { hue: "green", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
  { hue: "amber", steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const },
];

const SEMANTIC_GROUPS: { title: string; tokens: { name: string; var: string }[] }[] = [
  {
    title: "Text",
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
    title: "Icon",
    tokens: [
      { name: "icon.default", var: "--icon-default" },
      { name: "icon.muted", var: "--icon-muted" },
    ],
  },
  {
    title: "Surface",
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
    tokens: [
      { name: "border.faint", var: "--border-faint" },
      { name: "border.strong", var: "--border-strong" },
      { name: "border.focus", var: "--border-focus" },
      { name: "border.disabled", var: "--border-disabled" },
    ],
  },
  {
    title: "Status",
    tokens: [
      { name: "status.success", var: "--status-success" },
      { name: "status.success-subtle", var: "--status-success-subtle" },
      { name: "status.success-border", var: "--status-success-border" },
      { name: "status.warning", var: "--status-warning" },
      { name: "status.warning-subtle", var: "--status-warning-subtle" },
      { name: "status.warning-border", var: "--status-warning-border" },
      { name: "status.danger", var: "--status-danger" },
      { name: "status.danger-subtle", var: "--status-danger-subtle" },
      { name: "status.danger-border", var: "--status-danger-border" },
      { name: "status.info", var: "--status-info" },
      { name: "status.info-subtle", var: "--status-info-subtle" },
      { name: "status.info-border", var: "--status-info-border" },
    ],
  },
  {
    title: "Action",
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
    tokens: [
      { name: "text.disabled", var: "--text-disabled" },
      { name: "surface.disabled", var: "--surface-disabled" },
      { name: "border.disabled", var: "--border-disabled" },
    ],
  },
  {
    title: "Focus",
    tokens: [
      { name: "focus.ring", var: "--focus-ring" },
      { name: "focus.ring-offset", var: "--focus-ring-offset" },
      { name: "border.focus", var: "--border-focus" },
    ],
  },
];

function primitiveVar(hue: string, step: string, single?: boolean) {
  return single ? `var(--color-${hue})` : `var(--color-${hue}-${step})`;
}

function primitiveLabel(hue: string, step: string, single?: boolean) {
  return single ? `color.${hue}` : `color.${hue}.${step}`;
}

export function ColorFoundations() {
  const [tab, setTab] = useState<ColorTab>("primitives");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, [theme]);

  return (
    <section className={styles.colorSection}>
      <div className={styles.toolbar}>
        <div className={styles.tabList} role="tablist" aria-label="Color foundation views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "primitives"}
            className={`${styles.tab} ${tab === "primitives" ? styles.tabActive : ""}`}
            onClick={() => setTab("primitives")}
          >
            Primitives
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "semantics"}
            className={`${styles.tab} ${tab === "semantics" ? styles.tabActive : ""}`}
            onClick={() => setTab("semantics")}
          >
            Semantics
          </button>
        </div>
        <div className={styles.themeToggle} role="group" aria-label="Theme">
          <button
            type="button"
            className={`${styles.themeBtn} ${theme === "light" ? styles.themeBtnActive : ""}`}
            onClick={() => setTheme("light")}
          >
            Light
          </button>
          <button
            type="button"
            className={`${styles.themeBtn} ${theme === "dark" ? styles.themeBtnActive : ""}`}
            onClick={() => setTheme("dark")}
          >
            Dark
          </button>
        </div>
      </div>

      {tab === "primitives" ? (
        <div className={styles.primitives}>
          <p className={styles.lead}>
            Fixed palette ramps from <code>tokens/tokens.json</code>. Components never use these
            directly — they map meaning through semantic roles.
          </p>
          {PRIMITIVE_RAMPS.map((ramp) => (
            <div key={ramp.hue} className={styles.rampBlock}>
              <h3 className={styles.rampTitle}>{ramp.hue}</h3>
              <div className={styles.rampRow}>
                {ramp.steps.map((step) => (
                  <div key={step} className={styles.rampSwatch}>
                    <div
                      className={styles.rampColor}
                      style={{ backgroundColor: primitiveVar(ramp.hue, step, ramp.single) }}
                    />
                    <code className={styles.tokenName}>
                      {primitiveLabel(ramp.hue, step, ramp.single)}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.semantics}>
          <p className={styles.lead}>
            Semantic roles remapped per theme via <code>data-theme</code>. Same CSS variable names
            in light and dark — only values change.
          </p>
          {SEMANTIC_GROUPS.map((group) => (
            <div key={group.title} className={styles.group}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <div className={styles.swatches}>
                {group.tokens.map((token) => (
                  <div key={token.var} className={styles.swatch}>
                    <div
                      className={styles.swatchColor}
                      style={{ backgroundColor: `var(${token.var})` }}
                    />
                    <span className={styles.swatchLabel}>{token.name}</span>
                    <code className={styles.varName}>{token.var}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
