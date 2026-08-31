"use client";

import { useState } from "react";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./EffectFoundations.module.css";
import { CopyToken } from "./CopyToken";

type Tab = "primitives" | "semantics";

const SCALE = [
  { name: "0", note: "none" },
  { name: "100", note: "xs" },
  { name: "150", note: "soft-xs" },
  { name: "200", note: "sm" },
  { name: "250", note: "soft" },
  { name: "300", note: "md" },
  { name: "400", note: "lg" },
  { name: "500", note: "xl" },
  { name: "600", note: "2xl" },
] as const;

const ROLES = [
  { title: "Raised", code: "shadow-raised-*", tokens: [
    { name: "shadow-raised-sm", note: "sm" },
    { name: "shadow-raised-md", note: "md" },
    { name: "shadow-raised-lg", note: "lg" },
    { name: "shadow-raised-soft", note: "soft" },
    { name: "shadow-raised-depth", note: "glass rim; drop only in dark" },
  ]},
  { title: "Overlay", code: "shadow-overlay-*", tokens: [
    { name: "shadow-overlay-sm", note: "sm" },
    { name: "shadow-overlay-md", note: "md" },
    { name: "shadow-overlay-lg", note: "lg" },
  ]},
  { title: "Modal", code: "shadow-modal", tokens: [
    { name: "shadow-modal", note: "modal" },
  ]},
] as const;

export function ShadowFoundations() {
  const [tab, setTab] = useState<Tab>("semantics");
  return (
    <div className={colorStyles.colorSection}>
      <div className={colorStyles.tabList} role="tablist" aria-label="Shadow views">
        <button type="button" role="tab" aria-selected={tab === "semantics"} className={`${colorStyles.tab} ${tab === "semantics" ? colorStyles.tabActive : ""}`} onClick={() => setTab("semantics")}>Semantics</button>
        <button type="button" role="tab" aria-selected={tab === "primitives"} className={`${colorStyles.tab} ${tab === "primitives" ? colorStyles.tabActive : ""}`} onClick={() => setTab("primitives")}>Primitives</button>
      </div>
      <p className={colorStyles.lead}>Use semantic elevation roles in components. Primitives are the source shadow scale.</p>
      {tab === "semantics" ? (
        <div className={styles.sections}>
          {ROLES.map((family) => (
            <section key={family.title} className={styles.scale}>
              <header className={styles.header}>
                <h3 className={styles.title}>{family.title}</h3>
                <code className={styles.pattern}>{family.code}</code>
              </header>
              <div className={styles.list}>
                {family.tokens.map((token) => (
                  <div key={token.name} className={`${styles.row} ${styles.rowShadow}`}>
                    <CopyToken value={`--${token.name}`} />
                    <span className={styles.note}>{token.note}</span>
                    <div className={styles.swatchWide} style={{ boxShadow: `var(--${token.name})` }} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className={styles.scale}>
          <header className={styles.header}>
            <h3 className={styles.title}>Scale</h3>
            <code className={styles.pattern}>shadow-0 → shadow-600</code>
          </header>
          <div className={styles.list}>
            {SCALE.map((step) => (
              <div key={step.name} className={`${styles.row} ${styles.rowShadow}`}>
                <CopyToken value={`--shadow-${step.name}`} />
                <span className={styles.note}>{step.note}</span>
                <div className={styles.swatchWide} style={{ boxShadow: `var(--shadow-${step.name})` }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
